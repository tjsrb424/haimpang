export interface Rng {
  next: () => number;
  nextInt: (maxExclusive: number) => number;
}

export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return {
    next,
    nextInt: (maxExclusive: number) => Math.floor(next() * maxExclusive),
  };
}
