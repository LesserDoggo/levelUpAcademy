import Phaser from "phaser";
import { furnitureData } from "../data/furnitureData";
import { useGameStore } from "../store/gameStore";

export class InventoryUI {
  private container?: Phaser.GameObjects.Container;
  private dragPrevious: Phaser.Math.Vector2 | null = null;
  private dragBound = false;

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
    this.enableDrag(scene, panel);

    title.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });

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
      button.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        onSelectFurniture(itemId);
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
