import Phaser from "phaser";
import { clothingData } from "../data/clothingData";

export class CharacterCustomizationUI {
  private container?: Phaser.GameObjects.Container;
  private dragPrevious: Phaser.Math.Vector2 | null = null;

  create(scene: Phaser.Scene, onEquip: (itemId: string) => void) {
    this.container = scene.add.container(16, 20).setDepth(9000);
    const panel = scene.add.rectangle(0, 0, 166, 196, 0xffffff, 0.94).setOrigin(0).setStrokeStyle(1, 0xd6dce5);
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
    const title = scene.add.text(10, 10, "Avatar", { color: "#243447", fontFamily: "Arial", fontSize: "16px", fontStyle: "bold" });
    title.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });
    this.container.add(title);

    Object.values(clothingData).forEach((item, index) => {
      const y = 42 + index * 28;
      const button = scene.add.rectangle(10, y, 146, 22, 0xe8edf2, 1).setOrigin(0).setInteractive({ useHandCursor: true });
      const label = scene.add.text(16, y + 5, item.name, { color: "#243447", fontFamily: "Arial", fontSize: "10px" });
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
