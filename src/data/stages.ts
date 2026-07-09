import type { TileKind } from '../game/core/types';

export type MissionType = 'score' | 'collect_tile' | 'cascade';

export interface StageMission {
  type: MissionType;
  target: number;
  tileKind?: TileKind;
  label: string;
}

export interface StageData {
  id: number;
  title: string;
  moveLimit: number;
  targetScore: number;
  missions: StageMission[];
  tileSet: TileKind[];
  unlockReward: {
    stars: number;
    hearts: number;
  };
  couponReward?: string;
  backgroundId: string;
}

const defaultTileSet: TileKind[] = ['heart', 'star', 'flower', 'candy', 'gift'];

export const stages: StageData[] = [
  {
    id: 1,
    title: '첫 선물 상자',
    moveLimit: 24,
    targetScore: 1200,
    missions: [{ type: 'score', target: 1200, label: '점수 1,200점' }],
    tileSet: defaultTileSet,
    unlockReward: { stars: 3, hearts: 1 },
    couponReward: 'coffee',
    backgroundId: 'soft-morning',
  },
  {
    id: 2,
    title: '반짝이는 하루',
    moveLimit: 22,
    targetScore: 1800,
    missions: [{ type: 'collect_tile', target: 18, tileKind: 'star', label: '별 18개' }],
    tileSet: defaultTileSet,
    unlockReward: { stars: 4, hearts: 1 },
    backgroundId: 'warm-evening',
  },
  {
    id: 3,
    title: '달콤한 약속',
    moveLimit: 20,
    targetScore: 2300,
    missions: [{ type: 'cascade', target: 2, label: '연쇄 2회' }],
    tileSet: defaultTileSet,
    unlockReward: { stars: 5, hearts: 1 },
    backgroundId: 'lavender-night',
  },
];
