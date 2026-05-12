import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";

export class ShopUI {
  private container?: Phaser.GameObjects.Container;
  private dragPrevious: Phaser.Math.Vector2 | null = null;
  private dragBound = false;

  create(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    this.container = scene.add.container(790, 20).setDepth(9000);
    this.render(scene, onBuyFurniture, onBuyClothing);
    this.setVisible(false);
  }

  render(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    this.container?.removeAll(true);
    const panel = scene.add.rectangle(0, 0, 154, 250, 0xffffff, 0.94).setOrigin(0).setStrokeStyle(1, 0xd6dce5);
    this.container?.add(panel);
    this.enableDrag(scene, panel);
    const title = scene.add.text(10, 10, "Loja", {
      color: "#243447",
      fontFamily: "Arial",
      fontSize: "16px",
      fontStyle: "bold",
    });
    title.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    this.container?.add(title);

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
      button.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        item.kind === "furniture" ? onBuyFurniture(item.itemId) : onBuyClothing(item.itemId);
      });
      this.container?.add([button, label]);
    });
  }

  private enableDrag(scene: Phaser.Scene, panel: Phaser.GameObjects.Rectangle) {
    panel.setInteractive({ useHandCursor: true });
    panel.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    if (this.dragBound) return;
    this.dragBound = true;
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragPrevious || !pointer.isDown || !this.container?.visible) return;
      this.container.x += pointer.x - this.dragPrevious.x;
      this.container.y += pointer.y - this.dragPrevious.y;
      this.dragPrevious.set(pointer.x, pointer.y);
    });
    scene.input.on("pointerup", () => {
      this.dragPrevious = null;
    });
  }

  setVisible(visible: boolean) {
    this.container?.setVisible(visible);
  }
}
