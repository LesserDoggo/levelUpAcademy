import type { GridPosition } from "../types/FurnitureTypes";

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 8;
export const TILE_WIDTH = 68;
export const TILE_HEIGHT = 54;
export const ROOM_ORIGIN_X = 72;
export const ROOM_ORIGIN_Y = 118;
export const PLAYER_SPAWN_POSITION: GridPosition = { x: 6, y: 6 };
export const PLAYER_SPAWN_RESERVED_AREA = {
  x: PLAYER_SPAWN_POSITION.x - 1,
  y: PLAYER_SPAWN_POSITION.y - 1,
  width: 3,
  height: 2,
};

export function gridToWorld(grid: GridPosition) {
  return {
    x: ROOM_ORIGIN_X + grid.x * TILE_WIDTH + TILE_WIDTH / 2,
    y: ROOM_ORIGIN_Y + grid.y * TILE_HEIGHT + TILE_HEIGHT / 2,
  };
}

export function worldToGrid(x: number, y: number): GridPosition {
  return {
    x: Math.floor((x - ROOM_ORIGIN_X) / TILE_WIDTH),
    y: Math.floor((y - ROOM_ORIGIN_Y) / TILE_HEIGHT),
  };
}

export function isInsideRoom(position: GridPosition, width = 1, height = 1) {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + width <= GRID_COLUMNS &&
    position.y + height <= GRID_ROWS
  );
}

export function gridKey(position: GridPosition) {
  return `${position.x}:${position.y}`;
}

export function isInsidePlayerSpawnArea(position: GridPosition, width = 1, height = 1) {
  return !(
    position.x + width <= PLAYER_SPAWN_RESERVED_AREA.x ||
    position.x >= PLAYER_SPAWN_RESERVED_AREA.x + PLAYER_SPAWN_RESERVED_AREA.width ||
    position.y + height <= PLAYER_SPAWN_RESERVED_AREA.y ||
    position.y >= PLAYER_SPAWN_RESERVED_AREA.y + PLAYER_SPAWN_RESERVED_AREA.height
  );
}
