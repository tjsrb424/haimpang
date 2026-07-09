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
