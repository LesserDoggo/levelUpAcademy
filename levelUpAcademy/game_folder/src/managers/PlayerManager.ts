import Phaser from "phaser";
import { Player } from "../entities/Player";
import type { PlayerClothes } from "../types/PlayerTypes";
import { gridToWorld } from "../utils/grid";
import { DepthSystem } from "../systems/DepthSystem";

export class PlayerManager {
  player?: Player;
  private depthSystem = new DepthSystem();

  create(scene: Phaser.Scene, clothes: PlayerClothes) {
    const start = gridToWorld({ x: 6, y: 6 });
    this.player = new Player(scene, start.x, start.y);
    this.player.setClothes(clothes);
    this.depthSystem.update(this.player);
    return this.player;
  }

  updateDepth() {
    if (this.player) this.depthSystem.update(this.player);
  }
}
