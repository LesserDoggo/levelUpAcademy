import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import type { GridPosition } from "../types/FurnitureTypes";
import { collidesAt, canPlaceItem } from "../utils/collision";
import { isInsideRoom } from "../utils/grid";

export class CollisionSystem {
  canWalkTo(position: GridPosition, roomItems: RoomFurnitureItem[]) {
    return isInsideRoom(position) && !collidesAt(position, roomItems);
  }

  canPlace(itemId: string, position: GridPosition, roomItems: RoomFurnitureItem[]) {
    return canPlaceItem(itemId, position, roomItems);
  }
}
