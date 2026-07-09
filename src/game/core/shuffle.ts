import { createInitialBoard, DEFAULT_TILE_KINDS } from './board';
import { trySwap } from './swap';
import type { BoardGrid, SwapMove, TileKind } from './types';

interface ReshuffleOptions {
  seed: string | number;
  tileKinds?: TileKind[];
}

export function findPossibleMoves(board: BoardGrid): SwapMove[] {
  const moves: SwapMove[] = [];
  const height = board.length;
  const width = board[0]?.length ?? 0;

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const candidates: SwapMove[] = [
        { from: { row, col }, to: { row, col: col + 1 } },
        { from: { row, col }, to: { row: row + 1, col } },
      ];

      for (const move of candidates) {
        if (trySwap(board, move).valid) {
          moves.push(move);
        }
      }
    }
  }

  return moves;
}

export function hasPossibleMove(board: BoardGrid): boolean {
  return findPossibleMoves(board).length > 0;
}

export function reshuffleBoard(
  board: BoardGrid,
  { seed, tileKinds = DEFAULT_TILE_KINDS }: ReshuffleOptions,
): BoardGrid {
  return createInitialBoard({
    seed: `reshuffle:${seed}`,
    width: board[0]?.length ?? 0,
    height: board.length,
    tileKinds,
  });
}
