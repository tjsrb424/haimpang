import type { BoardGrid, BoardPosition, BoardTile } from '../../core/types';

export interface TileMovement {
  tileId: string;
  from: BoardPosition;
  to: BoardPosition;
  distance: number;
}

export interface RefillSpawn {
  tile: BoardTile;
  spawnRow: number;
}

function tileKey(tile: BoardTile): string {
  return tile.id;
}

export function mapTilesById(board: BoardGrid): Map<string, BoardTile> {
  const tiles = new Map<string, BoardTile>();
  for (const row of board) {
    for (const tile of row) {
      if (tile) {
        tiles.set(tileKey(tile), tile);
      }
    }
  }
  return tiles;
}

export function getTileAt(board: BoardGrid, position: BoardPosition): BoardTile | null {
  return board[position.row]?.[position.col] ?? null;
}

export function deriveTileMovements(before: BoardGrid, after: BoardGrid): TileMovement[] {
  const beforeTiles = mapTilesById(before);
  const movements: TileMovement[] = [];

  for (const row of after) {
    for (const tile of row) {
      if (!tile) {
        continue;
      }

      const previous = beforeTiles.get(tile.id);
      if (!previous) {
        continue;
      }

      if (previous.position.row !== tile.position.row || previous.position.col !== tile.position.col) {
        movements.push({
          tileId: tile.id,
          from: { ...previous.position },
          to: { ...tile.position },
          distance: Math.abs(previous.position.row - tile.position.row) + Math.abs(previous.position.col - tile.position.col),
        });
      }
    }
  }

  return movements;
}

export function deriveRefillSpawns(before: BoardGrid, after: BoardGrid): RefillSpawn[] {
  const beforeIds = mapTilesById(before);
  const perColumn = new Map<number, number>();
  const spawns: RefillSpawn[] = [];

  for (let row = 0; row < after.length; row += 1) {
    for (let col = 0; col < (after[0]?.length ?? 0); col += 1) {
      const tile = after[row][col];
      if (!tile || beforeIds.has(tile.id)) {
        continue;
      }

      const columnCount = perColumn.get(col) ?? 0;
      perColumn.set(col, columnCount + 1);
      spawns.push({
        tile,
        spawnRow: -1 - columnCount,
      });
    }
  }

  return spawns;
}

export function assertBoardViewCoverage(board: BoardGrid, viewIds: Iterable<string>): boolean {
  const boardIds = mapTilesById(board);
  const visualIds = new Set(viewIds);

  if (boardIds.size !== visualIds.size) {
    return false;
  }

  for (const id of boardIds.keys()) {
    if (!visualIds.has(id)) {
      return false;
    }
  }

  return true;
}
