import Phaser from "phaser";
import { createReadableText } from "./coinIcon";

export class PlacementUI {
  private panel?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;
  private rotateButton?: Phaser.GameObjects.Text;
  private confirmButton?: Phaser.GameObjects.Text;
  private cancelButton?: Phaser.GameObjects.Text;

  create(scene: Phaser.Scene, onConfirm: () => void, onCancel: () => void, onRotate: () => void) {
    this.panel = scene.add
      .rectangle(250, 96, 500, 48, 0x212636, 0.96)
      .setOrigin(0)
      .setStrokeStyle(1, 0x60519b)
      .setDepth(8999);
    this.text = createReadableText(scene, 264, 110, "", {
        color: "#bfc0d1",
        fontSize: "15px",
        fontStyle: "800",
      })
      .setDepth(9000);
    this.rotateButton = createReadableText(scene, 462, 105, "Girar", {
        color: "#ffffff",
        fontSize: "14px",
        fontStyle: "800",
        backgroundColor: "#60519b",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000)
      .setInteractive({ useHandCursor: true });
    this.confirmButton = createReadableText(scene, 546, 105, "Confirmar", {
        color: "#ffffff",
        fontSize: "14px",
        fontStyle: "800",
        backgroundColor: "#35b779",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000)
      .setInteractive({ useHandCursor: true });
    this.cancelButton = createReadableText(scene, 660, 105, "Cancelar", {
        color: "#ffffff",
        fontSize: "14px",
        fontStyle: "800",
        backgroundColor: "#ef626c",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000)
      .setInteractive({ useHandCursor: true });
    this.rotateButton.on("pointerdown", onRotate);
    this.confirmButton.on("pointerdown", onConfirm);
    this.cancelButton.on("pointerdown", onCancel);
    this.setActive(false);
  }

  setActive(active: boolean) {
    if (this.text) {
      this.text.setText(active ? "Posicione no grid" : "");
      this.text.setVisible(active);
    }
    this.panel?.setVisible(active);
    this.rotateButton?.setVisible(active);
    this.confirmButton?.setVisible(active);
    this.cancelButton?.setVisible(active);
  }
}
