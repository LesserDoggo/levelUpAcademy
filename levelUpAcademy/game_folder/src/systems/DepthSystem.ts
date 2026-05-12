import { depthFromY } from "../utils/depth";

export class DepthSystem {
  update(displayObject: Phaser.GameObjects.Components.Depth & { y: number }, offset = 0) {
    displayObject.setDepth(depthFromY(displayObject.y, offset));
  }
}
