import { describe, expect, it } from 'vitest';
import type { BoardGrid, BoardTile, TileKind } from '../../src/game/core/types';
import {
  assertBoardViewCoverage,
  deriveRefillSpawns,
  deriveTileMovements,
} from '../../src/game/phaser/session/boardViewMapper';

function tile(id: string, kind: TileKind, row: number, col: number): BoardTile {
  return {
    id,
    kind,
    position: { row, col },
  };
}

describe('boardViewMapper', () => {
  it('detects tile movement by id', () => {
    const before: BoardGrid = [[tile('a', 'heart', 0, 0)], [null], [tile('b', 'star', 2, 0)]];
    const after: BoardGrid = [[null], [tile('a', 'heart', 1, 0)], [tile('b', 'star', 2, 0)]];

    expect(deriveTileMovements(before, after)).toEqual([
      {
        tileId: 'a',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 },
        distance: 1,
      },
    ]);
  });

  it('detects refill spawns for new tile ids', () => {
    const before: BoardGrid = [[null], [tile('a', 'heart', 1, 0)]];
    const after: BoardGrid = [[tile('new', 'gift', 0, 0)], [tile('a', 'heart', 1, 0)]];

    expect(deriveRefillSpawns(before, after)).toEqual([
      {
        tile: tile('new', 'gift', 0, 0),
        spawnRow: -1,
      },
    ]);
  });

  it('checks that board and view ids match', () => {
    const board: BoardGrid = [[tile('a', 'heart', 0, 0), tile('b', 'star', 0, 1)]];

    expect(assertBoardViewCoverage(board, ['a', 'b'])).toBe(true);
    expect(assertBoardViewCoverage(board, ['a'])).toBe(false);
    expect(assertBoardViewCoverage(board, ['a', 'c'])).toBe(false);
  });
});
