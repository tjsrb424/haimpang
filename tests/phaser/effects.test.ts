import { afterEach, describe, expect, it, vi } from 'vitest';
import { playFeedback } from '../../src/game/phaser/animation/effects';

function setVibrateMock(mock: ReturnType<typeof vi.fn>): void {
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: mock,
  });
}

describe('feedback effects', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('respects the vibration setting', () => {
    const vibrate = vi.fn();
    setVibrateMock(vibrate);

    playFeedback('combo-up', false);

    expect(vibrate).not.toHaveBeenCalled();
  });

  it('uses stronger patterns for combo and haimpang finish hooks', () => {
    const vibrate = vi.fn();
    setVibrateMock(vibrate);

    playFeedback('combo-up', true);
    playFeedback('haimpang-finish', true);

    expect(vibrate).toHaveBeenNthCalledWith(1, [10, 18, 14]);
    expect(vibrate).toHaveBeenNthCalledWith(2, [20, 26, 26, 30, 18]);
  });

  it('separates normal and special pop hooks', () => {
    const vibrate = vi.fn();
    setVibrateMock(vibrate);

    playFeedback('pop', true);
    playFeedback('special-pop', true);

    expect(vibrate).toHaveBeenNthCalledWith(1, 12);
    expect(vibrate).toHaveBeenNthCalledWith(2, [16, 18, 10]);
  });
});
