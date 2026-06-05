import {
  PLAYER_FACE_GLASSES,
  PLAYER_HAT_RED,
  PLAYER_PANTS_JEANS_BLUE,
  PLAYER_SHIRT_HOODIE_BLACK,
  PLAYER_SHOES_SNEAKER_WHITE,
} from "../config/spritePaths";
import type { ClothingSlot, PlayerClothes } from "../types/PlayerTypes";

export const DEFAULT_CLOTHES: PlayerClothes = {
  hat: null,
  faceAccessory: null,
  shirt: null,
  pants: null,
  shoes: null,
};

export const clothingData: Record<
  string,
  { itemId: string; name: string; slot: ClothingSlot; price: number; spriteKey: string; spritePath: string }
> = {
  red_hat: {
    itemId: "red_hat",
    name: "Chapeu vermelho",
    slot: "hat",
    price: 40,
    spriteKey: "clothes_hat_red",
    spritePath: PLAYER_HAT_RED,
  },
  glasses: {
    itemId: "glasses",
    name: "Oculos",
    slot: "faceAccessory",
    price: 35,
    spriteKey: "clothes_face_glasses",
    spritePath: PLAYER_FACE_GLASSES,
  },
  hoodie_black: {
    itemId: "hoodie_black",
    name: "Moletom preto",
    slot: "shirt",
    price: 0,
    spriteKey: "clothes_shirt_hoodie_black",
    spritePath: PLAYER_SHIRT_HOODIE_BLACK,
  },
  jeans_blue: {
    itemId: "jeans_blue",
    name: "Jeans azul",
    slot: "pants",
    price: 0,
    spriteKey: "clothes_pants_jeans_blue",
    spritePath: PLAYER_PANTS_JEANS_BLUE,
  },
  sneaker_white: {
    itemId: "sneaker_white",
    name: "Tenis branco",
    slot: "shoes",
    price: 0,
    spriteKey: "clothes_shoes_sneaker_white",
    spritePath: PLAYER_SHOES_SNEAKER_WHITE,
  },
};
