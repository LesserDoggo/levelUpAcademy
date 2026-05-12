import { useGameStore } from "../store/gameStore";
import type { ClothingSlot, PlayerClothes } from "../types/PlayerTypes";

export class CharacterCustomizationSystem {
  canEquip(slot: ClothingSlot, itemId: string | null) {
    if (itemId === null) return true;
    return (useGameStore.getState().inventory.clothes[slot] ?? []).includes(itemId);
  }

  equip(slot: ClothingSlot, itemId: string | null) {
    if (!this.canEquip(slot, itemId)) return null;
    const current = useGameStore.getState().clothes[slot];
    const nextItemId = current === itemId ? null : itemId;
    return { [slot]: nextItemId } as Partial<PlayerClothes>;
  }
}
