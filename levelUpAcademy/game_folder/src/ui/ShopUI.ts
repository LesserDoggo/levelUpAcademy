import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { furnitureData } from "../data/furnitureData";
import { COIN_ICON_TEXTURE, createReadableText, ensureCoinIconTexture, truncateText } from "./coinIcon";

export class ShopUI {
  private container?: Phaser.GameObjects.Container;
  private dragPrevious: Phaser.Math.Vector2 | null = null;
  private dragBound = false;

  create(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    this.container = scene.add.container(768, 68).setDepth(9000);
    this.render(scene, onBuyFurniture, onBuyClothing);
    this.setVisible(false);
  }

  render(scene: Phaser.Scene, onBuyFurniture: (itemId: string) => void, onBuyClothing: (itemId: string) => void) {
    ensureCoinIconTexture(scene);
    this.container?.removeAll(true);
    const panel = scene.add.rectangle(0, 0, 176, 268, 0x212636, 0.98).setOrigin(0).setStrokeStyle(1, 0x60519b);
    this.container?.add(panel);
    this.enableDrag(scene, panel);
    const title = createReadableText(scene, 10, 9, "Loja", {
      color: "#bfc0d1",
      fontSize: "16px",
      fontStyle: "800",
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
      const button = scene.add.rectangle(10, y, 156, 30, 0x243447, 1).setOrigin(0).setStrokeStyle(1, 0x60519b).setInteractive({ useHandCursor: true });
      const label = createReadableText(scene, 16, y + 7, truncateText(item.name, 13), {
        fontSize: "12px",
        fontStyle: "700",
      });
      const coinIcon = scene.add.image(118, y + 15, COIN_ICON_TEXTURE).setDisplaySize(14, 14);
      const price = createReadableText(scene, 130, y + 7, `${item.price}`, {
        color: "#fff2a8",
        fontSize: "12px",
        fontStyle: "800",
      });
      button.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        item.kind === "furniture" ? onBuyFurniture(item.itemId) : onBuyClothing(item.itemId);
      });
      this.container?.add([button, label, coinIcon, price]);
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
