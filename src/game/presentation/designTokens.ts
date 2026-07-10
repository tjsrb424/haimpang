export const GAME_COLORS = {
  strawberry: 0xf45f78,
  cherry: 0xdb3f67,
  blueberry: 0x6554c8,
  grape: 0x65bd86,
  raspberry: 0xc83b7d,
  boardCream: 0xfff7e8,
  boardInner: 0xffe9ef,
  comboGold: 0xf1b94b,
  giftRibbon: 0xf184a5,
  lavender: 0xa695e8,
  mint: 0x78cbb5,
} as const;

export const GAME_MOTION = {
  instant: 80,
  fast: 140,
  normal: 260,
  emphasis: 660,
} as const;

export const GAME_DEPTH = {
  background: 0,
  board: 1,
  tile: 3,
  selected: 7,
  pop: 12,
  combo: 20,
} as const;
