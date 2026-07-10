import { describe, expect, it, vi } from 'vitest';
import {
  EFFECT_LAB_CUES,
  EFFECT_LAB_EVENT,
  getEffectLabCue,
  isEffectLabCue,
  requestEffectLabCue,
} from '../../src/game/phaser/debug/effectLab';

describe('effectLab', () => {
  it('accepts only the five supported visual-only cues', () => {
    expect(EFFECT_LAB_CUES).toEqual([
      'combo-2',
      'combo-5',
      'combo-8',
      'combo-10-haimpang',
      'normal-pop',
      'special-pop',
    ]);
    expect(isEffectLabCue('combo-10-haimpang')).toBe(true);
    expect(isEffectLabCue('change-board')).toBe(false);
  });

  it('dispatches a typed browser event without carrying game state', () => {
    const listener = vi.fn();
    window.addEventListener(EFFECT_LAB_EVENT, listener);

    expect(requestEffectLabCue('combo-5')).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getEffectLabCue(listener.mock.calls[0][0] as Event)).toBe('combo-5');

    window.removeEventListener(EFFECT_LAB_EVENT, listener);
  });

  it('rejects malformed event details', () => {
    expect(getEffectLabCue(new CustomEvent(EFFECT_LAB_EVENT, { detail: 'score-up' }))).toBeNull();
    expect(getEffectLabCue(new Event(EFFECT_LAB_EVENT))).toBeNull();
  });
});
