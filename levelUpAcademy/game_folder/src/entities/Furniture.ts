import Phaser from "phaser";
import { furnitureData, getFurnitureRenderSize, getFurnitureSize, getFurnitureSpriteKey } from "../data/furnitureData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { ROOM_ORIGIN_X, ROOM_ORIGIN_Y, TILE_HEIGHT, TILE_WIDTH } from "../utils/grid";

export class Furniture extends Phaser.GameObjects.Container {
  readonly item: RoomFurnitureItem;

  constructor(scene: Phaser.Scene, item: RoomFurnitureItem, onSelect?: (item: RoomFurnitureItem) => void) {
    const definition = furnitureData[item.itemId];
    const size = getFurnitureSize(definition, item.rotation);
    const renderSize = getFurnitureRenderSize(definition, item.rotation);
    const world = {
      x: ROOM_ORIGIN_X + item.x * TILE_WIDTH + (size.width * TILE_WIDTH) / 2,
      y: ROOM_ORIGIN_Y + item.y * TILE_HEIGHT + (size.height * TILE_HEIGHT) / 2,
    };
    super(scene, world.x, world.y);
    this.item = item;

    const sprite = scene.add.image(0, 0, getFurnitureSpriteKey(definition, item.rotation));
    sprite.setOrigin(0.5, 0.5);
    sprite.setDisplaySize(renderSize.width, renderSize.height);
    sprite.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 1 });
    sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      onSelect?.(item);
    });
    this.add(sprite);
    this.setSize(size.width * TILE_WIDTH, size.height * TILE_HEIGHT);
    scene.add.existing(this);
  }
}
