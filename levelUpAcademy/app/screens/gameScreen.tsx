import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GAME_ASSETS } from "@/constants/gameAssetMap";
import { GAME_HTML } from "@/constants/gameBundleHtml";
import { db } from "../config/firebaseConfig";
import { useAuth } from "../context/AuthContext";

type GameMessage =
  | { type: "GAME_READY" }
  | { type: "COINS_CHANGED"; coins: number }
  | { type: "INVENTORY_CHANGED"; inventory: unknown }
  | { type: "CLOTHES_CHANGED"; clothes: unknown }
  | { type: "ROOM_ITEMS_CHANGED"; roomItems: unknown }
  | { type: "GAME_EVENT"; event: string; payload?: unknown }
  | { type: "ERROR"; message: string };

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
  const directGameContainerRef = useRef<View>(null);
  const directGameRef = useRef<{ destroy: (removeCanvas: boolean, noReturn?: boolean) => void } | null>(null);
  const sessionSyncedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const { width } = useWindowDimensions();
  const { user, dadosUsuario, recarregarDados } = useAuth();
  const [ready, setReady] = useState(false);
  const [lastEvent, setLastEvent] = useState("Carregando jogo...");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState<string[]>(["Aguardando a WebView montar."]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isDesktop = width >= 860;
  const gameUrl = useMemo(() => getGameUrl(), []);
  const webViewSource = useMemo(() => (gameUrl ? { uri: gameUrl } : { html: GAME_HTML, baseUrl: "" }), [gameUrl]);
  const shouldRenderDirectWeb = Platform.OS === "web";

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
          setLastEvent(message.event);
          addLoadingDetail(`Evento Phaser: ${message.event}.`);
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
    if (!shouldRenderDirectWeb || typeof window === "undefined") return;
    if (directGameRef.current) return;

    window.LevelUpGameBridge = {
      postMessage: (message: string) => {
        handleGameMessage(message);
      },
    };
    window.LevelUpGameAssets = GAME_ASSETS;

    const mount = async () => {
      try {
        const container = document.getElementById("levelup-direct-phaser-game");
        if (!container) return;
        const { createLevelUpGame } = await import("../../game_folder/src/createPhaserGame");
        directGameRef.current = createLevelUpGame(container);
        addLoadingDetail("Phaser montado diretamente no DOM web.");
      } catch (error) {
        setLastEvent("Erro ao abrir Phaser web");
        addLoadingDetail(`Erro no Phaser direto: ${String(error)}`);
        console.warn("Erro ao montar Phaser direto:", error);
      }
    };

    mount();

    return () => {
      directGameRef.current?.destroy(true);
      directGameRef.current = null;
      delete window.LevelUpGameBridge;
      delete window.LevelUpGameAssets;
    };
  }, [addLoadingDetail, handleGameMessage, shouldRenderDirectWeb]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, !isDesktop && styles.headerMobile, isDesktop && styles.headerDesktop]}>
        <View>
          <Text style={[styles.title, !isDesktop && styles.titleMobile]}>Quarto do Gecko</Text>
          <Text style={styles.subtitle}>{lastEvent}</Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.coinBadge}>
            <MaterialCommunityIcons name="star-four-points-circle" size={18} color="#f4c95d" />
            <Text style={styles.coinText}>{dadosUsuario?.moedas ?? 0}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => sendToGame({ type: "SYNC_COINS", coins: dadosUsuario?.moedas ?? 0 })}>
            <MaterialCommunityIcons name="sync" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.webViewShell}>
        {shouldRenderDirectWeb ? (
          <View
            ref={directGameContainerRef}
            nativeID="levelup-direct-phaser-game"
            style={styles.directGameContainer}
          />
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
  },
  coinBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#243447",
    borderRadius: 8,
    paddingHorizontal: 10,
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
  directGameContainer: {
    flex: 1,
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
