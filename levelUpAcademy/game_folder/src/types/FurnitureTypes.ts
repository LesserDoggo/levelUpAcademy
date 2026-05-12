export interface GridPosition {
  x: number;
  y: number;
}

export interface FurnitureDefinition {
  itemId: string;
  name: string;
  price: number;
  spriteKey: string;
  spritePath: string;
  width: number;
  height: number;
  collision: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface RoomFurnitureItem {
  id?: string;
  itemId: string;
  x: number;
  y: number;
  rotation?: number;
}
