import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";

export class ShopUI {
  private container?: Phaser.GameObjects.Container;

  create(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    this.container = scene.add.container(790, 20).setDepth(9000);
    this.render(scene, onBuyFurniture, onBuyClothing);
    this.setVisible(false);
  }

  render(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    this.container?.removeAll(true);
    this.container?.add(scene.add.rectangle(0, 0, 154, 250, 0xffffff, 0.94).setOrigin(0).setStrokeStyle(1, 0xd6dce5));
    this.container?.add(
      scene.add.text(10, 10, "Loja", { color: "#243447", fontFamily: "Arial", fontSize: "16px", fontStyle: "bold" }),
    );

    const entries = [
      ...Object.values(furnitureData).filter((item) => item.price > 0).map((item) => ({ ...item, kind: "furniture" as const })),
      ...Object.values(clothingData).filter((item) => item.price > 0).map((item) => ({ ...item, kind: "clothing" as const })),
    ];

    entries.forEach((item, index) => {
      const y = 42 + index * 38;
      const button = scene.add.rectangle(10, y, 134, 30, 0x4f63ac, 1).setOrigin(0).setInteractive({ useHandCursor: true });
      const label = scene.add.text(16, y + 8, `${item.name} ${item.price}`, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "10px",
      });
      button.on("pointerdown", () => (item.kind === "furniture" ? onBuyFurniture(item.itemId) : onBuyClothing(item.itemId)));
      this.container?.add([button, label]);
    });
  }

  setVisible(visible: boolean) {
    this.container?.setVisible(visible);
  }
}
