import type { BoardGrid, BoardPosition, MatchGroup, TileKind } from './types';

interface LineRun {
  kind: TileKind;
  positions: BoardPosition[];
  direction: 'horizontal' | 'vertical';
}

const keyOf = (position: BoardPosition) => `${position.row}:${position.col}`;

const comparePositions = (a: BoardPosition, b: BoardPosition) => a.row - b.row || a.col - b.col;

const lineShape = (length: number): MatchGroup['shape'] => {
  if (length >= 5) {
    return 'line5';
  }
  if (length === 4) {
    return 'line4';
  }
  return 'line3';
};

function createGroup(
  kind: TileKind,
  positions: BoardPosition[],
  direction: MatchGroup['direction'],
  shape: MatchGroup['shape'],
): MatchGroup {
  const sorted = [...positions].sort(comparePositions);
  const id = `${shape}:${direction}:${kind}:${sorted.map(keyOf).join('|')}`;

  return {
    id,
    kind,
    positions: sorted,
    direction,
    shape,
  };
}

function findLineRuns(board: BoardGrid): LineRun[] {
  const runs: LineRun[] = [];
  const height = board.length;
  const width = board[0]?.length ?? 0;

  for (let row = 0; row < height; row += 1) {
    let col = 0;
    while (col < width) {
      const tile = board[row][col];
      if (!tile) {
        col += 1;
        continue;
      }

      const positions: BoardPosition[] = [{ row, col }];
      let nextCol = col + 1;
      while (nextCol < width && board[row][nextCol]?.kind === tile.kind) {
        positions.push({ row, col: nextCol });
        nextCol += 1;
      }

      if (positions.length >= 3) {
        runs.push({ kind: tile.kind, positions, direction: 'horizontal' });
      }

      col = nextCol;
    }
  }

  for (let col = 0; col < width; col += 1) {
    let row = 0;
    while (row < height) {
      const tile = board[row][col];
      if (!tile) {
        row += 1;
        continue;
      }

      const positions: BoardPosition[] = [{ row, col }];
      let nextRow = row + 1;
      while (nextRow < height && board[nextRow][col]?.kind === tile.kind) {
        positions.push({ row: nextRow, col });
        nextRow += 1;
      }

      if (positions.length >= 3) {
        runs.push({ kind: tile.kind, positions, direction: 'vertical' });
      }

      row = nextRow;
    }
  }

  return runs;
}

function findIntersection(a: LineRun, b: LineRun): BoardPosition | null {
  const aKeys = new Set(a.positions.map(keyOf));
  return b.positions.find((position) => aKeys.has(keyOf(position))) ?? null;
}

function isEndpoint(run: LineRun, position: BoardPosition): boolean {
  const sorted = [...run.positions].sort(comparePositions);
  return keyOf(sorted[0]) === keyOf(position) || keyOf(sorted[sorted.length - 1]) === keyOf(position);
}

function mergePositions(...groups: BoardPosition[][]): BoardPosition[] {
  const map = new Map<string, BoardPosition>();
  for (const positions of groups) {
    for (const position of positions) {
      map.set(keyOf(position), position);
    }
  }
  return [...map.values()].sort(comparePositions);
}

function findComboGroups(runs: LineRun[]): MatchGroup[] {
  const combos = new Map<string, MatchGroup>();
  const horizontalRuns = runs.filter((run) => run.direction === 'horizontal');
  const verticalRuns = runs.filter((run) => run.direction === 'vertical');

  for (const horizontal of horizontalRuns) {
    for (const vertical of verticalRuns) {
      if (horizontal.kind !== vertical.kind) {
        continue;
      }

      const intersection = findIntersection(horizontal, vertical);
      if (!intersection) {
        continue;
      }

      const horizontalEndpoint = isEndpoint(horizontal, intersection);
      const verticalEndpoint = isEndpoint(vertical, intersection);
      const shape: MatchGroup['shape'] = horizontalEndpoint && verticalEndpoint ? 'l' : 't';
      const positions = mergePositions(horizontal.positions, vertical.positions);
      const combo = createGroup(horizontal.kind, positions, 'combo', shape);
      combos.set(combo.id, combo);
    }
  }

  return [...combos.values()];
}

export function findMatches(board: BoardGrid): MatchGroup[] {
  const runs = findLineRuns(board);
  const lineGroups = runs.map((run) =>
    createGroup(run.kind, run.positions, run.direction, lineShape(run.positions.length)),
  );

  return [...findComboGroups(runs), ...lineGroups];
}

export function hasAnyMatch(board: BoardGrid): boolean {
  return findMatches(board).length > 0;
}

export function getMatchedPositions(matches: MatchGroup[]): BoardPosition[] {
  return mergePositions(...matches.map((match) => match.positions));
}
