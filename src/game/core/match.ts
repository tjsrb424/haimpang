import type { BoardGrid } from './board';

export interface MatchGroup {
  id: string;
  positions: Array<{ row: number; col: number }>;
  shape: 'line' | 'l' | 't';
}

export function findMatches(_board: BoardGrid): MatchGroup[] {
  void _board;
  return [];
}
