import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";
import { Player } from "../entities/Player";
import { resolveAssetPath } from "../config/assetResolver";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    Player.preload(this);

    Object.values(clothingData).forEach((item) => {
      this.load.spritesheet(item.spriteKey, resolveAssetPath(item.spritePath), { frameWidth: 48, frameHeight: 64 });
    });

    Object.values(furnitureData).forEach((item) => {
      this.load.image(item.spriteKey, resolveAssetPath(item.spritePath));
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
