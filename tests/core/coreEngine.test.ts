import { describe, expect, it } from 'vitest';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  boardToKindRows,
  cloneBoard,
  createEmptyBoard,
  createInitialBoard,
  DEFAULT_TILE_KINDS,
} from '../../src/game/core/board';
import {
  dropTiles,
  refillBoard,
  removeMatches,
  resolveCascade,
} from '../../src/game/core/cascade';
import { findMatches, getMatchedPositions, hasAnyMatch } from '../../src/game/core/match';
import { createRng } from '../../src/game/core/rng';
import { findPossibleMoves, hasPossibleMove, reshuffleBoard } from '../../src/game/core/shuffle';
import { areAdjacent, trySwap } from '../../src/game/core/swap';
import type { BoardGrid, BoardPosition, BoardTile, TileKind } from '../../src/game/core/types';

const kindByLetter: Record<string, TileKind> = {
  H: 'heart',
  S: 'star',
  F: 'flower',
  C: 'candy',
  G: 'gift',
};

const baseRows = ['HSFCGHSF', 'SFCGHSFC', 'FCGHSFCG', 'CGHSFCGH', 'GHSFCGHS', 'HSFCGHSF', 'SFCGHSFC', 'FCGHSFCG'];

function makeTile(kind: TileKind, row: number, col: number): BoardTile {
  return {
    id: `test:${row}:${col}:${kind}`,
    kind,
    position: { row, col },
  };
}

function boardFromRows(rows: string[]): BoardGrid {
  return rows.map((row, rowIndex) =>
    [...row].map((letter, colIndex) => makeTile(kindByLetter[letter], rowIndex, colIndex)),
  );
}

function withCells(cells: Array<BoardPosition & { letter: string }>): BoardGrid {
  const rows = baseRows.map((row) => [...row]);
  for (const cell of cells) {
    rows[cell.row][cell.col] = cell.letter;
  }
  return boardFromRows(rows.map((row) => row.join('')));
}

function kindLayout(board: BoardGrid): string {
  return boardToKindRows(board)
    .map((row) => row.join(','))
    .join('|');
}

function hasNull(board: BoardGrid): boolean {
  return board.some((row) => row.some((tile) => tile === null));
}

