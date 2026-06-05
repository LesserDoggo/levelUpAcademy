import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { FURNITURE_DIRECTIONS, furnitureData } from "../data/furnitureData";
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
      FURNITURE_DIRECTIONS.forEach((direction) => {
        this.load.image(`${item.spriteKey}_${direction}`, resolveAssetPath(item.spritePaths[direction]));
      });
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
