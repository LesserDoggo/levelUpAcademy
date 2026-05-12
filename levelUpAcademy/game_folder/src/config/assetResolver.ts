declare global {
  interface Window {
    LevelUpGameAssets?: Record<string, string>;
  }
}

export function resolveAssetPath(path: string) {
  if (typeof window !== "undefined" && window.LevelUpGameAssets?.[path]) {
    return window.LevelUpGameAssets[path];
  }
  return path;
}
