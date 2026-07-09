# Sprint 2 Core Engine

## Scope

Sprint 2 implements the pure TypeScript match-3 core. React and Phaser still render the app shell and placeholder board only; gameplay input and animation remain deferred.

## Modules

- `src/game/core/rng.ts`: deterministic seeded PRNG with `next`, `pick`, and `int`.
- `src/game/core/types.ts`: shared board, match, swap, and cascade contracts.
- `src/game/core/board.ts`: 8x8 board creation, cloning, tile getters/setters, and stable initial board generation.
- `src/game/core/match.ts`: horizontal, vertical, line4, line5, L, and T match detection.
- `src/game/core/swap.ts`: adjacency, pure swap, and valid/invalid swap judgment.
- `src/game/core/cascade.ts`: remove, drop, refill, and cascade resolution.
- `src/game/core/shuffle.ts`: possible move search and deterministic reshuffle.

## Design Notes

- Randomness flows through `createRng`; core logic does not call `Math.random()`.
- Initial boards are generated tile-by-tile while avoiding immediate left/up 3-matches.
- Initial boards are accepted only when they have no immediate matches and at least one possible move.
- Invalid swaps return the original board reference and do not mutate it.
- Cascade steps preserve board snapshots for later animation work in Phaser.
- Phaser currently reads a seeded preview board only for tile colors/labels.

## Known Limitations

- Special tile creation and activation are typed but not implemented.
- Scoring, mission progress, move spending, win/lose checks, and rewards are not connected yet.
- Phaser has no swap, pop, drop, refill, or input animation in this sprint.
- Refill avoids immediate matches where possible, but cascade resolution remains the authority for clearing follow-up matches.
- Build still reports a large Phaser chunk warning; code splitting is deferred until gameplay wiring settles.
