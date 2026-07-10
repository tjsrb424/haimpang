import type { TileKind } from '../core/types';
import { GAME_COLORS } from './designTokens';

export type BerryVisualId = 'strawberry' | 'cherry' | 'blueberry' | 'green-grape' | 'raspberry';

export interface TilePresentation {
  kind: TileKind;
  visualId: BerryVisualId;
  displayName: string;
  primaryColor: number;
  darkColor: number;
  highlightColor: number;
  textureKey: string;
  assetPath: string;
  popColors: readonly number[];
  silhouette: 'heart' | 'double-round' | 'cluster-round' | 'grape-cluster' | 'seed-cluster';
}

export const TILE_PRESENTATIONS: Record<TileKind, TilePresentation> = {
  heart: {
    kind: 'heart',
    visualId: 'strawberry',
    displayName: '딸기',
    primaryColor: GAME_COLORS.strawberry,
    darkColor: 0xb93555,
    highlightColor: 0xffd7de,
    textureKey: 'berry-strawberry',
    assetPath: '/assets/game/tiles/strawberry.svg',
    popColors: [0xf45f78, 0xff8ea3, 0xfff3da],
    silhouette: 'heart',
  },
  star: {
    kind: 'star',
    visualId: 'cherry',
    displayName: '체리',
    primaryColor: GAME_COLORS.cherry,
    darkColor: 0x9e294f,
    highlightColor: 0xffc8d4,
    textureKey: 'berry-cherry',
    assetPath: '/assets/game/tiles/cherry.svg',
    popColors: [0xdb3f67, 0xff718c, 0xffe5c3],
    silhouette: 'double-round',
  },
  flower: {
    kind: 'flower',
    visualId: 'blueberry',
    displayName: '블루베리',
    primaryColor: GAME_COLORS.blueberry,
    darkColor: 0x41348f,
    highlightColor: 0xd9d2ff,
    textureKey: 'berry-blueberry',
    assetPath: '/assets/game/tiles/blueberry.svg',
    popColors: [0x6554c8, 0x9183eb, 0xe9e5ff],
    silhouette: 'cluster-round',
  },
  candy: {
    kind: 'candy',
    visualId: 'green-grape',
    displayName: '청포도',
    primaryColor: GAME_COLORS.grape,
    darkColor: 0x36805b,
    highlightColor: 0xdff9d7,
    textureKey: 'berry-green-grape',
    assetPath: '/assets/game/tiles/green-grape.svg',
    popColors: [0x65bd86, 0xa4dd9a, 0xf0ffd8],
    silhouette: 'grape-cluster',
  },
  gift: {
    kind: 'gift',
    visualId: 'raspberry',
    displayName: '라즈베리',
    primaryColor: GAME_COLORS.raspberry,
    darkColor: 0x8e285d,
    highlightColor: 0xffc7e1,
    textureKey: 'berry-raspberry',
    assetPath: '/assets/game/tiles/raspberry.svg',
    popColors: [0xc83b7d, 0xef70aa, 0xffd9e8],
    silhouette: 'seed-cluster',
  },
};

export const TILE_PRESENTATION_LIST = Object.values(TILE_PRESENTATIONS);

export function getTilePresentation(kind: TileKind): TilePresentation {
  return TILE_PRESENTATIONS[kind];
}

export function getTileDisplayName(kind: TileKind): string {
  return getTilePresentation(kind).displayName;
}