describe('rng', () => {
  it('creates the same sequence for the same seed', () => {
    const a = createRng('same-seed');
    const b = createRng('same-seed');

    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('creates different sequences for different seeds', () => {
    const a = createRng('seed-a');
    const b = createRng('seed-b');

    expect([a.next(), a.next(), a.next()]).not.toEqual([b.next(), b.next(), b.next()]);
  });

  it('pick returns only values from the provided array', () => {
    const rng = createRng('pick');
    const items = ['a', 'b', 'c'] as const;

    for (let index = 0; index < 20; index += 1) {
      expect(items).toContain(rng.pick(items));
    }
  });
});

describe('board', () => {
  it('createInitialBoard creates an 8x8 board', () => {
    const board = createInitialBoard({ seed: 'board-size' });

    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(board.every((row) => row.length === BOARD_WIDTH)).toBe(true);
  });

  it('createInitialBoard has no null tiles', () => {
    expect(hasNull(createInitialBoard({ seed: 'no-null' }))).toBe(false);
  });

  it('createInitialBoard has no immediate matches', () => {
    expect(hasAnyMatch(createInitialBoard({ seed: 'no-match' }))).toBe(false);
  });

  it('createInitialBoard has at least one possible move', () => {
    expect(hasPossibleMove(createInitialBoard({ seed: 'possible-move' }))).toBe(true);
  });

  it('same seed creates the same board layout', () => {
    const a = createInitialBoard({ seed: 'stable-layout' });
    const b = createInitialBoard({ seed: 'stable-layout' });

    expect(kindLayout(a)).toBe(kindLayout(b));
  });

  it('cloneBoard does not share tile objects', () => {
    const board = createInitialBoard({ seed: 'clone' });
    const clone = cloneBoard(board);

    expect(clone).toEqual(board);
    expect(clone[0][0]).not.toBe(board[0][0]);
  });
});

describe('match detection', () => {
  it('detects horizontal line3', () => {
    const matches = findMatches(withCells([{ row: 0, col: 0, letter: 'H' }, { row: 0, col: 1, letter: 'H' }, { row: 0, col: 2, letter: 'H' }]));

    expect(matches.some((match) => match.direction === 'horizontal' && match.shape === 'line3')).toBe(true);
  });

  it('detects vertical line3', () => {
    const matches = findMatches(withCells([{ row: 0, col: 0, letter: 'H' }, { row: 1, col: 0, letter: 'H' }, { row: 2, col: 0, letter: 'H' }]));

    expect(matches.some((match) => match.direction === 'vertical' && match.shape === 'line3')).toBe(true);
  });

  it('detects horizontal line4', () => {
    const matches = findMatches(withCells([
      { row: 0, col: 0, letter: 'H' },
      { row: 0, col: 1, letter: 'H' },
      { row: 0, col: 2, letter: 'H' },
      { row: 0, col: 3, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'horizontal' && match.shape === 'line4')).toBe(true);
  });

  it('detects vertical line4', () => {
    const matches = findMatches(withCells([
      { row: 0, col: 0, letter: 'H' },
      { row: 1, col: 0, letter: 'H' },
      { row: 2, col: 0, letter: 'H' },
      { row: 3, col: 0, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'vertical' && match.shape === 'line4')).toBe(true);
  });

  it('detects horizontal line5', () => {
    const matches = findMatches(withCells([
      { row: 0, col: 0, letter: 'H' },
      { row: 0, col: 1, letter: 'H' },
      { row: 0, col: 2, letter: 'H' },
      { row: 0, col: 3, letter: 'H' },
      { row: 0, col: 4, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'horizontal' && match.shape === 'line5')).toBe(true);
  });

  it('detects vertical line5', () => {
    const matches = findMatches(withCells([
      { row: 0, col: 0, letter: 'H' },
      { row: 1, col: 0, letter: 'H' },
      { row: 2, col: 0, letter: 'H' },
      { row: 3, col: 0, letter: 'H' },
      { row: 4, col: 0, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'vertical' && match.shape === 'line5')).toBe(true);
  });

  it('detects L shape', () => {
    const matches = findMatches(withCells([
      { row: 0, col: 0, letter: 'H' },
      { row: 0, col: 1, letter: 'H' },
      { row: 0, col: 2, letter: 'H' },
      { row: 1, col: 0, letter: 'H' },
      { row: 2, col: 0, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'combo' && match.shape === 'l')).toBe(true);
  });

  it('detects T shape', () => {
    const matches = findMatches(withCells([
      { row: 1, col: 0, letter: 'H' },
      { row: 1, col: 1, letter: 'H' },
      { row: 1, col: 2, letter: 'H' },
      { row: 0, col: 1, letter: 'H' },
      { row: 2, col: 1, letter: 'H' },
    ]));

    expect(matches.some((match) => match.direction === 'combo' && match.shape === 't')).toBe(true);
  });

  it('deduplicates matched positions', () => {
    const matches = findMatches(withCells([
      { row: 1, col: 0, letter: 'H' },
      { row: 1, col: 1, letter: 'H' },
      { row: 1, col: 2, letter: 'H' },
      { row: 0, col: 1, letter: 'H' },
      { row: 2, col: 1, letter: 'H' },
    ]));
    const positions = getMatchedPositions(matches);
    const uniqueKeys = new Set(positions.map((position) => `${position.row}:${position.col}`));

    expect(positions).toHaveLength(uniqueKeys.size);
  });
});

describe('swap', () => {
  const validSwapBoard = boardFromRows(['HHS', 'FSH', 'CGC']);
  const invalidSwapBoard = boardFromRows(['HSF', 'FCG', 'GHS']);

  it('detects adjacent tiles', () => {
    expect(areAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
    expect(areAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false);
  });

  it('rejects non-adjacent swaps', () => {
    expect(trySwap(validSwapBoard, { from: { row: 0, col: 0 }, to: { row: 2, col: 2 } }).valid).toBe(false);
  });

  it('rejects out-of-board swaps', () => {
    expect(trySwap(validSwapBoard, { from: { row: 0, col: 0 }, to: { row: 9, col: 9 } }).valid).toBe(false);
  });

  it('rejects swaps that create no match', () => {
    expect(trySwap(invalidSwapBoard, { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }).valid).toBe(false);
  });

  it('accepts swaps that create a match', () => {
    const result = trySwap(validSwapBoard, { from: { row: 0, col: 2 }, to: { row: 1, col: 2 } });

    expect(result.valid).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('does not mutate the original board for invalid swaps', () => {
    const before = kindLayout(invalidSwapBoard);
    trySwap(invalidSwapBoard, { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } });

    expect(kindLayout(invalidSwapBoard)).toBe(before);
  });
});

describe('cascade', () => {
  const matchBoard = boardFromRows(['HHH', 'SFC', 'CGS']);

  it('removeMatches sets matched positions to null', () => {
    const matches = findMatches(matchBoard);
    const removed = removeMatches(matchBoard, matches);

    expect(removed[0][0]).toBeNull();
    expect(removed[0][1]).toBeNull();
    expect(removed[0][2]).toBeNull();
  });

  it('dropTiles moves nulls to the top of each column', () => {
    const board = createEmptyBoard(3, 3);
    board[0][0] = null;
    board[1][0] = makeTile('heart', 1, 0);
    board[2][0] = null;
    board[0][1] = makeTile('star', 0, 1);
    board[1][1] = null;
    board[2][1] = makeTile('flower', 2, 1);
    board[0][2] = makeTile('candy', 0, 2);
    board[1][2] = makeTile('gift', 1, 2);
    board[2][2] = null;

    const dropped = dropTiles(board);

    expect(dropped[0][0]).toBeNull();
    expect(dropped[1][0]).toBeNull();
    expect(dropped[2][0]?.kind).toBe('heart');
    expect(dropped[0][1]).toBeNull();
    expect(dropped[1][1]?.kind).toBe('star');
    expect(dropped[2][1]?.kind).toBe('flower');
  });

  it('refillBoard removes all nulls', () => {
    const removed = removeMatches(matchBoard, findMatches(matchBoard));
    const refilled = refillBoard(removed, { rng: createRng('refill') });

    expect(hasNull(refilled)).toBe(false);
  });

  it('resolveCascade leaves no nulls', () => {
    const result = resolveCascade(matchBoard, { seed: 'cascade-null' });

    expect(hasNull(result.finalBoard)).toBe(false);
  });

  it('resolveCascade leaves no immediate matches', () => {
    const result = resolveCascade(matchBoard, { seed: 'cascade-match' });

    expect(hasAnyMatch(result.finalBoard)).toBe(false);
  });

  it('maxSteps prevents runaway cascades', () => {
    const result = resolveCascade(boardFromRows(['HHH', 'HHH', 'HHH']), {
      seed: 'max-steps',
      maxSteps: 1,
      tileKinds: DEFAULT_TILE_KINDS,
    });

    expect(result.steps.length).toBeLessThanOrEqual(1);
  });
});

describe('possible moves and reshuffle', () => {
  it('finds possible moves', () => {
    const board = createInitialBoard({ seed: 'find-moves' });

    expect(findPossibleMoves(board).length).toBeGreaterThan(0);
  });

  it('detects boards with no possible move', () => {
    const noMoveBoard = boardFromRows(['HS', 'FC']);

    expect(hasPossibleMove(noMoveBoard)).toBe(false);
  });

  it('reshuffle creates a board with no immediate match', () => {
    const reshuffled = reshuffleBoard(boardFromRows(['HS', 'FC', 'GH']), { seed: 'reshuffle-match' });

    expect(hasAnyMatch(reshuffled)).toBe(false);
  });

  it('reshuffle creates a board with possible moves', () => {
    const reshuffled = reshuffleBoard(createInitialBoard({ seed: 'before-reshuffle' }), {
      seed: 'reshuffle-move',
    });

    expect(hasPossibleMove(reshuffled)).toBe(true);
  });
});
