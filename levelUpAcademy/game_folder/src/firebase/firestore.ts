import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { DEFAULT_CLOTHES } from "../data/clothingData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import type { InventoryState } from "../types/InventoryTypes";
import type { PlayerClothes } from "../types/PlayerTypes";
import { firestoreDb } from "./firebase";

export interface UserGameDocument {
  coins: number;
  clothes: PlayerClothes;
  inventory: InventoryState;
  roomItems: RoomFurnitureItem[];
}

const defaultInventory: InventoryState = {
  furniture: { table_wood: 1, chair_blue: 1, plant_green: 1 },
  clothes: {
    hat: ["red_hat"],
    faceAccessory: ["glasses"],
    shirt: ["hoodie_black"],
    pants: ["jeans_blue"],
    shoes: ["sneaker_white"],
  },
};

export async function readUserGameData(uid: string): Promise<UserGameDocument> {
  const gameSnapshot = await getDoc(doc(firestoreDb, "users", uid));
  const profileSnapshot = await getDoc(doc(firestoreDb, "usuarios", uid));
  const gameData = gameSnapshot.data() as Partial<UserGameDocument> | undefined;
  const profileData = profileSnapshot.data() as { moedas?: number } | undefined;

  return {
    coins: profileData?.moedas ?? gameData?.coins ?? 0,
    clothes: { ...DEFAULT_CLOTHES, ...gameData?.clothes },
    inventory: gameData?.inventory ?? defaultInventory,
    roomItems: gameData?.roomItems ?? [{ id: "starter-bed", itemId: "bed_simple", x: 1, y: 1 }],
  };
}

export async function writeUserGameData(uid: string, data: Partial<UserGameDocument>) {
  const { coins, ...gameData } = data;
  if (Object.keys(gameData).length > 0) {
    await setDoc(doc(firestoreDb, "users", uid), { ...gameData, updatedAt: serverTimestamp() }, { merge: true });
  }
  if (typeof coins === "number") {
    await setDoc(doc(firestoreDb, "usuarios", uid), { moedas: coins, updatedAt: serverTimestamp() }, { merge: true });
  }
}
