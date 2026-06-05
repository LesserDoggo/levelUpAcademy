import Phaser from "phaser";
import { Player } from "../entities/Player";
import type { PlayerClothes } from "../types/PlayerTypes";
import { gridToWorld, PLAYER_SPAWN_POSITION } from "../utils/grid";
import { DepthSystem } from "../systems/DepthSystem";

export class PlayerManager {
  player?: Player;
  private depthSystem = new DepthSystem();

  create(scene: Phaser.Scene, clothes: PlayerClothes) {
    const start = gridToWorld(PLAYER_SPAWN_POSITION);
    this.player = new Player(scene, start.x, start.y);
    this.player.setClothes(clothes);
    this.depthSystem.update(this.player);
    return this.player;
  }

  updateDepth() {
    if (this.player) this.depthSystem.update(this.player);
  }

  resetToSpawn() {
    if (!this.player) return;
    const start = gridToWorld(PLAYER_SPAWN_POSITION);
    this.player.setPosition(start.x, start.y);
    this.player.stop("down");
    this.updateDepth();
  }
}
