import Phaser from "phaser";
import { Furniture } from "../entities/Furniture";
import { Room } from "../entities/Room";
import type { RoomFurnitureItem } from "../types/FurnitureTypes";
import { DepthSystem } from "../systems/DepthSystem";

export class RoomManager {
  private room?: Room;
  private furniture: Furniture[] = [];
  private depthSystem = new DepthSystem();

  create(scene: Phaser.Scene) {
    this.room = new Room(scene);
  }

  renderItems(scene: Phaser.Scene, items: RoomFurnitureItem[]) {
    this.furniture.forEach((item) => item.destroy());
    this.furniture = items.map((item) => {
      const furniture = new Furniture(scene, item);
      this.depthSystem.update(furniture, 12);
      return furniture;
    });
  }
}
