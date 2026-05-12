import type { ClothingSlot } from "./PlayerTypes";

export interface InventoryState {
  furniture: Record<string, number>;
  clothes: Partial<Record<ClothingSlot, string[]>>;
}

export type ShopItemType = "furniture" | "clothing";

export interface ShopItem {
  itemId: string;
  type: ShopItemType;
  slot?: ClothingSlot;
  price: number;
}
