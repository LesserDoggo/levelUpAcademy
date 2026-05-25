import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { PreloadScene } from "./scenes/PreloadScene";

function resolveParent(parent: string | HTMLElement) {
  return typeof parent === "string" ? document.getElementById(parent) : parent;
}

function applyCanvasLayout(game: Phaser.Game, parent: string | HTMLElement) {
  const parentElement = resolveParent(parent);
  const canvas = game.canvas;

  if (parentElement) {
    parentElement.style.position = parentElement.style.position || "relative";
    parentElement.style.overflow = "hidden";
  }

  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.maxWidth = "100%";
  canvas.style.maxHeight = "100%";

  window.requestAnimationFrame(() => {
    game.scale.refresh();
  });
}

export function createLevelUpGame(parent: string | HTMLElement) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#1c202c",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 640,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    input: {
      activePointers: 3,
    },
    scene: [BootScene, PreloadScene, GameScene],
  };

  const game = new Phaser.Game(config);
  applyCanvasLayout(game, parent);

  return game;
}
