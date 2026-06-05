export interface GridPosition {
  x: number;
  y: number;
}

export type FurnitureDirection = "down" | "right" | "up" | "left";

export interface FurnitureSize {
  width: number;
  height: number;
}

export interface FurnitureCollision extends FurnitureSize {
  offsetX: number;
  offsetY: number;
}

export interface FurnitureRenderSize extends FurnitureSize {}

export interface FurnitureDefinition {
  itemId: string;
  name: string;
  price: number;
  spriteKey: string;
  spritePaths: Record<FurnitureDirection, string>;
  width: number;
  height: number;
  collision: FurnitureCollision;
  directionSizes?: Partial<Record<FurnitureDirection, FurnitureSize>>;
  directionCollisions?: Partial<Record<FurnitureDirection, FurnitureCollision>>;
  renderSizes?: Partial<Record<FurnitureDirection, FurnitureRenderSize>>;
}

export interface RoomFurnitureItem {
  id?: string;
  itemId: string;
  x: number;
  y: number;
  rotation?: number;
}
