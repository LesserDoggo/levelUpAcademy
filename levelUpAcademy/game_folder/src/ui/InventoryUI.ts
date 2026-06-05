import Phaser from "phaser";
import { furnitureData } from "../data/furnitureData";
import { useGameStore } from "../store/gameStore";
import { createReadableText } from "./coinIcon";

function formatInventoryLabel(name: string, quantity: number) {
  const words = name.split(" ");
  if (name.length <= 12 || words.length === 1) return `${name}\nx${quantity}`;
  return `${words[0]}\n${words.slice(1).join(" ")}\nx${quantity}`;
}

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
    const panel = scene.add.rectangle(0, 0, 472, 136, 0x212636, 0.98).setOrigin(0).setStrokeStyle(1, 0x60519b);
    const title = createReadableText(scene, 12, 9, "Inventario", {
      color: "#bfc0d1",
      fontSize: "16px",
      fontStyle: "800",
    });
    this.container?.add([panel, title]);
    this.enableDrag(scene, panel);

    title.setInteractive({ useHandCursor: true }).on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.dragPrevious = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });

    const inventory = useGameStore.getState().inventory.furniture;
    Object.entries(furnitureData).forEach(([itemId, definition], index) => {
      const x = 12 + index * 112;
      const button = scene.add.rectangle(x, 48, 104, 64, 0x1c202c, 1).setOrigin(0).setStrokeStyle(1, 0x2e354d).setInteractive({ useHandCursor: true });
      const label = createReadableText(scene, x + 8, 51, formatInventoryLabel(definition.name, inventory[itemId] ?? 0), {
        color: "#bfc0d1",
        fontSize: "12px",
        fontStyle: "700",
        lineSpacing: 1,
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
