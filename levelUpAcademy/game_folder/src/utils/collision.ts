import { furnitureData } from "../data/furnitureData";
import type { GridPosition, RoomFurnitureItem } from "../types/FurnitureTypes";
import { gridKey, isInsidePlayerSpawnArea, isInsideRoom } from "./grid";

export function occupiedCells(items: RoomFurnitureItem[], ignoredId?: string) {
  const cells = new Set<string>();

  for (const item of items) {
    if (item.id && item.id === ignoredId) continue;
    const definition = furnitureData[item.itemId];
    if (!definition) continue;

    for (let y = item.y; y < item.y + definition.collision.height; y += 1) {
      for (let x = item.x; x < item.x + definition.collision.width; x += 1) {
        cells.add(gridKey({ x, y }));
      }
    }
  }

  return cells;
}

export function canPlaceItem(itemId: string, position: GridPosition, items: RoomFurnitureItem[], ignoredId?: string) {
  const definition = furnitureData[itemId];
  if (!definition || !isInsideRoom(position, definition.width, definition.height)) return false;
  if (isInsidePlayerSpawnArea(position, definition.collision.width, definition.collision.height)) return false;

  const occupied = occupiedCells(items, ignoredId);
  for (let y = position.y; y < position.y + definition.collision.height; y += 1) {
    for (let x = position.x; x < position.x + definition.collision.width; x += 1) {
      if (occupied.has(gridKey({ x, y }))) return false;
    }
  }

  return true;
}

export function collidesAt(position: GridPosition, items: RoomFurnitureItem[]) {
  return occupiedCells(items).has(gridKey(position));
}
