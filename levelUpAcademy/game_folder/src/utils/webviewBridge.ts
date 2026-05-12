import type { GameToNativeMessage, NativeToGameMessage } from "../types/WebViewTypes";

export function postToNative(message: GameToNativeMessage) {
  const payload = JSON.stringify(message);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(payload);
    return;
  }
  window.LevelUpGameBridge?.postMessage(payload);
}

export function listenNativeMessages(callback: (message: NativeToGameMessage) => void) {
  const handler = (event: MessageEvent | Event) => {
    const data = "data" in event ? event.data : undefined;
    if (typeof data !== "string") return;
    try {
      callback(JSON.parse(data) as NativeToGameMessage);
    } catch {
      // Android WebView can emit internal non-JSON messages. They are unrelated
      // to the game bridge, so we ignore them instead of surfacing noisy errors.
    }
  };

  window.addEventListener("message", handler);
  document.addEventListener("message", handler);
  window.addEventListener("levelup-native-message", handler);
  return () => {
    window.removeEventListener("message", handler);
    document.removeEventListener("message", handler);
    window.removeEventListener("levelup-native-message", handler);
  };
}
