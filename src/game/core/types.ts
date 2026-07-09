export type TileKind = 'heart' | 'star' | 'flower' | 'candy' | 'gift';

export type SpecialTileKind = 'line_horizontal' | 'line_vertical' | 'bomb' | 'rainbow';

export type GameState =
  | 'BOOT'
  | 'READY'
  | 'POINTER_DOWN'
  | 'DRAGGING'
  | 'SWAP_ATTEMPT'
  | 'SWAP_ANIMATING'
  | 'MATCH_CHECK'
  | 'POPPING'
  | 'DROPPING'
  | 'REFILLING'
  | 'CASCADE_CHECK'
  | 'MISSION_CHECK'
  | 'WIN'
  | 'LOSE'
  | 'PAUSED';

export interface BoardPosition {
  row: number;
  col: number;
}

export interface BoardTile {
  id: string;
  kind: TileKind;
  specialKind?: SpecialTileKind;
  position: BoardPosition;
}

export type BoardGrid = Array<Array<BoardTile | null>>;

export interface MatchGroup {
  id: string;
  kind: TileKind;
  positions: BoardPosition[];
  direction: 'horizontal' | 'vertical' | 'combo';
  shape: 'line3' | 'line4' | 'line5' | 'l' | 't';
}

export interface SwapMove {
  from: BoardPosition;
  to: BoardPosition;
}

export interface SwapResult {
  valid: boolean;
  board: BoardGrid;
  matches: MatchGroup[];
}

export interface CascadeStep {
  boardBefore: BoardGrid;
  matches: MatchGroup[];
  removedPositions: BoardPosition[];
  droppedBoard: BoardGrid;
  refilledBoard: BoardGrid;
}

export interface CascadeResult {
  finalBoard: BoardGrid;
  steps: CascadeStep[];
  totalRemoved: number;
}
