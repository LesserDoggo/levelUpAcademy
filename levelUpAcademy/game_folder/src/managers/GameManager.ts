import Phaser from "phaser";
import { CharacterCustomizationSystem } from "../systems/CharacterCustomizationSystem";
import { FirebaseSyncSystem } from "../systems/FirebaseSyncSystem";
import { FurniturePlacementSystem } from "../systems/FurniturePlacementSystem";
import { InventorySystem } from "../systems/InventorySystem";
import { MovementSystem } from "../systems/MovementSystem";
import { ShopSystem } from "../systems/ShopSystem";

export class GameManager {
  movement = new MovementSystem();
  placement = new FurniturePlacementSystem();
  inventory = new InventorySystem();
  shop = new ShopSystem();
  customization = new CharacterCustomizationSystem();
  firebase = new FirebaseSyncSystem();

  emit(scene: Phaser.Scene, event: string, payload?: unknown) {
    scene.events.emit(event, payload);
  }
}
