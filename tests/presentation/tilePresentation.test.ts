import { describe, expect, it } from 'vitest';
import type { TileKind } from '../../src/game/core/types';
import {
  getTileDisplayName,
  TILE_PRESENTATION_LIST,
  TILE_PRESENTATIONS,
} from '../../src/game/presentation/tilePresentation';

const tileKinds: TileKind[] = ['heart', 'star', 'flower', 'candy', 'gift'];

describe('berry tile presentation', () => {
  it('maps every frozen TileKind to one Korean berry presentation', () => {
    expect(Object.keys(TILE_PRESENTATIONS)).toEqual(tileKinds);
    expect(tileKinds.map(getTileDisplayName)).toEqual([
      '딸기',
      '체리',
      '블루베리',
      '청포도',
      '라즈베리',
    ]);
  });

  it('uses unique preloaded texture keys and SVG asset paths', () => {
    expect(new Set(TILE_PRESENTATION_LIST.map((tile) => tile.textureKey)).size).toBe(5);
    expect(new Set(TILE_PRESENTATION_LIST.map((tile) => tile.assetPath)).size).toBe(5);
    expect(TILE_PRESENTATION_LIST.every((tile) => tile.assetPath.endsWith('.svg'))).toBe(true);
  });

  it('keeps distinct silhouettes and berry pop palettes', () => {
    expect(new Set(TILE_PRESENTATION_LIST.map((tile) => tile.silhouette)).size).toBe(5);
    expect(TILE_PRESENTATION_LIST.every((tile) => tile.popColors.length >= 3)).toBe(true);
  });
});
