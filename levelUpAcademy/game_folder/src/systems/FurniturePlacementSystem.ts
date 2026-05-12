import Phaser from "phaser";
import { furnitureData } from "../data/furnitureData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { canPlaceItem } from "../utils/collision";
import { ROOM_ORIGIN_X, ROOM_ORIGIN_Y, TILE_HEIGHT, TILE_WIDTH, worldToGrid } from "../utils/grid";

export class FurniturePlacementSystem {
  private preview: Phaser.GameObjects.Image | null = null;
  private currentItemId: string | null = null;
  private currentGrid = { x: 0, y: 0 };
  private hasPosition = false;

  start(scene: Phaser.Scene, itemId: string) {
    this.cancel();
    const definition = furnitureData[itemId];
    this.currentItemId = itemId;
    this.preview = scene.add.image(0, 0, definition.spriteKey).setOrigin(0.5, 0.5).setAlpha(0.58);
    this.preview.setDisplaySize(definition.width * TILE_WIDTH, definition.height * TILE_HEIGHT);
    this.preview.setDepth(5000);
    this.preview.setVisible(false);
    this.hasPosition = false;
  }

  update(pointer: Phaser.Input.Pointer, roomItems: RoomFurnitureItem[]) {
    if (!this.preview || !this.currentItemId) return;
    const definition = furnitureData[this.currentItemId];
    this.currentGrid = worldToGrid(pointer.worldX, pointer.worldY);
    const world = {
      x: ROOM_ORIGIN_X + this.currentGrid.x * TILE_WIDTH + (definition.width * TILE_WIDTH) / 2,
      y: ROOM_ORIGIN_Y + this.currentGrid.y * TILE_HEIGHT + (definition.height * TILE_HEIGHT) / 2,
    };
    const valid = canPlaceItem(this.currentItemId, this.currentGrid, roomItems);
    this.hasPosition = true;
    this.preview.setVisible(true);
    this.preview.setPosition(world.x, world.y);
    this.preview.setTint(valid ? 0xffffff : 0xff5d6c);
    this.preview.setDisplaySize(definition.width * TILE_WIDTH, definition.height * TILE_HEIGHT);
  }

  confirm(roomItems: RoomFurnitureItem[]) {
    if (!this.currentItemId) return null;
    if (!this.hasPosition) return null;
    if (!canPlaceItem(this.currentItemId, this.currentGrid, roomItems)) return null;
    const item: RoomFurnitureItem = {
      id: `${this.currentItemId}-${Date.now()}`,
      itemId: this.currentItemId,
      x: this.currentGrid.x,
      y: this.currentGrid.y,
    };
    this.cancel();
    return item;
  }

  cancel() {
    this.preview?.destroy();
    this.preview = null;
    this.currentItemId = null;
    this.hasPosition = false;
  }

  isActive() {
    return Boolean(this.currentItemId);
  }
}
