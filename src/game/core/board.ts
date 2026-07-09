import { findMatches } from './match';
import { createRng } from './rng';
import type { BoardGrid, BoardPosition, BoardTile, TileKind } from './types';

export type { BoardGrid } from './types';

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;
export const DEFAULT_TILE_KINDS: TileKind[] = ['heart', 'star', 'flower', 'candy', 'gift'];

interface BoardSize {
  width: number;
  height: number;
}

interface CreateInitialBoardOptions {
  seed: string | number;
  width?: number;
  height?: number;
  tileKinds?: TileKind[];
}

let tileSequence = 0;

function assertTileKinds(tileKinds: TileKind[]): void {
  if (tileKinds.length < 3) {
    throw new Error('At least three tile kinds are required.');
  }
}

function getBoardSize(board: BoardGrid): BoardSize {
  return {
    height: board.length,
    width: board[0]?.length ?? 0,
  };
}

function makeTile(kind: TileKind, position: BoardPosition, seedLabel: string): BoardTile {
  tileSequence += 1;
  return {
    id: `${seedLabel}:${position.row}:${position.col}:${tileSequence}`,
    kind,
    position: { ...position },
  };
}

function wouldCreateImmediateMatch(
  board: BoardGrid,
  row: number,
  col: number,
  kind: TileKind,
): boolean {
  const leftMatch = col >= 2 && board[row][col - 1]?.kind === kind && board[row][col - 2]?.kind === kind;
  const upMatch = row >= 2 && board[row - 1][col]?.kind === kind && board[row - 2][col]?.kind === kind;

  return leftMatch || upMatch;
}

function hasPossibleMoveInternal(board: BoardGrid): boolean {
  const { width, height } = getBoardSize(board);

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const pairs: BoardPosition[] = [
        { row, col: col + 1 },
        { row: row + 1, col },
      ];

      for (const to of pairs) {
        if (!isInsideBoard(to.row, to.col, width, height)) {
          continue;
        }

        const swapped = cloneBoard(board);
        const a = swapped[row][col];
        const b = swapped[to.row][to.col];
        if (!a || !b || a.kind === b.kind) {
          continue;
        }

        swapped[row][col] = { ...b, position: { row, col } };
        swapped[to.row][to.col] = { ...a, position: { ...to } };

        if (findMatches(swapped).length > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

export function createEmptyBoard(width = BOARD_WIDTH, height = BOARD_HEIGHT): BoardGrid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
}

export function createInitialBoard({
  seed,
  width = BOARD_WIDTH,
  height = BOARD_HEIGHT,
  tileKinds = DEFAULT_TILE_KINDS,
}: CreateInitialBoardOptions): BoardGrid {
  assertTileKinds(tileKinds);

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const rng = createRng(`${seed}:${attempt}`);
    const board = createEmptyBoard(width, height);

    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const candidates = tileKinds.filter((kind) => !wouldCreateImmediateMatch(board, row, col, kind));
        const kind = rng.pick(candidates.length > 0 ? candidates : tileKinds);
        board[row][col] = makeTile(kind, { row, col }, `initial:${seed}:${attempt}`);
      }
    }

    if (findMatches(board).length === 0 && hasPossibleMoveInternal(board)) {
      return board;
    }
  }

  throw new Error('Failed to create a stable initial board.');
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row, rowIndex) =>
    row.map((tile, colIndex) =>
      tile
        ? {
            ...tile,
            position: { row: rowIndex, col: colIndex },
          }
        : null,
    ),
  );
}

export function isInsideBoard(
  row: number,
  col: number,
  width = BOARD_WIDTH,
  height = BOARD_HEIGHT,
): boolean {
  return row >= 0 && row < height && col >= 0 && col < width;
}

export function getTile(board: BoardGrid, position: BoardPosition): BoardTile | null {
  const { width, height } = getBoardSize(board);
  if (!isInsideBoard(position.row, position.col, width, height)) {
    return null;
  }

  return board[position.row][position.col];
}

export function setTile(
  board: BoardGrid,
  position: BoardPosition,
  tile: BoardTile | null,
): BoardGrid {
  const { width, height } = getBoardSize(board);
  if (!isInsideBoard(position.row, position.col, width, height)) {
    return cloneBoard(board);
  }

  const next = cloneBoard(board);
  next[position.row][position.col] = tile
    ? {
        ...tile,
        position: { ...position },
      }
    : null;

  return next;
}

export function boardToKindRows(board: BoardGrid): string[][] {
  return board.map((row) => row.map((tile) => tile?.kind ?? 'null'));
}
