import type { GridPosition } from "../types/FurnitureTypes";

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 8;
export const TILE_WIDTH = 68;
export const TILE_HEIGHT = 54;
export const ROOM_ORIGIN_X = 72;
export const ROOM_ORIGIN_Y = 118;

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
