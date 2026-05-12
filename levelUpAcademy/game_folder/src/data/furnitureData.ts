import {
  BED_SIMPLE_SPRITE,
  CHAIR_BLUE_SPRITE,
  PLANT_GREEN_SPRITE,
  TABLE_WOOD_SPRITE,
} from "../config/spritePaths";
import type { FurnitureDefinition } from "../types/FurnitureTypes";

export const furnitureData: Record<string, FurnitureDefinition> = {
  bed_simple: {
    itemId: "bed_simple",
    name: "Cama simples",
    price: 0,
    spriteKey: "furniture_bed_simple",
    spritePath: BED_SIMPLE_SPRITE,
    width: 4,
    height: 3,
    collision: { width: 4, height: 3, offsetX: 0, offsetY: 0 },
  },
  table_wood: {
    itemId: "table_wood",
    name: "Mesa de madeira",
    price: 25,
    spriteKey: "furniture_table_wood",
    spritePath: TABLE_WOOD_SPRITE,
    width: 3,
    height: 2,
    collision: { width: 3, height: 2, offsetX: 0, offsetY: 0 },
  },
  chair_blue: {
    itemId: "chair_blue",
    name: "Cadeira azul",
    price: 15,
    spriteKey: "furniture_chair_blue",
    spritePath: CHAIR_BLUE_SPRITE,
    width: 2,
    height: 2,
    collision: { width: 2, height: 2, offsetX: 0, offsetY: 0 },
  },
  plant_green: {
    itemId: "plant_green",
    name: "Planta",
    price: 20,
    spriteKey: "furniture_plant_green",
    spritePath: PLANT_GREEN_SPRITE,
    width: 2,
    height: 2,
    collision: { width: 2, height: 2, offsetX: 0, offsetY: 0 },
  },
};
