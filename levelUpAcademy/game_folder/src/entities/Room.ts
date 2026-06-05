import Phaser from "phaser";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  PLAYER_SPAWN_RESERVED_AREA,
  gridToWorld,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "../utils/grid";

export class Room extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.drawFloor(scene);
  }

  private drawFloor(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0x3d1f1a, 0.18);
    graphics.fillStyle(0x874333, 1);

    const roomX = gridToWorld({ x: 0, y: 0 }).x - TILE_WIDTH / 2;
    const roomY = gridToWorld({ x: 0, y: 0 }).y - TILE_HEIGHT / 2;
    const roomWidth = GRID_COLUMNS * TILE_WIDTH;
    const roomHeight = GRID_ROWS * TILE_HEIGHT;

    graphics.fillRect(roomX, roomY, roomWidth, roomHeight);

    for (let y = 0; y < GRID_ROWS; y += 1) {
      for (let x = 0; x < GRID_COLUMNS; x += 1) {
        const color = (x + y) % 2 === 0 ? 0x914a38 : 0x7b3b2e;
        graphics.fillStyle(color, 0.22);
        graphics.fillRect(roomX + x * TILE_WIDTH, roomY + y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
      }
    }

    graphics.fillStyle(0x9a503d, 0.5);
    graphics.fillRect(
      roomX + PLAYER_SPAWN_RESERVED_AREA.x * TILE_WIDTH,
      roomY + PLAYER_SPAWN_RESERVED_AREA.y * TILE_HEIGHT,
      PLAYER_SPAWN_RESERVED_AREA.width * TILE_WIDTH,
      PLAYER_SPAWN_RESERVED_AREA.height * TILE_HEIGHT
    );

    for (let x = 0; x <= GRID_COLUMNS; x += 1) {
      graphics.lineBetween(roomX + x * TILE_WIDTH, roomY, roomX + x * TILE_WIDTH, roomY + roomHeight);
    }
    for (let y = 0; y <= GRID_ROWS; y += 1) {
      graphics.lineBetween(roomX, roomY + y * TILE_HEIGHT, roomX + roomWidth, roomY + y * TILE_HEIGHT);
    }

    graphics.lineStyle(3, 0x3d1f1a, 0.7);
    graphics.strokeRect(roomX, roomY, roomWidth, roomHeight);
    graphics.setDepth(0);

    const wall = scene.add.rectangle(roomX + roomWidth / 2, 56, roomWidth, 98, 0x2f2146, 1);
    wall.setDepth(-10);
    const base = scene.add.rectangle(roomX + roomWidth / 2, 106, roomWidth, 22, 0x60519b, 1);
    base.setDepth(-9);
  }
}
