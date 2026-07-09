import { describe, expect, it } from 'vitest';
import { hasAnyMatch } from '../../src/game/core/match';
import { resolveMoveWithSpecials } from '../../src/game/core/moveResolution';
import {
  createSpecialTileFromMatch,
  determineSpecialTileCreations,
  resolveSpecialActivations,
} from '../../src/game/core/special';
import { resolveCascade } from '../../src/game/core/cascade';
import { findMatches } from '../../src/game/core/match';
import type { BoardGrid, BoardTile, SpecialTileKind, TileKind } from '../../src/game/core/types';

const kindByLetter: Record<string, TileKind> = {
  H: 'heart',
  S: 'star',
  F: 'flower',
  C: 'candy',
  G: 'gift',
};

function makeTile(kind: TileKind, row: number, col: number, specialKind?: SpecialTileKind): BoardTile {
  return {
    id: `special-test:${row}:${col}:${kind}`,
    kind,
    specialKind,
    position: { row, col },
  };
}

function boardFromRows(rows: string[]): BoardGrid {
  return rows.map((row, rowIndex) =>
    [...row].map((letter, colIndex) => makeTile(kindByLetter[letter], rowIndex, colIndex)),
  );
}

function withSpecial(
  board: BoardGrid,
  row: number,
  col: number,
  specialKind: SpecialTileKind,
): BoardGrid {
  return board.map((tiles, rowIndex) =>
    tiles.map((tile, colIndex) =>
      tile && rowIndex === row && colIndex === col
        ? { ...tile, specialKind, position: { row, col } }
        : tile,
    ),
  );
}

function keySet(positions: Array<{ row: number; col: number }>): Set<string> {
  return new Set(positions.map((position) => `${position.row}:${position.col}`));
}

describe('special tile creation rules', () => {
  it('does not create a special for line3', () => {
    const match = findMatches(boardFromRows(['HHH', 'SFC', 'FCG']))[0];

    expect(createSpecialTileFromMatch(match)).toBeNull();
  });

  it('creates a horizontal line tile from line4 at the moved tile when possible', () => {
    const match = findMatches(boardFromRows(['HHHH', 'SFCG', 'FCGH', 'CGHS']))[0];
    const creation = createSpecialTileFromMatch(match, [{ row: 0, col: 1 }]);

    expect(creation).toMatchObject({
      position: { row: 0, col: 1 },
      specialKind: 'line_horizontal',
      kind: 'heart',
    });
  });

  it('creates a vertical line tile from line4', () => {
    const match = findMatches(boardFromRows(['HSFC', 'HFCG', 'HCGS', 'HGSH'])).find(
      (candidate) => candidate.direction === 'vertical',
    );

    expect(match).toBeDefined();
    expect(createSpecialTileFromMatch(match!)?.specialKind).toBe('line_vertical');
  });

  it('creates rainbow from line5 and bomb from L/T matches', () => {
    const line5 = findMatches(boardFromRows(['HHHHH', 'SFCGS', 'FCGSH', 'CGSHF', 'GSHFC'])).find(
      (match) => match.shape === 'line5',
    );
    const combo = findMatches(boardFromRows(['HHH', 'HFC', 'HCG'])).find((match) => match.shape === 'l');

    expect(createSpecialTileFromMatch(line5!)?.specialKind).toBe('rainbow');
    expect(createSpecialTileFromMatch(combo!)?.specialKind).toBe('bomb');
    expect(createSpecialTileFromMatch(combo!)?.position).toEqual({ row: 0, col: 0 });
  });

  it('deduplicates overlapping combo and line candidates', () => {
    const creations = determineSpecialTileCreations(findMatches(boardFromRows(['HHH', 'HFC', 'HCG'])));

    expect(creations).toHaveLength(1);
    expect(creations[0].specialKind).toBe('bomb');
  });
});

