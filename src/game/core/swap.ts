import { isInsideBoard } from './board';
import type { BoardPosition } from './types';

export function areAdjacent(a: BoardPosition, b: BoardPosition): boolean {
  if (!isInsideBoard(a.row, a.col) || !isInsideBoard(b.row, b.col)) {
    return false;
  }

  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}
