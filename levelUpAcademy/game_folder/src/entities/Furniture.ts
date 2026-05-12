import Phaser from "phaser";
import { furnitureData } from "../data/furnitureData";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { ROOM_ORIGIN_X, ROOM_ORIGIN_Y, TILE_HEIGHT, TILE_WIDTH } from "../utils/grid";

export class Furniture extends Phaser.GameObjects.Container {
  readonly item: RoomFurnitureItem;

  constructor(scene: Phaser.Scene, item: RoomFurnitureItem, onSelect?: (item: RoomFurnitureItem) => void) {
    const definition = furnitureData[item.itemId];
    const world = {
      x: ROOM_ORIGIN_X + item.x * TILE_WIDTH + (definition.width * TILE_WIDTH) / 2,
      y: ROOM_ORIGIN_Y + item.y * TILE_HEIGHT + (definition.height * TILE_HEIGHT) / 2,
    };
    super(scene, world.x, world.y);
    this.item = item;

    const sprite = scene.add.image(0, 0, definition.spriteKey);
    sprite.setOrigin(0.5, 0.5);
    sprite.setDisplaySize(definition.width * TILE_WIDTH, definition.height * TILE_HEIGHT);
    sprite.setAngle(item.rotation ?? 0);
    this.add(sprite);
    this.setSize(definition.width * TILE_WIDTH, definition.height * TILE_HEIGHT);
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -definition.width * TILE_WIDTH / 2,
        -definition.height * TILE_HEIGHT / 2,
        definition.width * TILE_WIDTH,
        definition.height * TILE_HEIGHT,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
    this.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      onSelect?.(item);
    });
    scene.add.existing(this);
  }
}
