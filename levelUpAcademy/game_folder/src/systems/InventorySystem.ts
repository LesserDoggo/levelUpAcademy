import { useGameStore } from "../store/gameStore";
import type { InventoryState } from "../types/InventoryTypes";

export class InventorySystem {
  hasFurniture(itemId: string) {
    return (useGameStore.getState().inventory.furniture[itemId] ?? 0) > 0;
  }

  consumeFurniture(itemId: string): InventoryState {
    const current = useGameStore.getState().inventory;
    return {
      ...current,
      furniture: {
        ...current.furniture,
        [itemId]: Math.max(0, (current.furniture[itemId] ?? 0) - 1),
      },
    };
  }

  addFurniture(itemId: string): InventoryState {
    const current = useGameStore.getState().inventory;
    return {
      ...current,
      furniture: {
        ...current.furniture,
        [itemId]: (current.furniture[itemId] ?? 0) + 1,
      },
    };
  }
}
