import type { BoardTile, TileKind } from './types';

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;
export const DEFAULT_TILE_KINDS: TileKind[] = ['heart', 'star', 'flower', 'candy', 'gift'];

export type BoardGrid = Array<Array<BoardTile | null>>;

export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => null));
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH;
}
