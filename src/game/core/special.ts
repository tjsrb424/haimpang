import { cloneBoard, getTile, isInsideBoard } from './board';
import type {
  BoardGrid,
  BoardPosition,
  BoardTile,
  MatchGroup,
  SpecialActivation,
  SpecialActivationReason,
  SpecialCreation,
  SpecialTileKind,
  TileKind,
} from './types';

export const SPECIAL_SCORE_BONUS: Record<SpecialTileKind, number> = {
  line_horizontal: 50,
  line_vertical: 50,
  bomb: 80,
  rainbow: 120,
};

function positionKey(position: BoardPosition): string {
  return `${position.row}:${position.col}`;
}

function samePosition(a: BoardPosition, b: BoardPosition): boolean {
  return a.row === b.row && a.col === b.col;
}

function uniquePositions(positions: BoardPosition[]): BoardPosition[] {
  const seen = new Set<string>();
  const unique: BoardPosition[] = [];

  for (const position of positions) {
    const key = positionKey(position);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ ...position });
    }
  }

  return unique;
}

function sortPositions(positions: BoardPosition[]): BoardPosition[] {
  return [...positions].sort((a, b) => a.row - b.row || a.col - b.col);
}

function chooseComboIntersection(match: MatchGroup): BoardPosition | null {
  const byRow = new Map<number, BoardPosition[]>();
  const byCol = new Map<number, BoardPosition[]>();

  for (const position of match.positions) {
    byRow.set(position.row, [...(byRow.get(position.row) ?? []), position]);
    byCol.set(position.col, [...(byCol.get(position.col) ?? []), position]);
  }

  const rows = Array.from(byRow.values()).filter((positions) => positions.length >= 3).flat();
  const cols = Array.from(byCol.values()).filter((positions) => positions.length >= 3).flat();

  return rows.find((rowPosition) => cols.some((colPosition) => samePosition(rowPosition, colPosition))) ?? null;
}

export function shouldCreateSpecialTile(match: MatchGroup): boolean {
  return match.shape === 'line4' || match.shape === 'line5' || match.shape === 'l' || match.shape === 't';
}

export function specialKindForMatch(match: MatchGroup): SpecialTileKind | null {
  if (match.shape === 'line5') {
    return 'rainbow';
  }
  if (match.shape === 'l' || match.shape === 't') {
    return 'bomb';
  }
  if (match.shape === 'line4') {
    return match.direction === 'vertical' ? 'line_vertical' : 'line_horizontal';
  }
  return null;
}

export function chooseSpecialSpawnPosition(
  match: MatchGroup,
  preferredPositions: BoardPosition[] = [],
): BoardPosition {
  const matchPositions = match.positions;
  const preferred = preferredPositions.find((position) =>
    matchPositions.some((matchPosition) => samePosition(position, matchPosition)),
  );
  if (preferred) {
    return { ...preferred };
  }

  if (match.shape === 'l' || match.shape === 't') {
    const intersection = chooseComboIntersection(match);
    if (intersection) {
      return { ...intersection };
    }
  }

  const sorted = sortPositions(matchPositions);
  return { ...sorted[Math.floor(sorted.length / 2)] };
}

export function createSpecialTileFromMatch(
  match: MatchGroup,
  preferredPositions: BoardPosition[] = [],
): SpecialCreation | null {
  const specialKind = specialKindForMatch(match);
  if (!specialKind) {
    return null;
  }

  return {
    position: chooseSpecialSpawnPosition(match, preferredPositions),
    kind: match.kind,
    specialKind,
    sourceMatchId: match.id,
  };
}

export function determineSpecialTileCreations(
  matches: MatchGroup[],
  preferredPositions: BoardPosition[] = [],
): SpecialCreation[] {
  const usedMatchPositions = new Set<string>();
  const creations: SpecialCreation[] = [];

  for (const match of matches) {
    if (match.positions.some((position) => usedMatchPositions.has(positionKey(position)))) {
      continue;
    }

    const creation = createSpecialTileFromMatch(match, preferredPositions);
    if (!creation) {
      continue;
    }

    for (const position of match.positions) {
      usedMatchPositions.add(positionKey(position));
    }
    creations.push(creation);
  }

  return creations;
}

export function getSpecialAffectedPositions(
  board: BoardGrid,
  tile: BoardTile,
  targetKind?: TileKind,
): BoardPosition[] {
  const width = board[0]?.length ?? 0;
  const height = board.length;

  if (tile.specialKind === 'line_horizontal') {
    return Array.from({ length: width }, (_, col) => ({ row: tile.position.row, col }));
  }

  if (tile.specialKind === 'line_vertical') {
    return Array.from({ length: height }, (_, row) => ({ row, col: tile.position.col }));
  }

  if (tile.specialKind === 'bomb') {
    const positions: BoardPosition[] = [];
    for (let row = tile.position.row - 1; row <= tile.position.row + 1; row += 1) {
      for (let col = tile.position.col - 1; col <= tile.position.col + 1; col += 1) {
        if (isInsideBoard(row, col, width, height)) {
          positions.push({ row, col });
        }
      }
    }
    return positions;
  }

  if (tile.specialKind === 'rainbow' && targetKind) {
    const positions: BoardPosition[] = [];
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        if (board[row][col]?.kind === targetKind) {
          positions.push({ row, col });
        }
      }
    }
    return positions;
  }

  return [{ ...tile.position }];
}

export function resolveSpecialActivations(
  board: BoardGrid,
  positions: BoardPosition[],
  reason: SpecialActivationReason,
  targetKind?: TileKind,
): SpecialActivation[] {
  const activations: SpecialActivation[] = [];
  const activatedIds = new Set<string>();
  const queue = [...positions];

  while (queue.length > 0) {
    const position = queue.shift();
    if (!position) {
      continue;
    }

    const tile = getTile(board, position);
    if (!tile?.specialKind || activatedIds.has(tile.id)) {
      continue;
    }

    const affectedPositions = getSpecialAffectedPositions(board, tile, targetKind);
    activatedIds.add(tile.id);
    activations.push({
      tileId: tile.id,
      position: { ...tile.position },
      kind: tile.kind,
      specialKind: tile.specialKind,
      affectedPositions,
      reason,
    });

    for (const affected of affectedPositions) {
      const affectedTile = getTile(board, affected);
      if (affectedTile?.specialKind && !activatedIds.has(affectedTile.id)) {
        queue.push(affected);
      }
    }
  }

  return activations;
}

export function getActivatedAffectedPositions(activations: SpecialActivation[]): BoardPosition[] {
  return uniquePositions(activations.flatMap((activation) => activation.affectedPositions));
}

export function applySpecialTileCreation(
  board: BoardGrid,
  creations: SpecialCreation[],
): BoardGrid {
  const next = cloneBoard(board);

  for (const creation of creations) {
    const tile = getTile(next, creation.position);
    if (!tile) {
      continue;
    }

    next[creation.position.row][creation.position.col] = {
      ...tile,
      kind: creation.kind,
      specialKind: creation.specialKind,
      position: { ...creation.position },
    };
  }

  return next;
}
