import Phaser from "phaser";
import { GRID_COLUMNS, GRID_ROWS, gridToWorld, TILE_HEIGHT, TILE_WIDTH } from "../utils/grid";

export class Room extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.drawFloor(scene);
  }

  private drawFloor(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0x243447, 0.18);
    graphics.fillStyle(0xd9c9a5, 1);

    const roomX = gridToWorld({ x: 0, y: 0 }).x - TILE_WIDTH / 2;
    const roomY = gridToWorld({ x: 0, y: 0 }).y - TILE_HEIGHT / 2;
    const roomWidth = GRID_COLUMNS * TILE_WIDTH;
    const roomHeight = GRID_ROWS * TILE_HEIGHT;

    graphics.fillRect(roomX, roomY, roomWidth, roomHeight);

    for (let x = 0; x <= GRID_COLUMNS; x += 1) {
      graphics.lineBetween(roomX + x * TILE_WIDTH, roomY, roomX + x * TILE_WIDTH, roomY + roomHeight);
    }
    for (let y = 0; y <= GRID_ROWS; y += 1) {
      graphics.lineBetween(roomX, roomY + y * TILE_HEIGHT, roomX + roomWidth, roomY + y * TILE_HEIGHT);
    }

    graphics.lineStyle(4, 0x243447, 1);
    graphics.strokeRect(roomX, roomY, roomWidth, roomHeight);
    graphics.setDepth(0);

    const wall = scene.add.rectangle(roomX + roomWidth / 2, 56, roomWidth, 98, 0x2f2146, 1);
    wall.setDepth(-10);
    const base = scene.add.rectangle(roomX + roomWidth / 2, 106, roomWidth, 22, 0x60519b, 1);
    base.setDepth(-9);
  }
}
