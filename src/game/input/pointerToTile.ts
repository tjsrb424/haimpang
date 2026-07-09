import type { BoardPosition } from '../core/types';

export interface BoardLayoutMetrics {
  originX: number;
  originY: number;
  tileSize: number;
  gap: number;
  boardWidth: number;
  boardHeight: number;
}

export function pointerToTile(
  pointer: { x: number; y: number },
  metrics: BoardLayoutMetrics,
): BoardPosition | null {
  const relativeX = pointer.x - metrics.originX;
  const relativeY = pointer.y - metrics.originY;

  if (relativeX < metrics.gap || relativeY < metrics.gap) {
    return null;
  }

  const stride = metrics.tileSize + metrics.gap;
  const col = Math.floor((relativeX - metrics.gap) / stride);
  const row = Math.floor((relativeY - metrics.gap) / stride);

  if (row < 0 || row >= metrics.boardHeight || col < 0 || col >= metrics.boardWidth) {
    return null;
  }

  const localX = relativeX - metrics.gap - col * stride;
  const localY = relativeY - metrics.gap - row * stride;

  if (localX < 0 || localY < 0 || localX >= metrics.tileSize || localY >= metrics.tileSize) {
    return null;
  }

  return { row, col };
}
