import { createInitialBoard } from '../../core/board';
import type { BoardGrid, BoardPosition, MatchGroup, TileKind } from '../../core/types';
import type { InputState } from '../../input/inputState';
import type { SwipeDirection } from '../../input/swipeDetector';

export interface GameSessionSummary {
  score: number;
  moveCount: number;
  inputState: InputState;
  cascadeCount: number;
}

export interface GameSession {
  board: BoardGrid;
  seed: string | number;
  moveCount: number;
  score: number;
  selectedTile: BoardPosition | null;
  inputState: InputState;
  isBusy: boolean;
  lastMatches: MatchGroup[];
  cascadeCount: number;
  pointerDownTile: BoardPosition | null;
  lastSwipeDirection: SwipeDirection | null;
}

export function createGameSession(seed: string | number, tileKinds?: TileKind[]): GameSession {
  return {
    board: createInitialBoard({ seed, tileKinds }),
    seed,
    moveCount: 0,
    score: 0,
    selectedTile: null,
    inputState: 'READY',
    isBusy: false,
    lastMatches: [],
    cascadeCount: 0,
    pointerDownTile: null,
    lastSwipeDirection: null,
  };
}

export function toSessionSummary(session: GameSession): GameSessionSummary {
  return {
    score: session.score,
    moveCount: session.moveCount,
    inputState: session.inputState,
    cascadeCount: session.cascadeCount,
  };
}

export function scoreRemovedTiles(removedCount: number, cascadeIndex: number): number {
  const multiplier = cascadeIndex === 1 ? 1 : cascadeIndex === 2 ? 1.2 : 1.5;
  return Math.round(removedCount * 10 * multiplier);
}
