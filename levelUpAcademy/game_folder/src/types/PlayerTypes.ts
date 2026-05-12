export type Direction = "up" | "down" | "left" | "right";
export type PlayerAnimation = "idle" | "walk";
export type ClothingSlot = "hat" | "faceAccessory" | "shirt" | "pants" | "shoes";

export interface PlayerClothes {
  hat: string | null;
  faceAccessory: string | null;
  shirt: string | null;
  pants: string | null;
  shoes: string | null;
}

export interface PlayerProfile {
  uid: string;
  coins: number;
  clothes: PlayerClothes;
}
