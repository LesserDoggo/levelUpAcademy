import {
  BED_SIMPLE_DOWN_SPRITE,
  BED_SIMPLE_LEFT_SPRITE,
  BED_SIMPLE_RIGHT_SPRITE,
  BED_SIMPLE_UP_SPRITE,
  CHAIR_BLUE_DOWN_SPRITE,
  CHAIR_BLUE_LEFT_SPRITE,
  CHAIR_BLUE_RIGHT_SPRITE,
  CHAIR_BLUE_UP_SPRITE,
  PLANT_GREEN_DOWN_SPRITE,
  PLANT_GREEN_LEFT_SPRITE,
  PLANT_GREEN_RIGHT_SPRITE,
  PLANT_GREEN_UP_SPRITE,
  TABLE_WOOD_DOWN_SPRITE,
  TABLE_WOOD_LEFT_SPRITE,
  TABLE_WOOD_RIGHT_SPRITE,
  TABLE_WOOD_UP_SPRITE,
} from "../config/spritePaths";
import type { FurnitureDefinition, FurnitureDirection } from "../types/FurnitureTypes";
import { TILE_HEIGHT, TILE_WIDTH } from "../utils/grid";

export const FURNITURE_DIRECTIONS: FurnitureDirection[] = ["down", "right", "up", "left"];

export function getFurnitureDirection(rotation = 0): FurnitureDirection {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90) return "right";
  if (normalized === 180) return "up";
  if (normalized === 270) return "left";
  return "down";
}

export function getFurnitureSpriteKey(definition: FurnitureDefinition, rotation = 0) {
  return `${definition.spriteKey}_${getFurnitureDirection(rotation)}`;
}

export function getFurnitureSize(definition: FurnitureDefinition, rotation = 0) {
  return definition.directionSizes?.[getFurnitureDirection(rotation)] ?? { width: definition.width, height: definition.height };
}

export function getFurnitureCollision(definition: FurnitureDefinition, rotation = 0) {
  return definition.directionCollisions?.[getFurnitureDirection(rotation)] ?? definition.collision;
}

export function getFurnitureRenderSize(definition: FurnitureDefinition, rotation = 0) {
  const direction = getFurnitureDirection(rotation);
  const gridSize = getFurnitureSize(definition, rotation);
  return definition.renderSizes?.[direction] ?? { width: gridSize.width * TILE_WIDTH, height: gridSize.height * TILE_HEIGHT };
}

export const furnitureData: Record<string, FurnitureDefinition> = {
  bed_simple: {
    itemId: "bed_simple",
    name: "Cama simples",
    price: 45,
    spriteKey: "furniture_bed_simple",
    spritePaths: {
      down: BED_SIMPLE_DOWN_SPRITE,
      right: BED_SIMPLE_RIGHT_SPRITE,
      up: BED_SIMPLE_UP_SPRITE,
      left: BED_SIMPLE_LEFT_SPRITE,
    },
    width: 4,
    height: 3,
    collision: { width: 4, height: 3, offsetX: 0, offsetY: 0 },
    directionSizes: {
      down: { width: 3, height: 4 },
      up: { width: 3, height: 4 },
      right: { width: 4, height: 3 },
      left: { width: 4, height: 3 },
    },
    directionCollisions: {
      down: { width: 3, height: 4, offsetX: 0, offsetY: 0 },
      up: { width: 3, height: 4, offsetX: 0, offsetY: 0 },
      right: { width: 4, height: 3, offsetX: 0, offsetY: 0 },
      left: { width: 4, height: 3, offsetX: 0, offsetY: 0 },
    },
    renderSizes: {
      down: { width: 129, height: 216 },
      up: { width: 129, height: 216 },
      right: { width: 272, height: 162 },
      left: { width: 272, height: 162 },
    },
  },
  table_wood: {
    itemId: "table_wood",
    name: "Mesa de madeira",
    price: 25,
    spriteKey: "furniture_table_wood",
    spritePaths: {
      down: TABLE_WOOD_DOWN_SPRITE,
      right: TABLE_WOOD_RIGHT_SPRITE,
      up: TABLE_WOOD_UP_SPRITE,
      left: TABLE_WOOD_LEFT_SPRITE,
    },
    width: 3,
    height: 2,
    collision: { width: 3, height: 2, offsetX: 0, offsetY: 0 },
    directionSizes: {
      down: { width: 3, height: 2 },
      up: { width: 3, height: 2 },
      right: { width: 2, height: 3 },
      left: { width: 2, height: 3 },
    },
    directionCollisions: {
      down: { width: 3, height: 2, offsetX: 0, offsetY: 0 },
      up: { width: 3, height: 2, offsetX: 0, offsetY: 0 },
      right: { width: 2, height: 3, offsetX: 0, offsetY: 0 },
      left: { width: 2, height: 3, offsetX: 0, offsetY: 0 },
    },
    renderSizes: {
      down: { width: 204, height: 108 },
      up: { width: 204, height: 108 },
      right: { width: 108, height: 157 },
      left: { width: 108, height: 157 },
    },
  },
  chair_blue: {
    itemId: "chair_blue",
    name: "Cadeira azul",
    price: 15,
    spriteKey: "furniture_chair_blue",
    spritePaths: {
      down: CHAIR_BLUE_DOWN_SPRITE,
      right: CHAIR_BLUE_RIGHT_SPRITE,
      up: CHAIR_BLUE_UP_SPRITE,
      left: CHAIR_BLUE_LEFT_SPRITE,
    },
    width: 2,
    height: 2,
    collision: { width: 2, height: 2, offsetX: 0, offsetY: 0 },
    renderSizes: {
      down: { width: 136, height: 108 },
      up: { width: 136, height: 108 },
      right: { width: 86, height: 108 },
      left: { width: 86, height: 108 },
    },
  },
  plant_green: {
    itemId: "plant_green",
    name: "Planta",
    price: 20,
    spriteKey: "furniture_plant_green",
    spritePaths: {
      down: PLANT_GREEN_DOWN_SPRITE,
      right: PLANT_GREEN_RIGHT_SPRITE,
      up: PLANT_GREEN_UP_SPRITE,
      left: PLANT_GREEN_LEFT_SPRITE,
    },
    width: 2,
    height: 2,
    collision: { width: 2, height: 2, offsetX: 0, offsetY: 0 },
    renderSizes: {
      down: { width: 60, height: 93 },
      up: { width: 60, height: 93 },
      right: { width: 60, height: 93 },
      left: { width: 60, height: 93 },
    },
  },
};
