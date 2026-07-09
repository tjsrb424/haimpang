import type { BoardGrid } from './board';

export interface CascadeResult {
  board: BoardGrid;
  chainCount: number;
  scoreDelta: number;
}

export function resolveCascade(board: BoardGrid): CascadeResult {
  return {
    board,
    chainCount: 0,
    scoreDelta: 0,
  };
}
