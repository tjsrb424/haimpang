import { cloneBoard, DEFAULT_TILE_KINDS } from './board';
import { findMatches, getMatchedPositions } from './match';
import { createRng, type Rng } from './rng';
import type { BoardGrid, BoardTile, CascadeResult, MatchGroup, TileKind } from './types';

interface RefillOptions {
  rng: Rng;
  tileKinds?: TileKind[];
}

interface ResolveCascadeOptions {
  seed: string | number;
  tileKinds?: TileKind[];
  maxSteps?: number;
}

let refillSequence = 0;

function makeRefillTile(kind: TileKind, row: number, col: number): BoardTile {
  refillSequence += 1;
  return {
    id: `refill:${row}:${col}:${refillSequence}`,
    kind,
    position: { row, col },
  };
}

function wouldCreateMatchAt(board: BoardGrid, row: number, col: number, kind: TileKind): boolean {
  const directions = [
    [
      [0, -1],
      [0, 1],
    ],
    [
      [-1, 0],
      [1, 0],
    ],
  ] as const;

  for (const axis of directions) {
    let count = 1;
    for (const [rowDelta, colDelta] of axis) {
      let nextRow = row + rowDelta;
      let nextCol = col + colDelta;
      while (board[nextRow]?.[nextCol]?.kind === kind) {
        count += 1;
        nextRow += rowDelta;
        nextCol += colDelta;
      }
    }
    if (count >= 3) {
      return true;
    }
  }

  return false;
}

function hasNull(board: BoardGrid): boolean {
  return board.some((row) => row.some((tile) => tile === null));
}

export function removeMatches(board: BoardGrid, matches: MatchGroup[]): BoardGrid {
  const next = cloneBoard(board);
  for (const position of getMatchedPositions(matches)) {
    if (next[position.row]?.[position.col] !== undefined) {
      next[position.row][position.col] = null;
    }
  }

  return next;
}

export function dropTiles(board: BoardGrid): BoardGrid {
  const next = cloneBoard(board);
  const height = next.length;
  const width = next[0]?.length ?? 0;

  for (let col = 0; col < width; col += 1) {
    const tiles: BoardTile[] = [];
    for (let row = height - 1; row >= 0; row -= 1) {
      const tile = next[row][col];
      if (tile) {
        tiles.push(tile);
      }
    }

    for (let row = height - 1; row >= 0; row -= 1) {
      const tile = tiles[height - 1 - row] ?? null;
      next[row][col] = tile
        ? {
            ...tile,
            position: { row, col },
          }
        : null;
    }
  }

  return next;
}

export function refillBoard(
  board: BoardGrid,
  { rng, tileKinds = DEFAULT_TILE_KINDS }: RefillOptions,
): BoardGrid {
  const next = cloneBoard(board);

  for (let row = 0; row < next.length; row += 1) {
    for (let col = 0; col < (next[0]?.length ?? 0); col += 1) {
      if (next[row][col]) {
        continue;
      }

      const candidates = tileKinds.filter((kind) => !wouldCreateMatchAt(next, row, col, kind));
      const kind = rng.pick(candidates.length > 0 ? candidates : tileKinds);
      next[row][col] = makeRefillTile(kind, row, col);
    }
  }

  return next;
}

export function resolveCascade(
  board: BoardGrid,
  { seed, tileKinds = DEFAULT_TILE_KINDS, maxSteps = 20 }: ResolveCascadeOptions,
): CascadeResult {
  const rng = createRng(seed);
  const steps: CascadeResult['steps'] = [];
  let current = cloneBoard(board);
  let matches = findMatches(current);
  let totalRemoved = 0;

  while (matches.length > 0 && steps.length < maxSteps) {
    const boardBefore = cloneBoard(current);
    const removedPositions = getMatchedPositions(matches);
    const removedBoard = removeMatches(current, matches);
    const droppedBoard = dropTiles(removedBoard);
    const refilledBoard = refillBoard(droppedBoard, { rng, tileKinds });

    steps.push({
      boardBefore,
      matches,
      removedPositions,
      droppedBoard,
      refilledBoard,
    });

    totalRemoved += removedPositions.length;
    current = refilledBoard;
    matches = findMatches(current);
  }

  if (!hasNull(current) && matches.length === 0) {
    return {
      finalBoard: current,
      steps,
      totalRemoved,
    };
  }

  return {
    finalBoard: current,
    steps,
    totalRemoved,
  };
}
