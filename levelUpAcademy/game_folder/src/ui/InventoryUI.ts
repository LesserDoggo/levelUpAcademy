import Phaser from "phaser";
import { furnitureData } from "../data/furnitureData";
import { useGameStore } from "../store/gameStore";

export class InventoryUI {
  private container?: Phaser.GameObjects.Container;

  create(scene: Phaser.Scene, onSelectFurniture: (itemId: string) => void) {
    this.container = scene.add.container(16, 478).setDepth(9000);
    this.render(scene, onSelectFurniture);
    this.setVisible(false);
  }

  render(scene: Phaser.Scene, onSelectFurniture: (itemId: string) => void) {
    this.container?.removeAll(true);
    const panel = scene.add.rectangle(0, 0, 360, 134, 0xffffff, 0.94).setOrigin(0).setStrokeStyle(1, 0xd6dce5);
    const title = scene.add.text(12, 10, "Inventario", {
      color: "#243447",
      fontFamily: "Arial",
      fontSize: "16px",
      fontStyle: "bold",
    });
    this.container?.add([panel, title]);

    const inventory = useGameStore.getState().inventory.furniture;
    Object.entries(furnitureData).forEach(([itemId, definition], index) => {
      if (itemId === "bed_simple") return;
      const x = 12 + index * 82;
      const button = scene.add.rectangle(x, 48, 72, 58, 0xe8edf2, 1).setOrigin(0).setInteractive({ useHandCursor: true });
      const label = scene.add.text(x + 6, 54, `${definition.name}\nx${inventory[itemId] ?? 0}`, {
        color: "#243447",
        fontFamily: "Arial",
        fontSize: "11px",
        lineSpacing: 3,
      });
      button.on("pointerdown", () => onSelectFurniture(itemId));
      this.container?.add([button, label]);
    });
  }

  setVisible(visible: boolean) {
    this.container?.setVisible(visible);
  }
}
