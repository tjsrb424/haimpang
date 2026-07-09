export type InputState =
  | 'BOOT'
  | 'READY'
  | 'POINTER_DOWN'
  | 'DRAGGING'
  | 'SWAP_ATTEMPT'
  | 'SWAP_ANIMATING'
  | 'INVALID_ROLLBACK'
  | 'MATCH_CHECK'
  | 'POPPING'
  | 'DROPPING'
  | 'REFILLING'
  | 'CASCADE_CHECK'
  | 'PAUSED'
  | 'WIN'
  | 'LOSE';

const animationStates = new Set<InputState>([
  'SWAP_ANIMATING',
  'INVALID_ROLLBACK',
  'POPPING',
  'DROPPING',
  'REFILLING',
]);

export function canAcceptBoardInput(state: InputState): boolean {
  return state === 'READY';
}

export function canStartGesture(state: InputState): boolean {
  return state === 'READY';
}

export function isAnimationState(state: InputState): boolean {
  return animationStates.has(state);
}
