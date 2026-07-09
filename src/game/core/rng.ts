export interface Rng {
  next(): number;
  pick<T>(items: readonly T[]): T;
  int(minInclusive: number, maxInclusive: number): number;
}

function normalizeSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return seed >>> 0;
  }

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seed: string | number): Rng {
  let state = normalizeSeed(seed) || 0x9e3779b9;

  const next = () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 0x100000000;
  };

  return {
    next,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error('Cannot pick from an empty array.');
      }
      return items[this.int(0, items.length - 1)];
    },
    int(minInclusive: number, maxInclusive: number): number {
      if (maxInclusive < minInclusive) {
        throw new Error('Invalid integer range.');
      }
      return Math.floor(next() * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
  };
}

export function createSeededRng(seed: string | number): Rng {
  return createRng(seed);
}
