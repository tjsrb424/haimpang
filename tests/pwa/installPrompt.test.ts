import { describe, expect, it } from 'vitest';
import {
  getInstallGuideState,
  isStandaloneMode,
  shouldShowInstallGuide,
  type DisplayModeSource,
} from '../../src/pwa/installPrompt';

function displaySource(matches: boolean): DisplayModeSource {
  return {
    matchMedia: () => ({ matches }),
  };
}

describe('install prompt helpers', () => {
  it('detects standalone display mode', () => {
    expect(isStandaloneMode(displaySource(true))).toBe(true);
    expect(isStandaloneMode(displaySource(false))).toBe(false);
  });

  it('shows guide when not standalone', () => {
    expect(shouldShowInstallGuide(displaySource(false))).toBe(true);
    expect(getInstallGuideState(displaySource(false))).toMatchObject({
      standalone: false,
      shouldShowGuide: true,
    });
  });

  it('hides guide in standalone mode', () => {
    expect(shouldShowInstallGuide(displaySource(true))).toBe(false);
    expect(getInstallGuideState(displaySource(true))).toMatchObject({
      standalone: true,
      shouldShowGuide: false,
    });
  });

  it('is safe without a window-like source', () => {
    expect(isStandaloneMode(undefined)).toBe(false);
    expect(shouldShowInstallGuide(undefined)).toBe(true);
  });
});
