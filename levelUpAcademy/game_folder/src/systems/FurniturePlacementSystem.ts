import Phaser from "phaser";
import { furnitureData, getFurnitureRenderSize, getFurnitureSize, getFurnitureSpriteKey } from "../data/furnitureData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { canPlaceItem } from "../utils/collision";
import { ROOM_ORIGIN_X, ROOM_ORIGIN_Y, TILE_HEIGHT, TILE_WIDTH, worldToGrid } from "../utils/grid";

export class FurniturePlacementSystem {
  private preview: Phaser.GameObjects.Image | null = null;
  private currentItemId: string | null = null;
  private currentGrid = { x: 0, y: 0 };
  private currentRotation = 0;
  private roomItems: RoomFurnitureItem[] = [];
  private hasPosition = false;

  start(scene: Phaser.Scene, itemId: string) {
    this.cancel();
    const definition = furnitureData[itemId];
    const renderSize = getFurnitureRenderSize(definition);
    this.currentItemId = itemId;
    this.currentRotation = 0;
    this.preview = scene.add.image(0, 0, getFurnitureSpriteKey(definition)).setOrigin(0.5, 0.5).setAlpha(0.58);
    this.preview.setDisplaySize(renderSize.width, renderSize.height);
    this.preview.setDepth(5000);
    this.preview.setVisible(false);
    this.hasPosition = false;
  }

  update(pointer: Phaser.Input.Pointer, roomItems: RoomFurnitureItem[]) {
    if (!this.preview || !this.currentItemId) return;
    this.roomItems = roomItems;
    this.updatePreview(pointer.worldX, pointer.worldY);
  }

  rotate() {
    if (!this.preview || !this.currentItemId) return;
    this.currentRotation = (this.currentRotation + 90) % 360;
    if (this.hasPosition) {
      this.refreshPreviewAtCurrentGrid();
      return;
    }

    this.applyPreviewSprite();
  }

  private updatePreview(worldX: number, worldY: number) {
    if (!this.preview || !this.currentItemId) return;
    const definition = furnitureData[this.currentItemId];
    const size = getFurnitureSize(definition, this.currentRotation);
    const renderSize = getFurnitureRenderSize(definition, this.currentRotation);
    this.currentGrid = worldToGrid(worldX, worldY);
    const world = this.getPreviewWorld(size);
    const valid = canPlaceItem(this.currentItemId, { ...this.currentGrid, rotation: this.currentRotation }, this.roomItems);
    this.hasPosition = true;
    this.preview.setVisible(true);
    this.preview.setPosition(world.x, world.y);
    this.preview.setTint(valid ? 0xffffff : 0xff5d6c);
    this.preview.setTexture(getFurnitureSpriteKey(definition, this.currentRotation));
    this.preview.setDisplaySize(renderSize.width, renderSize.height);
  }

  private refreshPreviewAtCurrentGrid() {
    if (!this.preview || !this.currentItemId) return;
    const definition = furnitureData[this.currentItemId];
    const size = getFurnitureSize(definition, this.currentRotation);
    const renderSize = getFurnitureRenderSize(definition, this.currentRotation);
    const world = this.getPreviewWorld(size);
    const valid = canPlaceItem(this.currentItemId, { ...this.currentGrid, rotation: this.currentRotation }, this.roomItems);

    this.preview.setPosition(world.x, world.y);
    this.preview.setTint(valid ? 0xffffff : 0xff5d6c);
    this.preview.setTexture(getFurnitureSpriteKey(definition, this.currentRotation));
    this.preview.setDisplaySize(renderSize.width, renderSize.height);
  }

  private getPreviewWorld(size: { width: number; height: number }) {
    return {
      x: ROOM_ORIGIN_X + this.currentGrid.x * TILE_WIDTH + (size.width * TILE_WIDTH) / 2,
      y: ROOM_ORIGIN_Y + this.currentGrid.y * TILE_HEIGHT + (size.height * TILE_HEIGHT) / 2,
    };
  }

  private applyPreviewSprite() {
    if (!this.preview || !this.currentItemId) return;
    const definition = furnitureData[this.currentItemId];
    const renderSize = getFurnitureRenderSize(definition, this.currentRotation);
    this.preview.setTexture(getFurnitureSpriteKey(definition, this.currentRotation));
    this.preview.setDisplaySize(renderSize.width, renderSize.height);
  }

  confirm(roomItems: RoomFurnitureItem[]) {
    if (!this.currentItemId) return null;
    if (!this.hasPosition) return null;
    if (!canPlaceItem(this.currentItemId, { ...this.currentGrid, rotation: this.currentRotation }, roomItems)) return null;
    const item: RoomFurnitureItem = {
      id: `${this.currentItemId}-${Date.now()}`,
      itemId: this.currentItemId,
      x: this.currentGrid.x,
      y: this.currentGrid.y,
      rotation: this.currentRotation,
    };
    this.cancel();
    return item;
  }

  cancel() {
    this.preview?.destroy();
    this.preview = null;
    this.currentItemId = null;
    this.currentRotation = 0;
    this.roomItems = [];
    this.hasPosition = false;
  }

  isActive() {
    return Boolean(this.currentItemId);
  }
}
