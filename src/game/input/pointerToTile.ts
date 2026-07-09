import { BOARD_HEIGHT, BOARD_WIDTH } from '../core/board';
import type { BoardPosition } from '../core/types';

export interface BoardHitArea {
  originX: number;
  originY: number;
  tileSize: number;
  gap: number;
}

export function pointerToTile(x: number, y: number, area: BoardHitArea): BoardPosition | null {
  const relativeX = x - area.originX;
  const relativeY = y - area.originY;
  const stride = area.tileSize + area.gap;

  if (relativeX < 0 || relativeY < 0) {
    return null;
  }

  const col = Math.floor(relativeX / stride);
  const row = Math.floor(relativeY / stride);

  if (row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
    return null;
  }

  const localX = relativeX - col * stride;
  const localY = relativeY - row * stride;

  if (localX > area.tileSize || localY > area.tileSize) {
    return null;
  }

  return { row, col };
}
