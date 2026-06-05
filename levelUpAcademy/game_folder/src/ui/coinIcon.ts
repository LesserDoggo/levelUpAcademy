import Phaser from "phaser";

export const COIN_ICON_TEXTURE = "levelup_coin_star_icon";

export function ensureCoinIconTexture(scene: Phaser.Scene) {
  if (scene.textures.exists(COIN_ICON_TEXTURE)) return;

  const size = 64;
  const center = size / 2;
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

  graphics.fillStyle(0xf4c95d, 1);
  graphics.fillCircle(center, center, 27);
  graphics.lineStyle(5, 0xd99b2b, 1);
  graphics.strokeCircle(center, center, 24);

  graphics.fillStyle(0xfff2a8, 1);
  graphics.fillPoints(
    [
      new Phaser.Geom.Point(center, 10),
      new Phaser.Geom.Point(center + 6, center - 6),
      new Phaser.Geom.Point(size - 10, center),
      new Phaser.Geom.Point(center + 6, center + 6),
      new Phaser.Geom.Point(center, size - 10),
      new Phaser.Geom.Point(center - 6, center + 6),
      new Phaser.Geom.Point(10, center),
      new Phaser.Geom.Point(center - 6, center - 6),
    ],
    true,
  );

  graphics.generateTexture(COIN_ICON_TEXTURE, size, size);
  graphics.destroy();
}

export function createReadableText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle = {},
) {
  return scene.add
    .text(x, y, text, {
      color: "#ffffff",
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontSize: "15px",
      fontStyle: "700",
      ...style,
    })
    .setResolution(4)
    .setShadow(0, 1, "#0c101c", 2, true, true);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}
