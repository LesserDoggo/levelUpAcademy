import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GAME_ASSETS } from "@/constants/gameAssetMap";
import { GAME_HTML } from "@/constants/gameBundleHtml";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

type GameMessage =
  | { type: "GAME_READY" }
  | { type: "COINS_CHANGED"; coins: number }
  | { type: "INVENTORY_CHANGED"; inventory: unknown }
  | { type: "CLOTHES_CHANGED"; clothes: unknown }
  | { type: "ROOM_ITEMS_CHANGED"; roomItems: unknown }
  | { type: "GAME_EVENT"; event: string; payload?: unknown }
  | { type: "ERROR"; message: string };

type DirectPhaserGame = {
  destroy: (removeCanvas: boolean, noReturn?: boolean) => void;
  scale?: { refresh: () => void };
  canvas?: HTMLCanvasElement;
};

function formatGameEventPayload(payload: unknown) {
  if (!payload) return "";
  try {
    return ` ${JSON.stringify(payload)}`;
  } catch {
    return ` ${String(payload)}`;
  }
}

function getRenderDiagnosticSummary(payload: unknown) {
  if (!payload || typeof payload !== "object") return "render-diagnostics";
  const data = payload as {
    renderer?: string;
    objects?: number;
    canvas?: { cssWidth?: number; cssHeight?: number };
    parent?: { cssWidth?: number; cssHeight?: number };
  };

  const canvas = data.canvas ? `${data.canvas.cssWidth ?? 0}x${data.canvas.cssHeight ?? 0}` : "?x?";
  const parent = data.parent ? `${data.parent.cssWidth ?? 0}x${data.parent.cssHeight ?? 0}` : "?x?";
  return `render ${data.renderer ?? "?"} canvas ${canvas} parent ${parent} objs ${data.objects ?? 0}`;
}

function getGameUrl() {
  const extraUrl = Constants.expoConfig?.extra?.gameUrl as string | undefined;
  const envUrl = process.env.EXPO_PUBLIC_GAME_URL;
  if (envUrl) return envUrl;
  if (extraUrl) return extraUrl;
  return null;
}

const LOADING_STEPS = [
  "Preparando WebView...",
  "Carregando HTML embutido...",
  "Inicializando Phaser...",
  "Registrando cenas do jogo...",
  "Carregando sprites e UI...",
  "Abrindo comunicacao React Native <-> Phaser...",
  "Sincronizando sessao Firebase...",
  "Montando quarto do jogador...",
];

