import { describe, expect, it } from 'vitest';
import {
  canAcceptBoardInput,
  canStartGesture,
  isAnimationState,
  type InputState,
} from '../../src/game/input/inputState';
import { pointerToTile, type BoardLayoutMetrics } from '../../src/game/input/pointerToTile';
import { detectSwipeDirection } from '../../src/game/input/swipeDetector';

const metrics: BoardLayoutMetrics = {
  originX: 10,
  originY: 20,
  tileSize: 40,
  gap: 5,
  boardWidth: 8,
  boardHeight: 8,
};

describe('pointerToTile', () => {
  it('maps tile coordinates to row and col', () => {
    expect(pointerToTile({ x: 10 + 5 + 40 + 5 + 20, y: 20 + 5 + 40 + 5 + 12 }, metrics)).toEqual({
      row: 1,
      col: 1,
    });
  });

  it('returns null outside the board', () => {
    expect(pointerToTile({ x: 8, y: 24 }, metrics)).toBeNull();
    expect(pointerToTile({ x: 500, y: 24 }, metrics)).toBeNull();
  });

  it('returns null for the outer and inner gap areas', () => {
    expect(pointerToTile({ x: 12, y: 27 }, metrics)).toBeNull();
    expect(pointerToTile({ x: 10 + 5 + 40 + 1, y: 20 + 5 + 10 }, metrics)).toBeNull();
  });

  it('keeps first tile upper-left boundary inside', () => {
    expect(pointerToTile({ x: 15, y: 25 }, metrics)).toEqual({ row: 0, col: 0 });
  });

  it('keeps last tile lower-right interior inside', () => {
    const stride = metrics.tileSize + metrics.gap;
    expect(
      pointerToTile(
        {
          x: metrics.originX + metrics.gap + 7 * stride + metrics.tileSize - 1,
          y: metrics.originY + metrics.gap + 7 * stride + metrics.tileSize - 1,
        },
        metrics,
      ),
    ).toEqual({ row: 7, col: 7 });
  });

  it('returns null on exact tile right boundary because it is gap territory', () => {
    expect(pointerToTile({ x: metrics.originX + metrics.gap + metrics.tileSize, y: 30 }, metrics)).toBeNull();
  });
});

describe('swipeDetector', () => {
  it('detects right, left, up, and down swipes', () => {
    expect(detectSwipeDirection({ startX: 0, startY: 0, currentX: 24, currentY: 2, tileSize: 40 }).direction).toBe('right');
    expect(detectSwipeDirection({ startX: 0, startY: 0, currentX: -24, currentY: 2, tileSize: 40 }).direction).toBe('left');
    expect(detectSwipeDirection({ startX: 0, startY: 0, currentX: 2, currentY: -24, tileSize: 40 }).direction).toBe('up');
    expect(detectSwipeDirection({ startX: 0, startY: 0, currentX: 2, currentY: 24, tileSize: 40 }).direction).toBe('down');
  });

  it('rejects movement below threshold', () => {
    expect(
      detectSwipeDirection({ startX: 0, startY: 0, currentX: 10, currentY: 0, tileSize: 40 }),
    ).toMatchObject({
      direction: null,
      reason: 'below-threshold',
    });
  });

  it('rejects diagonal ambiguous movement', () => {
    expect(
      detectSwipeDirection({ startX: 0, startY: 0, currentX: 20, currentY: 18, tileSize: 40 }),
    ).toMatchObject({
      direction: null,
      reason: 'ambiguous',
    });
  });

  it('requires the dominant axis to be at least 1.25x the secondary axis', () => {
    expect(
      detectSwipeDirection({ startX: 0, startY: 0, currentX: 24, currentY: 20, tileSize: 40 }).reason,
    ).toBe('ambiguous');
    expect(
      detectSwipeDirection({ startX: 0, startY: 0, currentX: 26, currentY: 20, tileSize: 40 }).reason,
    ).toBe('confirmed');
  });
});

describe('inputState', () => {
  it('accepts board input only in READY', () => {
    const states: InputState[] = [
      'BOOT',
      'READY',
      'POINTER_DOWN',
      'DRAGGING',
      'SWAP_ATTEMPT',
      'SWAP_ANIMATING',
      'INVALID_ROLLBACK',
      'MATCH_CHECK',
      'POPPING',
      'DROPPING',
      'REFILLING',
      'CASCADE_CHECK',
      'PAUSED',
      'WIN',
      'LOSE',
    ];

    for (const state of states) {
      expect(canAcceptBoardInput(state)).toBe(state === 'READY');
      expect(canStartGesture(state)).toBe(state === 'READY');
    }
  });

  it('marks animation states', () => {
    expect(isAnimationState('SWAP_ANIMATING')).toBe(true);
    expect(isAnimationState('POPPING')).toBe(true);
    expect(isAnimationState('DROPPING')).toBe(true);
    expect(isAnimationState('REFILLING')).toBe(true);
    expect(isAnimationState('READY')).toBe(false);
    expect(isAnimationState('PAUSED')).toBe(false);
  });
});