describe('special tile activation rules', () => {
  it('clears a whole row or column for line specials', () => {
    const horizontal = withSpecial(boardFromRows(['HSFC', 'SFCG', 'FCGH', 'CGHS']), 1, 1, 'line_horizontal');
    const vertical = withSpecial(boardFromRows(['HSFC', 'SFCG', 'FCGH', 'CGHS']), 1, 1, 'line_vertical');

    expect(keySet(resolveSpecialActivations(horizontal, [{ row: 1, col: 1 }], 'swapped')[0].affectedPositions)).toEqual(
      keySet([
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
      ]),
    );
    expect(keySet(resolveSpecialActivations(vertical, [{ row: 1, col: 1 }], 'swapped')[0].affectedPositions)).toEqual(
      keySet([
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 3, col: 1 },
      ]),
    );
  });

  it('clears a clipped 3x3 area for bomb specials', () => {
    const board = withSpecial(boardFromRows(['HSFC', 'SFCG', 'FCGH', 'CGHS']), 0, 0, 'bomb');
    const activation = resolveSpecialActivations(board, [{ row: 0, col: 0 }], 'swapped')[0];

    expect(keySet(activation.affectedPositions)).toEqual(
      keySet([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ]),
    );
  });

  it('clears every target kind for rainbow specials and chains affected specials', () => {
    const rainbowBoard = withSpecial(boardFromRows(['HSFH', 'SFCG', 'FCGH', 'CGHS']), 1, 1, 'rainbow');
    const chainBoard = withSpecial(
      withSpecial(boardFromRows(['HSFC', 'SFCG', 'FCGH', 'CGHS']), 1, 1, 'line_horizontal'),
      1,
      3,
      'bomb',
    );

    const rainbow = resolveSpecialActivations(rainbowBoard, [{ row: 1, col: 1 }], 'swapped', 'heart')[0];
    const chained = resolveSpecialActivations(chainBoard, [{ row: 1, col: 1 }], 'swapped');

    expect(rainbow.affectedPositions.every((position) => rainbowBoard[position.row][position.col]?.kind === 'heart')).toBe(
      true,
    );
    expect(chained.map((activation) => activation.specialKind)).toEqual(['line_horizontal', 'bomb']);
  });
});

describe('special tile cascade integration', () => {
  it('keeps the created special tile and removes the rest of the match', () => {
    const result = resolveCascade(boardFromRows(['HHHH', 'SFCG', 'FCGH', 'CGHS']), {
      seed: 'special-create-cascade',
    });
    const firstStep = result.steps[0];

    expect(firstStep.specialCreations).toHaveLength(1);
    expect(firstStep.specialCreations[0].specialKind).toBe('line_horizontal');
    expect(keySet(firstStep.removedPositions).has('0:2')).toBe(false);
    expect(result.finalBoard.flat().some((tile) => tile?.specialKind === 'line_horizontal')).toBe(true);
    expect(hasAnyMatch(result.finalBoard)).toBe(false);
  });

  it('activates matched special tiles during cascade resolution', () => {
    const board = withSpecial(boardFromRows(['HHHS', 'SFCG', 'FCGH', 'CGHS']), 0, 1, 'line_horizontal');
    const result = resolveCascade(board, { seed: 'special-match-activation' });
    const firstStep = result.steps[0];

    expect(firstStep.specialActivations.map((activation) => activation.specialKind)).toContain('line_horizontal');
    expect(keySet(firstStep.removedPositions)).toEqual(
      keySet([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]),
    );
  });

  it('accepts direct special swaps even when they do not create a normal match', () => {
    const board = withSpecial(boardFromRows(['HSF', 'SCG', 'FGH']), 1, 1, 'bomb');
    const result = resolveMoveWithSpecials(
      board,
      { from: { row: 1, col: 1 }, to: { row: 1, col: 2 } },
      { seed: 'special-direct-swap' },
    );

    expect(result.valid).toBe(true);
    expect(result.specialActivations[0].specialKind).toBe('bomb');
    expect(result.cascade.totalRemoved).toBeGreaterThan(0);
  });
});
