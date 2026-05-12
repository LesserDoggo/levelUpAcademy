import Phaser from "phaser";
import { PLAYER_BODY_SPRITE } from "../config/spritePaths";
import { resolveAssetPath } from "../config/assetResolver";
import { clothingData, DEFAULT_CLOTHES } from "../data/clothingData";
import type { Direction, PlayerAnimation, PlayerClothes } from "../types/PlayerTypes";

const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 64;
const DIRECTIONS: Direction[] = ["down", "left", "right", "up"];

export class Player extends Phaser.GameObjects.Container {
  bodyLayer: Phaser.GameObjects.Sprite;
  shirtLayer: Phaser.GameObjects.Sprite;
  pantsLayer: Phaser.GameObjects.Sprite;
  shoesLayer: Phaser.GameObjects.Sprite;
  faceAccessoryLayer: Phaser.GameObjects.Sprite;
  hatLayer: Phaser.GameObjects.Sprite;
  direction: Direction = "down";
  animationName: PlayerAnimation = "idle";
  clothes: PlayerClothes = DEFAULT_CLOTHES;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.bodyLayer = scene.add.sprite(0, 0, "player_body");
    this.shoesLayer = scene.add.sprite(0, 0, "clothes_shoes_sneaker_white");
    this.pantsLayer = scene.add.sprite(0, 0, "clothes_pants_jeans_blue");
    this.shirtLayer = scene.add.sprite(0, 0, "clothes_shirt_hoodie_black");
    this.faceAccessoryLayer = scene.add.sprite(0, 0, "empty_layer");
    this.hatLayer = scene.add.sprite(0, 0, "empty_layer");
    this.add([this.bodyLayer, this.shoesLayer, this.pantsLayer, this.shirtLayer, this.faceAccessoryLayer, this.hatLayer]);
    this.setSize(FRAME_WIDTH, FRAME_HEIGHT);
    scene.add.existing(this);
  }

  static preload(scene: Phaser.Scene) {
    scene.load.spritesheet("player_body", resolveAssetPath(PLAYER_BODY_SPRITE), { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT });
    scene.load.spritesheet("empty_layer", resolveAssetPath("assets/player/body/empty.svg"), { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT });
  }

  setClothes(clothes: Partial<PlayerClothes>) {
    this.clothes = { ...this.clothes, ...clothes };
    this.hatLayer.setTexture(this.clothes.hat ? clothingData[this.clothes.hat].spriteKey : "empty_layer");
    this.faceAccessoryLayer.setTexture(
      this.clothes.faceAccessory ? clothingData[this.clothes.faceAccessory].spriteKey : "empty_layer",
    );
    this.shirtLayer.setTexture(this.clothes.shirt ? clothingData[this.clothes.shirt].spriteKey : "empty_layer");
    this.pantsLayer.setTexture(this.clothes.pants ? clothingData[this.clothes.pants].spriteKey : "empty_layer");
    this.shoesLayer.setTexture(this.clothes.shoes ? clothingData[this.clothes.shoes].spriteKey : "empty_layer");
    this.syncFrame();
  }

  playLayered(animationName: PlayerAnimation, direction: Direction) {
    this.animationName = animationName;
    this.direction = direction;
    this.syncFrame();
  }

  syncFrame() {
    const directionIndex = DIRECTIONS.indexOf(this.direction);
    const base = directionIndex * 4;
    const walkOffset = this.animationName === "walk" ? Math.floor((this.scene.time.now / 150) % 4) : 0;
    const frame = base + walkOffset;
    for (const layer of [this.bodyLayer, this.shoesLayer, this.pantsLayer, this.shirtLayer, this.faceAccessoryLayer, this.hatLayer]) {
      layer.setFrame(frame);
    }
  }
}
