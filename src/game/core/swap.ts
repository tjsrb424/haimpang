import { cloneBoard, getTile, isInsideBoard } from './board';
import { findMatches } from './match';
import type { BoardGrid, BoardPosition, SwapMove, SwapResult } from './types';

function isInside(board: BoardGrid, position: BoardPosition): boolean {
  return isInsideBoard(position.row, position.col, board[0]?.length ?? 0, board.length);
}

export function areAdjacent(a: BoardPosition, b: BoardPosition): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function swapTiles(board: BoardGrid, move: SwapMove): BoardGrid {
  const next = cloneBoard(board);
  const fromTile = getTile(next, move.from);
  const toTile = getTile(next, move.to);

  if (!fromTile || !toTile || !isInside(next, move.from) || !isInside(next, move.to)) {
    return next;
  }

  next[move.from.row][move.from.col] = {
    ...toTile,
    position: { ...move.from },
  };
  next[move.to.row][move.to.col] = {
    ...fromTile,
    position: { ...move.to },
  };

  return next;
}

export function trySwap(board: BoardGrid, move: SwapMove): SwapResult {
  if (!isInside(board, move.from) || !isInside(board, move.to) || !areAdjacent(move.from, move.to)) {
    return { valid: false, board, matches: [] };
  }

  const fromTile = getTile(board, move.from);
  const toTile = getTile(board, move.to);
  if (!fromTile || !toTile || fromTile.kind === toTile.kind) {
    return { valid: false, board, matches: [] };
  }

  const swapped = swapTiles(board, move);
  const matches = findMatches(swapped);
  if (matches.length === 0) {
    return { valid: false, board, matches: [] };
  }

  return { valid: true, board: swapped, matches };
}
