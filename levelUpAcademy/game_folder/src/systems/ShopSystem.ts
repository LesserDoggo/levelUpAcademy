import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";
import { useGameStore } from "../store/gameStore";
import type { ClothingSlot } from "../types/PlayerTypes";

export class ShopSystem {
  buyFurniture(itemId: string) {
    const definition = furnitureData[itemId];
    const state = useGameStore.getState();
    if (!definition || state.coins < definition.price) return null;
    return {
      coins: state.coins - definition.price,
      inventory: {
        ...state.inventory,
        furniture: {
          ...state.inventory.furniture,
          [itemId]: (state.inventory.furniture[itemId] ?? 0) + 1,
        },
      },
    };
  }

  buyClothing(itemId: string) {
    const definition = clothingData[itemId];
    const state = useGameStore.getState();
    if (!definition || state.coins < definition.price) return null;
    const slot = definition.slot as ClothingSlot;
    const owned = new Set(state.inventory.clothes[slot] ?? []);
    owned.add(itemId);
    return {
      coins: state.coins - definition.price,
      inventory: {
        ...state.inventory,
        clothes: {
          ...state.inventory.clothes,
          [slot]: Array.from(owned),
        },
      },
    };
  }
}