export default function GameScreen() {
  const webViewRef = useRef<WebView>(null);
  const directContainerRef = useRef<HTMLElement | null>(null);
  const directGameRef = useRef<DirectPhaserGame | null>(null);
  const directMountingRef = useRef(false);
  const directMountTokenRef = useRef(0);
  const directRetryRef = useRef<number | null>(null);
  const handleGameMessageRef = useRef<(rawData: string) => Promise<void> | void>(() => {});
  const sessionSyncedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const { user, dadosUsuario, recarregarDados } = useAuth();
  const [ready, setReady] = useState(false);
  const [lastEvent, setLastEvent] = useState("Carregando jogo...");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState<string[]>(["Aguardando a WebView montar."]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isDesktop = width >= 860;
  const shouldUseLandscapeCanvas = !isDesktop;
  const [gameFrame, setGameFrame] = useState({ width: 0, height: 0 });
  const gameUrl = useMemo(() => getGameUrl(), []);
  const webViewSource = useMemo(() => (gameUrl ? { uri: gameUrl } : { html: GAME_HTML, baseUrl: "" }), [gameUrl]);
  const shouldRenderDirectWeb = Platform.OS === "web";
  const [directContainerKey, setDirectContainerKey] = useState(0);

  const addLoadingDetail = useCallback((detail: string) => {
    setLoadingDetails((current) => [detail, ...current].slice(0, 5));
  }, []);

  useEffect(() => {
    if (ready) return;

    const interval = setInterval(() => {
      setLoadingStepIndex((current) => (current + 1) % LOADING_STEPS.length);
      setElapsedSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
    }, 900);

    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    if (ready) return;

    const timer = setTimeout(() => {
      addLoadingDetail(
        Platform.OS === "web"
          ? "Ainda sem GAME_READY. No Expo Web, o react-native-webview pode nao executar a ponte nativa; use Android/iOS para validar WebView real."
          : "Ainda sem GAME_READY. Verifique se app/gameBundleHtml.ts foi regenerado com npm run build:game.",
      );
    }, 8000);

    return () => clearTimeout(timer);
  }, [addLoadingDetail, ready]);

  const sendToGame = useCallback(
    (message: unknown) => {
      const payload = JSON.stringify(message);
      if (shouldRenderDirectWeb && typeof window !== "undefined") {
        window.dispatchEvent(new MessageEvent("levelup-native-message", { data: payload }));
        return;
      }
      webViewRef.current?.postMessage(payload);
    },
    [shouldRenderDirectWeb],
  );

  const loadGameData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const snapshot = await getDoc(doc(db, "usuarios", user.uid));
      const data = snapshot.data();
      if (data?.inventory) sendToGame({ type: "SYNC_INVENTORY", inventory: data.inventory });
      if (data?.clothes) sendToGame({ type: "SYNC_CLOTHES", clothes: data.clothes });
      if (data?.roomItems) sendToGame({ type: "SYNC_ROOM_ITEMS", roomItems: data.roomItems });
      addLoadingDetail("Dados do quarto carregados pelo app autenticado.");
    } catch (error) {
      addLoadingDetail("Nao foi possivel carregar usuarios/{uid}; usando estado local inicial.");
      console.warn("Erro ao carregar dados do jogo:", error);
    }
  }, [addLoadingDetail, sendToGame, user?.uid]);

  const syncSession = useCallback(async () => {
    sendToGame({
      type: "AUTH",
      uid: user?.uid ?? "guest",
      coins: dadosUsuario?.moedas ?? 0,
      firebaseCustomToken: undefined,
    });
    sendToGame({ type: "SYNC_COINS", coins: dadosUsuario?.moedas ?? 0 });
    await loadGameData();
  }, [dadosUsuario?.moedas, loadGameData, sendToGame, user]);

  const handleGameMessage = useCallback(
    async (rawData: string) => {
      try {
        const message = JSON.parse(rawData) as GameMessage;

        if (message.type === "GAME_READY") {
          setReady(true);
          setLastEvent("Jogo pronto");
          addLoadingDetail("Phaser enviou GAME_READY.");
          if (!sessionSyncedRef.current) {
            sessionSyncedRef.current = true;
            await syncSession();
          }
          return;
        }

        if (message.type === "COINS_CHANGED") {
          setLastEvent(`Moedas sincronizadas: ${message.coins}`);
          addLoadingDetail(`Moedas sincronizadas: ${message.coins}.`);
          if (user?.uid) await setDoc(doc(db, "usuarios", user.uid), { moedas: message.coins }, { merge: true });
          await recarregarDados();
          return;
        }

        if (message.type === "INVENTORY_CHANGED") {
          setLastEvent("Inventario atualizado");
          addLoadingDetail("Inventario atualizado pelo jogo.");
          if (user?.uid) await setDoc(doc(db, "usuarios", user.uid), { inventory: message.inventory }, { merge: true });
          return;
        }

        if (message.type === "CLOTHES_CHANGED") {
          setLastEvent("Roupas sincronizadas");
          addLoadingDetail("Roupas sincronizadas pelo jogo.");
          if (user?.uid) await setDoc(doc(db, "usuarios", user.uid), { clothes: message.clothes }, { merge: true });
          return;
        }

        if (message.type === "ROOM_ITEMS_CHANGED") {
          setLastEvent("Quarto salvo");
          addLoadingDetail("Room items salvos/sincronizados.");
          if (user?.uid) await setDoc(doc(db, "usuarios", user.uid), { roomItems: message.roomItems }, { merge: true });
          return;
        }

        if (message.type === "GAME_EVENT") {
          const payload = formatGameEventPayload(message.payload);
          addLoadingDetail(`Evento Phaser: ${message.event}.${payload}`);
          if (message.event === "render-diagnostics") {
            setLastEvent(getRenderDiagnosticSummary(message.payload));
            console.info("Diagnostico Phaser:", message.payload);
          } else {
            setLastEvent(message.event);
          }
          return;
        }

        if (message.type === "ERROR") {
          setLastEvent(message.message);
          addLoadingDetail(`Erro Phaser: ${message.message}`);
          console.warn("Phaser WebView error:", message.message);
        }
      } catch (error) {
        addLoadingDetail("Mensagem nao JSON ignorada pela ponte WebView.");
        if (!String(rawData).includes("FirebaseError")) {
          console.warn("Mensagem invalida recebida do jogo:", error);
        }
      }
    },
    [addLoadingDetail, recarregarDados, syncSession, user?.uid],
  );

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      await handleGameMessage(event.nativeEvent.data);
    },
    [handleGameMessage],
  );

  useEffect(() => {
    handleGameMessageRef.current = handleGameMessage;
  }, [handleGameMessage]);

  const clearDirectRetry = useCallback(() => {
    if (typeof window === "undefined" || directRetryRef.current === null) return;
    window.clearTimeout(directRetryRef.current);
    directRetryRef.current = null;
  }, []);

  const getDirectWebContainer = useCallback(() => {
    if (directContainerRef.current?.isConnected) return directContainerRef.current;

    const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-levelup-game-host='true']"));
    return candidates.find((candidate) => {
      if (!candidate.isConnected) return false;
      const bounds = candidate.getBoundingClientRect();
      return bounds.width >= 80 && bounds.height >= 80;
    }) ?? null;
  }, []);

  const destroyDirectWebGame = useCallback(() => {
    directMountTokenRef.current += 1;
    clearDirectRetry();
    try {
      directGameRef.current?.destroy(true);
    } catch (error) {
      console.warn("Erro ao destruir Phaser web:", error);
    }
    directGameRef.current = null;
    directMountingRef.current = false;
    sessionSyncedRef.current = false;
    if (typeof window !== "undefined") {
      delete window.LevelUpGameBridge;
      delete window.LevelUpGameAssets;
    }
  }, [clearDirectRetry]);

  const resetLoadingState = useCallback(() => {
    startedAtRef.current = Date.now();
    setReady(false);
    setElapsedSeconds(0);
    setLoadingStepIndex(0);
    setLastEvent("Carregando jogo...");
  }, []);

  const mountDirectWebGame = useCallback(async (attempt = 0) => {
    if (!shouldRenderDirectWeb || typeof window === "undefined") return;
    if (directMountingRef.current || directGameRef.current) return;

    const container = getDirectWebContainer();
    if (!container) {
      if (attempt < 40) {
        clearDirectRetry();
        directRetryRef.current = window.setTimeout(() => mountDirectWebGame(attempt + 1), 50);
      } else {
        addLoadingDetail("Container do jogo nao apareceu para montar o Phaser.");
      }
      return;
    }

    const bounds = container.getBoundingClientRect();
    if ((bounds.width < 80 || bounds.height < 80) && attempt < 40) {
      clearDirectRetry();
      directRetryRef.current = window.setTimeout(() => mountDirectWebGame(attempt + 1), 50);
      return;
    }

    directMountingRef.current = true;
    const token = directMountTokenRef.current + 1;
    directMountTokenRef.current = token;
    container.replaceChildren();
    resetLoadingState();

    window.LevelUpGameBridge = {
      postMessage: (message: string) => {
        handleGameMessageRef.current(message);
      },
    };
    window.LevelUpGameAssets = GAME_ASSETS;

    try {
      const { createLevelUpGame } = await import("../../game_folder/src/createPhaserGame");
      if (directMountTokenRef.current !== token || !container.isConnected) return;

      const game = createLevelUpGame(container);
      if (directMountTokenRef.current !== token || !container.isConnected) {
        game.destroy(true);
        return;
      }

      directGameRef.current = game;
      window.requestAnimationFrame(() => {
        if (game.canvas) {
          game.canvas.style.display = "block";
          game.canvas.style.width = "100%";
          game.canvas.style.height = "100%";
        }
        game.scale?.refresh();
      });
      addLoadingDetail("Phaser web montado diretamente no DOM.");
    } catch (error) {
      setLastEvent("Erro ao abrir Phaser web");
      addLoadingDetail(`Erro no Phaser direto: ${String(error)}`);
      console.warn("Erro ao montar Phaser direto:", error);
    } finally {
      directMountingRef.current = false;
    }
  }, [addLoadingDetail, clearDirectRetry, getDirectWebContainer, resetLoadingState, shouldRenderDirectWeb]);

  const reloadGame = useCallback(() => {
    resetLoadingState();
    addLoadingDetail("Recarregando jogo manualmente.");

    if (shouldRenderDirectWeb) {
      destroyDirectWebGame();
      directContainerRef.current = null;
      setDirectContainerKey((current) => current + 1);
      return;
    }

    sessionSyncedRef.current = false;
    webViewRef.current?.reload();
  }, [addLoadingDetail, destroyDirectWebGame, resetLoadingState, shouldRenderDirectWeb]);

  useEffect(() => {
    if (!shouldRenderDirectWeb) return;
    if (isFocused) {
      destroyDirectWebGame();
      setDirectContainerKey((current) => current + 1);
      return;
    }
    destroyDirectWebGame();
  }, [destroyDirectWebGame, isFocused, shouldRenderDirectWeb]);

  useEffect(() => {
    if (!shouldRenderDirectWeb || !isFocused) return;
    const timer = window.setTimeout(() => {
      mountDirectWebGame();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [directContainerKey, isFocused, mountDirectWebGame, shouldRenderDirectWeb]);

  useEffect(() => {
    return () => {
      if (shouldRenderDirectWeb) destroyDirectWebGame();
    };
  }, [destroyDirectWebGame, shouldRenderDirectWeb]);

  const handleGameFrameLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: frameWidth, height: frameHeight } = event.nativeEvent.layout;
    setGameFrame((current) => {
      const nextWidth = Math.round(frameWidth);
      const nextHeight = Math.round(frameHeight);
      if (current.width === nextWidth && current.height === nextHeight) return current;
      return { width: nextWidth, height: nextHeight };
    });
  }, []);

  const mobileLandscapeSurfaceStyle =
    shouldUseLandscapeCanvas && gameFrame.width > 0 && gameFrame.height > 0
      ? {
          position: "absolute" as const,
          width: gameFrame.height,
          height: gameFrame.width,
          left: (gameFrame.width - gameFrame.height) / 2,
          top: (gameFrame.height - gameFrame.width) / 2,
          transform: [{ rotate: "90deg" }],
        }
      : null;

  const gameSurfaceStyle = [styles.gameSurface, mobileLandscapeSurfaceStyle];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, !isDesktop && styles.headerMobile, isDesktop && styles.headerDesktop]}>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.title, !isDesktop && styles.titleMobile]}>Quarto do Gecko</Text>
          <Text style={styles.subtitle}>{lastEvent}</Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.coinBadge}>
            <MaterialCommunityIcons name="star-four-points-circle" size={18} color="#f4c95d" />
            <Text style={styles.coinText}>{dadosUsuario?.moedas ?? 0}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={reloadGame}>
            <MaterialCommunityIcons name="sync" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.webViewShell} onLayout={handleGameFrameLayout}>
        <View style={gameSurfaceStyle}>
          {shouldRenderDirectWeb ? (
            React.createElement("div", {
              key: directContainerKey,
              ref: (node: HTMLElement | null) => {
                directContainerRef.current = node;
              },
              "data-levelup-game-host": "true",
              id: `levelup-direct-phaser-game-${directContainerKey}`,
              style: styles.directGameHost,
            })
          ) : (
            <WebView
              ref={webViewRef}
              source={webViewSource}
              style={styles.webView}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              setSupportMultipleWindows={false}
              onMessage={handleMessage}
              onLoadEnd={() => {
                addLoadingDetail(gameUrl ? `WebView carregou URL: ${gameUrl}` : "WebView carregou HTML embutido.");
                if (!sessionSyncedRef.current) {
                  sessionSyncedRef.current = true;
                  syncSession();
                }
              }}
              onError={() => {
                setLastEvent("Nao foi possivel abrir o jogo");
                addLoadingDetail("onError da WebView foi disparado.");
                Alert.alert("Jogo offline", "Rode npm run build:game ou configure EXPO_PUBLIC_GAME_URL para desenvolvimento.");
              }}
            />
          )}
        </View>

        {!ready ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <MaterialCommunityIcons name="gamepad-variant" size={30} color="#bfc0d1" />
            <Text style={styles.loadingText}>{LOADING_STEPS[loadingStepIndex]}</Text>
            <Text style={styles.loadingSubtext}>Tempo aguardando GAME_READY: {elapsedSeconds}s</Text>
            <View style={styles.loadingLog}>
              {loadingDetails.map((detail, index) => (
                <Text key={`${detail}-${index}`} numberOfLines={2} style={styles.loadingLogText}>
                  {detail}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    padding: 6,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerDesktop: {
    paddingRight: 10,
  },
  headerMobile: {
    minHeight: 42,
    gap: 8,
  },
  headerTextBlock: {
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    color: "#bfc0d1",
    fontSize: 23,
    fontWeight: "900",
  },
  titleMobile: {
    fontSize: 18,
  },
  subtitle: {
    color: "#8792a2",
    fontSize: 13,
    marginTop: 2,
    maxWidth: 260,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  coinBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#243447",
    borderRadius: 8,
    paddingHorizontal: 10,
    maxWidth: 120,
  },
  coinText: {
    color: "#fff",
    fontWeight: "900",
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#60519b",
  },
  webViewShell: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#60519b",
    backgroundColor: "#0c101c",
  },
  webView: {
    flex: 1,
    backgroundColor: "#1c202c",
  },
  gameSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1c202c",
  },
  directGameContainer: {
    ...StyleSheet.absoluteFillObject,
    minWidth: 1,
    minHeight: 1,
    backgroundColor: "#1c202c",
  },
  directGameHost: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    minWidth: 1,
    minHeight: 1,
    overflow: "hidden",
    backgroundColor: "#1c202c",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(12,16,28,0.88)",
  },
  loadingText: {
    color: "#bfc0d1",
    fontWeight: "800",
    fontSize: 15,
    textAlign: "center",
  },
  loadingSubtext: {
    color: "#8792a2",
    fontSize: 12,
    textAlign: "center",
  },
  loadingLog: {
    width: "88%",
    maxWidth: 520,
    marginTop: 8,
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(191,192,209,0.25)",
    backgroundColor: "rgba(28,32,44,0.78)",
    padding: 10,
  },
  loadingLogText: {
    color: "#bfc0d1",
    fontSize: 11,
    lineHeight: 15,
  },
});
