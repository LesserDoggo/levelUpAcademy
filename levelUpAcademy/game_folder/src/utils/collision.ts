import { furnitureData, getFurnitureCollision, getFurnitureSize } from "../data/furnitureData";
import type { GridPosition, RoomFurnitureItem } from "../types/FurnitureTypes";
import { gridKey, isInsidePlayerSpawnArea, isInsideRoom } from "./grid";

export function occupiedCells(items: RoomFurnitureItem[], ignoredId?: string) {
  const cells = new Set<string>();

  for (const item of items) {
    if (item.id && item.id === ignoredId) continue;
    const definition = furnitureData[item.itemId];
    if (!definition) continue;
    const collisionArea = getCollisionArea(item);

    for (let y = collisionArea.y; y < collisionArea.y + collisionArea.height; y += 1) {
      for (let x = collisionArea.x; x < collisionArea.x + collisionArea.width; x += 1) {
        cells.add(gridKey({ x, y }));
      }
    }
  }

  return cells;
}

export function canPlaceItem(
  itemId: string,
  position: GridPosition & Partial<Pick<RoomFurnitureItem, "rotation">>,
  items: RoomFurnitureItem[],
  ignoredId?: string,
) {
  const definition = furnitureData[itemId];
  if (!definition) return false;
  const size = getFurnitureSize(definition, position.rotation);
  if (!isInsideRoom(position, size.width, size.height)) return false;
  const collisionArea = getCollisionArea({ itemId, x: position.x, y: position.y, rotation: position.rotation });
  if (isInsidePlayerSpawnArea(collisionArea, collisionArea.width, collisionArea.height)) return false;

  const occupied = occupiedCells(items, ignoredId);
  for (let y = collisionArea.y; y < collisionArea.y + collisionArea.height; y += 1) {
    for (let x = collisionArea.x; x < collisionArea.x + collisionArea.width; x += 1) {
      if (occupied.has(gridKey({ x, y }))) return false;
    }
  }

  return true;
}

export function collidesAt(position: GridPosition, items: RoomFurnitureItem[]) {
  return occupiedCells(items).has(gridKey(position));
}

function getCollisionArea(item: Pick<RoomFurnitureItem, "itemId" | "x" | "y" | "rotation">) {
  const definition = furnitureData[item.itemId];
  const collision = getFurnitureCollision(definition, item.rotation);
  return {
    x: item.x + collision.offsetX,
    y: item.y + collision.offsetY,
    width: collision.width,
    height: collision.height,
  };
}
