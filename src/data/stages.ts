import type { TileKind } from '../game/core/types';

export type StageMission =
  | {
      type: 'collect_tile';
      tileKind: TileKind;
      required: number;
      label: string;
    }
  | {
      type: 'score';
      required: number;
      label: string;
    }
  | {
      type: 'clear_tiles';
      required: number;
      label: string;
    }
  | {
      type: 'cascade';
      required: number;
      label: string;
    };

export interface StageReward {
  stars: number;
  hearts?: number;
  couponId?: string;
  memoryTitle?: string;
  memoryDescription?: string;
}

export interface StageDefinition {
  id: number;
  title: string;
  subtitle?: string;
  moveLimit: number;
  targetScore?: number;
  missions: StageMission[];
  reward: StageReward;
  seed: string;
  tileKinds?: TileKind[];
  backgroundId?: string;
}

const defaultTileKinds: TileKind[] = ['heart', 'star', 'flower', 'candy', 'gift'];

export const stages: StageDefinition[] = [
  {
    id: 1,
    title: 'First Gift Box',
    subtitle: 'Warm up with a tiny win.',
    moveLimit: 24,
    targetScore: 300,
    missions: [{ type: 'score', required: 300, label: 'Score 300' }],
    reward: {
      stars: 3,
      hearts: 1,
      couponId: 'coffee',
      memoryTitle: 'First box opened',
      memoryDescription: 'The first HAIMPANG gift box was opened with a sweet little clear.',
    },
    seed: 'stage-001-first-gift',
    tileKinds: defaultTileKinds,
    backgroundId: 'soft-morning',
  },
  {
    id: 2,
    title: 'Heart Basket',
    subtitle: 'Collect a few hearts.',
    moveLimit: 24,
    missions: [{ type: 'collect_tile', tileKind: 'heart', required: 15, label: 'Collect 15 hearts' }],
    reward: { stars: 3, memoryTitle: 'Heart basket', memoryDescription: 'A basket of heart tiles joined the memory shelf.' },
    seed: 'stage-002-heart-basket',
    tileKinds: defaultTileKinds,
    backgroundId: 'peach-bloom',
  },
  {
    id: 3,
    title: 'Star Pouch',
    subtitle: 'Gather a pocket of stars.',
    moveLimit: 23,
    missions: [{ type: 'collect_tile', tileKind: 'star', required: 18, label: 'Collect 18 stars' }],
    reward: { stars: 4, hearts: 1, memoryTitle: 'Star pouch', memoryDescription: 'A bright pouch of stars was saved.' },
    seed: 'stage-003-star-pouch',
    tileKinds: defaultTileKinds,
    backgroundId: 'sunny-cream',
  },
  {
    id: 4,
    title: 'Candy Sweep',
    subtitle: 'Clear a comfortable amount of tiles.',
    moveLimit: 22,
    missions: [{ type: 'clear_tiles', required: 45, label: 'Clear 45 tiles' }],
    reward: { stars: 4, memoryTitle: 'Candy sweep', memoryDescription: 'The board felt softer after a clean sweep.' },
    seed: 'stage-004-candy-sweep',
    tileKinds: defaultTileKinds,
    backgroundId: 'mint-soft',
  },
  {
    id: 5,
    title: 'Tiny Chain',
    subtitle: 'Make one small cascade.',
    moveLimit: 24,
    missions: [{ type: 'cascade', required: 2, label: 'Make a 2-chain cascade' }],
    reward: {
      stars: 5,
      hearts: 1,
      couponId: 'wish',
      memoryTitle: 'Tiny chain',
      memoryDescription: 'A small cascade unlocked a little wish.',
    },
    seed: 'stage-005-tiny-chain',
    tileKinds: defaultTileKinds,
    backgroundId: 'lavender-night',
  },
  {
    id: 6,
    title: 'Flower Note',
    moveLimit: 23,
    missions: [
      { type: 'collect_tile', tileKind: 'flower', required: 18, label: 'Collect 18 flowers' },
      { type: 'score', required: 420, label: 'Score 420' },
    ],
    reward: { stars: 4, memoryTitle: 'Flower note', memoryDescription: 'A soft flower note was added to the diary.' },
    seed: 'stage-006-flower-note',
    tileKinds: defaultTileKinds,
  },
  {
    id: 7,
    title: 'Gift Ribbon',
    moveLimit: 23,
    missions: [
      { type: 'collect_tile', tileKind: 'gift', required: 16, label: 'Collect 16 gifts' },
      { type: 'clear_tiles', required: 42, label: 'Clear 42 tiles' },
    ],
    reward: { stars: 4, hearts: 1, memoryTitle: 'Gift ribbon', memoryDescription: 'A ribbon wrapped around the next little present.' },
    seed: 'stage-007-gift-ribbon',
    tileKinds: defaultTileKinds,
  },
  {
    id: 8,
    title: 'Lunch Hint',
    moveLimit: 22,
    missions: [
      { type: 'score', required: 520, label: 'Score 520' },
      { type: 'collect_tile', tileKind: 'candy', required: 14, label: 'Collect 14 candies' },
    ],
    reward: {
      stars: 5,
      couponId: 'meal',
      memoryTitle: 'Lunch hint',
      memoryDescription: 'A meal coupon peeked out from behind the candies.',
    },
    seed: 'stage-008-lunch-hint',
    tileKinds: defaultTileKinds,
  },
  {
    id: 9,
    title: 'Mint Steps',
    moveLimit: 22,
    missions: [{ type: 'clear_tiles', required: 55, label: 'Clear 55 tiles' }],
    reward: { stars: 4, memoryTitle: 'Mint steps', memoryDescription: 'A steady little clear moved the path forward.' },
    seed: 'stage-009-mint-steps',
    tileKinds: defaultTileKinds,
  },
  {
    id: 10,
    title: 'Sparkle Mix',
    moveLimit: 22,
    missions: [
      { type: 'cascade', required: 2, label: 'Make a 2-chain cascade' },
      { type: 'score', required: 620, label: 'Score 620' },
    ],
    reward: { stars: 5, hearts: 1, memoryTitle: 'Sparkle mix', memoryDescription: 'A small sparkle chain made the board feel alive.' },
    seed: 'stage-010-sparkle-mix',
    tileKinds: defaultTileKinds,
  },
  {
    id: 11,
    title: 'Peach Plan',
    moveLimit: 21,
    missions: [
      { type: 'collect_tile', tileKind: 'heart', required: 20, label: 'Collect 20 hearts' },
      { type: 'score', required: 700, label: 'Score 700' },
    ],
    reward: { stars: 5, memoryTitle: 'Peach plan', memoryDescription: 'A peach-colored plan landed in the memory log.' },
    seed: 'stage-011-peach-plan',
    tileKinds: defaultTileKinds,
  },
  {
    id: 12,
    title: 'Rest Coupon',
    moveLimit: 21,
    missions: [
      { type: 'collect_tile', tileKind: 'flower', required: 22, label: 'Collect 22 flowers' },
      { type: 'clear_tiles', required: 62, label: 'Clear 62 tiles' },
    ],
    reward: {
      stars: 5,
      hearts: 1,
      couponId: 'massage',
      memoryTitle: 'Rest coupon',
      memoryDescription: 'A rest coupon was tucked into the wallet.',
    },
    seed: 'stage-012-rest-coupon',
    tileKinds: defaultTileKinds,
  },
  {
    id: 13,
    title: 'Soft Clock',
    moveLimit: 20,
    missions: [
      { type: 'score', required: 760, label: 'Score 760' },
      { type: 'clear_tiles', required: 66, label: 'Clear 66 tiles' },
    ],
    reward: { stars: 5, memoryTitle: 'Soft clock', memoryDescription: 'A calm clear made time feel slower.' },
    seed: 'stage-013-soft-clock',
    tileKinds: defaultTileKinds,
  },
  {
    id: 14,
    title: 'Gift Stack',
    moveLimit: 20,
    missions: [
      { type: 'collect_tile', tileKind: 'gift', required: 24, label: 'Collect 24 gifts' },
      { type: 'cascade', required: 2, label: 'Make a 2-chain cascade' },
    ],
    reward: { stars: 6, memoryTitle: 'Gift stack', memoryDescription: 'The gift stack grew one layer taller.' },
    seed: 'stage-014-gift-stack',
    tileKinds: defaultTileKinds,
  },
  {
    id: 15,
    title: 'Bright Pocket',
    moveLimit: 20,
    missions: [
      { type: 'collect_tile', tileKind: 'star', required: 25, label: 'Collect 25 stars' },
      { type: 'score', required: 820, label: 'Score 820' },
    ],
    reward: { stars: 6, hearts: 1, memoryTitle: 'Bright pocket', memoryDescription: 'The star pocket got a little brighter.' },
    seed: 'stage-015-bright-pocket',
    tileKinds: defaultTileKinds,
  },
  {
    id: 16,
    title: 'Date Choice',
    moveLimit: 19,
    missions: [
      { type: 'clear_tiles', required: 72, label: 'Clear 72 tiles' },
      { type: 'score', required: 900, label: 'Score 900' },
    ],
    reward: {
      stars: 6,
      couponId: 'date-choice',
      memoryTitle: 'Date choice',
      memoryDescription: 'A date-choice coupon became available.',
    },
    seed: 'stage-016-date-choice',
    tileKinds: defaultTileKinds,
  },
  {
    id: 17,
    title: 'Lavender Run',
    moveLimit: 19,
    missions: [
      { type: 'collect_tile', tileKind: 'candy', required: 24, label: 'Collect 24 candies' },
      { type: 'cascade', required: 2, label: 'Make a 2-chain cascade' },
    ],
    reward: { stars: 6, memoryTitle: 'Lavender run', memoryDescription: 'The lavender path stayed gentle but quick.' },
    seed: 'stage-017-lavender-run',
    tileKinds: defaultTileKinds,
  },
  {
    id: 18,
    title: 'Ribbon Rush',
    moveLimit: 18,
    missions: [
      { type: 'clear_tiles', required: 78, label: 'Clear 78 tiles' },
      { type: 'collect_tile', tileKind: 'heart', required: 22, label: 'Collect 22 hearts' },
    ],
    reward: { stars: 6, hearts: 1, memoryTitle: 'Ribbon rush', memoryDescription: 'A quick ribbon clear was saved.' },
    seed: 'stage-018-ribbon-rush',
    tileKinds: defaultTileKinds,
  },
  {
    id: 19,
    title: 'Almost There',
    moveLimit: 18,
    missions: [
      { type: 'score', required: 980, label: 'Score 980' },
      { type: 'clear_tiles', required: 80, label: 'Clear 80 tiles' },
    ],
    reward: { stars: 7, memoryTitle: 'Almost there', memoryDescription: 'The board whispered that the next present is close.' },
    seed: 'stage-019-almost-there',
    tileKinds: defaultTileKinds,
  },
  {
    id: 20,
    title: 'Tiny Kiss',
    moveLimit: 18,
    missions: [
      { type: 'collect_tile', tileKind: 'star', required: 28, label: 'Collect 28 stars' },
      { type: 'score', required: 1050, label: 'Score 1050' },
    ],
    reward: {
      stars: 8,
      hearts: 2,
      couponId: 'kiss',
      memoryTitle: 'Tiny kiss',
      memoryDescription: 'The twentieth gift opened with a tiny kiss coupon.',
    },
    seed: 'stage-020-tiny-kiss',
    tileKinds: defaultTileKinds,
  },
];
