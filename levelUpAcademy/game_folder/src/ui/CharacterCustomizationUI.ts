import Phaser from "phaser";
import { clothingData } from "../data/clothingData";
import { createReadableText, truncateText } from "./coinIcon";

export class CharacterCustomizationUI {
  private container?: Phaser.GameObjects.Container;
  private dragPrevious: Phaser.Math.Vector2 | null = null;

  create(scene: Phaser.Scene, onEquip: (itemId: string) => void) {
    this.container = scene.add.container(16, 68).setDepth(9000);
    const panel = scene.add.rectangle(0, 0, 178, 208, 0x212636, 0.98).setOrigin(0).setStrokeStyle(1, 0x60519b);
    this.container.add(panel);
    panel.setInteractive({ useHandCursor: true });
    panel.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragPrevious || !pointer.isDown || !this.container?.visible) return;
      this.container.x += pointer.x - this.dragPrevious.x;
      this.container.y += pointer.y - this.dragPrevious.y;
      this.dragPrevious.set(pointer.x, pointer.y);
    });
    scene.input.on("pointerup", () => {
      this.dragPrevious = null;
    });
    const title = createReadableText(scene, 10, 9, "Avatar", { color: "#bfc0d1", fontSize: "16px", fontStyle: "800" });
    title.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    this.container.add(title);

    Object.values(clothingData).forEach((item, index) => {
      const y = 42 + index * 28;
      const button = scene.add.rectangle(10, y, 158, 24, 0x1c202c, 1).setOrigin(0).setStrokeStyle(1, 0x2e354d).setInteractive({ useHandCursor: true });
      const label = createReadableText(scene, 16, y + 4, truncateText(item.name, 20), { color: "#bfc0d1", fontSize: "12px", fontStyle: "700" });
      button.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        onEquip(item.itemId);
      });
      this.container?.add([button, label]);
    });
    this.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.container?.setVisible(visible);
  }
}
