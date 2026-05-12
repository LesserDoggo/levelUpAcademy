import Phaser from "phaser";
import { Player } from "../entities/Player";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import type { Direction } from "../types/PlayerTypes";
import { gridToWorld, worldToGrid } from "../utils/grid";
import { CollisionSystem } from "./CollisionSystem";

export class MovementSystem {
  private target: Phaser.Math.Vector2 | null = null;
  private speed = 190;
  private collision = new CollisionSystem();

  moveToPointer(player: Player, pointer: Phaser.Input.Pointer, roomItems: RoomFurnitureItem[]) {
    const grid = worldToGrid(pointer.worldX, pointer.worldY);
    if (!this.collision.canWalkTo(grid, roomItems)) {
      this.target = null;
      player.playLayered("idle", player.direction);
      return;
    }
    const world = gridToWorld(grid);
    this.target = new Phaser.Math.Vector2(world.x, world.y);
  }

  update(player: Player, delta: number, roomItems: RoomFurnitureItem[]) {
    if (!this.target) {
      player.playLayered("idle", player.direction);
      return;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, this.target.x, this.target.y);
    if (distance < 3) {
      this.target = null;
      player.playLayered("idle", player.direction);
      return;
    }

    const directionVector = new Phaser.Math.Vector2(this.target.x - player.x, this.target.y - player.y).normalize();
    const nextX = player.x + directionVector.x * this.speed * (delta / 1000);
    const nextY = player.y + directionVector.y * this.speed * (delta / 1000);
    const nextGrid = worldToGrid(nextX, nextY);

    if (!this.collision.canWalkTo(nextGrid, roomItems)) {
      this.target = null;
      player.playLayered("idle", player.direction);
      return;
    }

    player.setPosition(nextX, nextY);
    player.playLayered("walk", this.getDirection(directionVector));
  }

  private getDirection(vector: Phaser.Math.Vector2): Direction {
    if (Math.abs(vector.x) > Math.abs(vector.y)) return vector.x > 0 ? "right" : "left";
    return vector.y > 0 ? "down" : "up";
  }
}
