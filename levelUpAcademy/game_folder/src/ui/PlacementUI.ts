import Phaser from "phaser";

export class PlacementUI {
  private text?: Phaser.GameObjects.Text;
  private confirmButton?: Phaser.GameObjects.Text;
  private cancelButton?: Phaser.GameObjects.Text;

  create(scene: Phaser.Scene, onConfirm: () => void, onCancel: () => void) {
    this.text = scene.add
      .text(292, 106, "", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "15px",
        backgroundColor: "#243447",
        padding: { x: 10, y: 7 },
      })
      .setDepth(9000);
    this.confirmButton = scene.add
      .text(522, 104, "Confirmar", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "15px",
        backgroundColor: "#35b779",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000)
      .setInteractive({ useHandCursor: true });
    this.cancelButton = scene.add
      .text(638, 104, "Cancelar", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "15px",
        backgroundColor: "#ef626c",
        padding: { x: 12, y: 8 },
      })
      .setDepth(9000)
      .setInteractive({ useHandCursor: true });
    this.confirmButton.on("pointerdown", onConfirm);
    this.cancelButton.on("pointerdown", onCancel);
    this.setActive(false);
  }

  setActive(active: boolean) {
    if (this.text) {
      this.text.setText(active ? "Posicione no grid" : "");
      this.text.setVisible(active);
    }
    this.confirmButton?.setVisible(active);
    this.cancelButton?.setVisible(active);
  }
}
