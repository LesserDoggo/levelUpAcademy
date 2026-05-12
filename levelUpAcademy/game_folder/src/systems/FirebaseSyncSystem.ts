import { ensureGameAuth } from "../firebase/auth";
import { readUserGameData, writeUserGameData } from "../firebase/firestore";
import { useGameStore } from "../store/gameStore";
import type { InventoryState } from "../types/InventoryTypes";
import type { PlayerClothes } from "../types/PlayerTypes";
import { postToNative } from "../utils/webviewBridge";

export class FirebaseSyncSystem {
  private writesEnabled = false;

  async bootstrap(uidFromNative?: string, customToken?: string) {
    const user = await ensureGameAuth(customToken);
    this.writesEnabled = true;
    const uid = uidFromNative || user.uid;
    const data = await readUserGameData(uid);
    const store = useGameStore.getState();
    store.setUid(uid);
    store.setCoins(data.coins);
    store.setClothes(data.clothes);
    store.setInventory(data.inventory);
    store.setRoomItems(data.roomItems);
    postToNative({ type: "GAME_EVENT", event: "firebase-synced" });
  }

  async saveCoins(coins: number) {
    const uid = useGameStore.getState().uid;
    useGameStore.getState().setCoins(coins);
    postToNative({ type: "COINS_CHANGED", coins });
    if (uid && this.writesEnabled) await writeUserGameData(uid, { coins });
  }

  async saveInventory(inventory: InventoryState) {
    const uid = useGameStore.getState().uid;
    useGameStore.getState().setInventory(inventory);
    postToNative({ type: "INVENTORY_CHANGED", inventory });
    if (uid && this.writesEnabled) await writeUserGameData(uid, { inventory });
  }

  async saveClothes(clothes: Partial<PlayerClothes>) {
    const uid = useGameStore.getState().uid;
    useGameStore.getState().setClothes(clothes);
    const next = useGameStore.getState().clothes;
    postToNative({ type: "CLOTHES_CHANGED", clothes: next });
    if (uid && this.writesEnabled) await writeUserGameData(uid, { clothes: next });
  }

  async saveRoomItems() {
    const uid = useGameStore.getState().uid;
    const roomItems = useGameStore.getState().roomItems;
    postToNative({ type: "ROOM_ITEMS_CHANGED", roomItems });
    if (uid && this.writesEnabled) await writeUserGameData(uid, { roomItems });
  }
}
