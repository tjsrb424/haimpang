import { describe, expect, it } from 'vitest';
import {
  getComboEffectDuration,
  getComboEffectTier,
  getEffectAnchorFromMatchedPositions,
  shouldShowComboText,
  shouldShowHaimpangBurst,
} from '../../src/game/phaser/animation/comboEffects';
import type { BoardLayoutMetrics } from '../../src/game/input/pointerToTile';

const metrics: BoardLayoutMetrics = {
  originX: 10,
  originY: 20,
  tileSize: 40,
  gap: 4,
  boardWidth: 8,
  boardHeight: 8,
};

describe('comboEffects', () => {
  it('shows combo text from the second cascade step', () => {
    expect(shouldShowComboText(1)).toBe(false);
    expect(shouldShowComboText(2)).toBe(true);
  });

  it('uses stronger tiers as the cascade count grows', () => {
    expect(getComboEffectTier(1)).toBe('none');
    expect(getComboEffectTier(2)).toBe('soft');
    expect(getComboEffectTier(4)).toBe('bright');
    expect(getComboEffectTier(7)).toBe('celebration');
    expect(getComboEffectTier(10)).toBe('haimpang');
  });

  it('reserves the haimpang finish for ten combo or higher', () => {
    expect(shouldShowHaimpangBurst(9)).toBe(false);
    expect(shouldShowHaimpangBurst(10)).toBe(true);
    expect(shouldShowHaimpangBurst(11)).toBe(true);
    expect(getComboEffectDuration(10)).toBeGreaterThan(getComboEffectDuration(4));
  });

  it('anchors combo text at the average center of removed positions', () => {
    expect(
      getEffectAnchorFromMatchedPositions(
        [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 1, col: 0 },
        ],
        metrics,
      ),
    ).toEqual({
      x: (34 + 78 + 34) / 3,
      y: (44 + 44 + 88) / 3,
    });
  });

  it('falls back to the board center when no positions are available', () => {
    expect(getEffectAnchorFromMatchedPositions([], metrics)).toEqual({
      x: 188,
      y: 198,
    });
  });
});
