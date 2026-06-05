import { create } from "zustand";
import { DEFAULT_CLOTHES } from "../data/clothingData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import type { InventoryState } from "../types/InventoryTypes";
import type { PlayerClothes } from "../types/PlayerTypes";

interface GameStore {
  uid: string | null;
  coins: number;
  clothes: PlayerClothes;
  inventory: InventoryState;
  roomItems: RoomFurnitureItem[];
  placementItemId: string | null;
  setUid: (uid: string | null) => void;
  setCoins: (coins: number) => void;
  setClothes: (clothes: Partial<PlayerClothes>) => void;
  setInventory: (inventory: InventoryState) => void;
  setRoomItems: (roomItems: RoomFurnitureItem[]) => void;
  startPlacement: (itemId: string) => void;
  stopPlacement: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  uid: null,
  coins: 0,
  clothes: DEFAULT_CLOTHES,
  inventory: {
    furniture: { table_wood: 1, chair_blue: 1, plant_green: 1, bed_simple: 0 },
    clothes: {
      shirt: ["hoodie_black"],
      pants: ["jeans_blue"],
      shoes: ["sneaker_white"],
      hat: ["red_hat"],
      faceAccessory: ["glasses"],
    },
  },
  roomItems: [{ id: "starter-bed", itemId: "bed_simple", x: 1, y: 1 }],
  placementItemId: null,
  setUid: (uid) => set({ uid }),
  setCoins: (coins) => set({ coins }),
  setClothes: (clothes) => set((state) => ({ clothes: { ...state.clothes, ...clothes } })),
  setInventory: (inventory) => set({ inventory }),
  setRoomItems: (roomItems) => set({ roomItems }),
  startPlacement: (itemId) => set({ placementItemId: itemId }),
  stopPlacement: () => set({ placementItemId: null }),
}));
