# Sprint 2 Test Report

## Commands

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm audit`

## Test Coverage

Test file:

- `tests/core/coreEngine.test.ts`

Total tests:

- 34

Covered areas:

- RNG deterministic sequences and bounded picks.
- Initial board dimensions, null safety, no immediate matches, possible moves, and seed-stable layout.
- Horizontal/vertical line3, line4, line5 detection.
- L/T combo detection and matched-position deduplication.
- Adjacent, invalid, out-of-board, no-match, and valid swap behavior.
- Invalid swap immutability.
- remove/drop/refill/cascade behavior.
- maxSteps guard for cascade.
- possible move detection and reshuffle stability.

## Latest Results

- `npm run test`: passed, 34 tests.
- `npm run lint`: passed.
- `npm run build`: passed with existing Phaser chunk size warning.
- `npm audit`: passed, 0 vulnerabilities.

## Mobile Board Size Targets

The target board actual size is measured from the Phaser canvas render region in browser QA.

- 390x844: target at least 328px, measured 333px actual board size, 36px tile size.
- 412x915: target at least 340px, measured 357px actual board size, 39px tile size.
- 430x932: target at least 352px, measured 373px actual board size, 41px tile size.

Screenshots:

- `artifacts/sprint2-game-390x844.png`
- `artifacts/sprint2-game-412x915.png`
- `artifacts/sprint2-game-430x932.png`

Browser checks:

- Game route canvas rendered in all target viewports.
- `document.images`: 0.
- image resource entries: 0.
- console errors: 0.
- page errors: 0.
