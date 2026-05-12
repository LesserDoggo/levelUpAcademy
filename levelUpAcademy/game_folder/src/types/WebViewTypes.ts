import type { PlayerClothes } from "./PlayerTypes";

export type NativeToGameMessage =
  | { type: "AUTH"; uid: string; coins?: number; clothes?: Partial<PlayerClothes>; firebaseCustomToken?: string }
  | { type: "SYNC_COINS"; coins: number }
  | { type: "SYNC_INVENTORY"; inventory: unknown }
  | { type: "SYNC_CLOTHES"; clothes: Partial<PlayerClothes> }
  | { type: "SYNC_ROOM_ITEMS"; roomItems: unknown }
  | { type: "START_PLACEMENT"; itemId: string };

export type GameToNativeMessage =
  | { type: "GAME_READY" }
  | { type: "COINS_CHANGED"; coins: number }
  | { type: "INVENTORY_CHANGED"; inventory: unknown }
  | { type: "CLOTHES_CHANGED"; clothes: PlayerClothes }
  | { type: "ROOM_ITEMS_CHANGED"; roomItems: unknown }
  | { type: "GAME_EVENT"; event: string; payload?: unknown }
  | { type: "ERROR"; message: string };

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    LevelUpGameBridge?: {
      postMessage: (message: string) => void;
    };
    LevelUpGameAssets?: Record<string, string>;
  }
}
