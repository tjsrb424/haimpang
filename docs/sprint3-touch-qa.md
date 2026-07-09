# Sprint 3 Touch QA

## Device Policy

QA follows `docs/device-target-policy.md`.

Targets:

- 390x844
- 412x915
- 430x932

The game is optimized for Android installed PWA portrait use on Galaxy Ultra-class phones. Desktop only needs to show the centered mobile app frame.

## Automated Browser QA

Dev server:

- `npm run dev -- --port 5174 --strictPort`
- URL: `http://127.0.0.1:5174/`

Chrome automation performed:

- Enter Game tab.
- Wait for Phaser board and debug snapshot.
- Execute one valid swipe from the current possible-move list.
- Confirm moveCount increments and score changes.
- Execute one invalid adjacent swipe.
- Confirm moveCount does not increment.
- Execute one ambiguous diagonal gesture.
- Confirm moveCount does not increment.
- Confirm final inputState is `READY`.
- Confirm image tags and image resources are 0.
- Confirm console errors, page errors, and failed requests are 0.

## Viewport Results

| Viewport | Target board | Measured board | Tile | Valid swipe | Invalid swipe | Ambiguous | Final state |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
| 390x844 | >=328px | 341px | 37px | moveCount 0 -> 1, score 30 | moveCount stayed 1 | moveCount stayed 1 | READY |
| 412x915 | >=340px | 365px | 40px | moveCount 0 -> 1, score 30 | moveCount stayed 1 | moveCount stayed 1 | READY |
| 430x932 | >=352px | 373px | 41px | moveCount 0 -> 1, score 30 | moveCount stayed 1 | moveCount stayed 1 | READY |

Screenshots:

- `artifacts/sprint3-game-390x844.png`
- `artifacts/sprint3-game-412x915.png`
- `artifacts/sprint3-game-430x932.png`

## Unit QA

`tests/input/inputEngine.test.ts` covers:

- pointer-to-tile mapping
- outside board null
- gap area null
- first and last tile boundaries
- exact right edge treated as gap
- right/left/up/down swipe direction
- below-threshold swipe rejection
- ambiguous diagonal rejection
- 1.25 dominant-axis requirement
- READY-only board input
- animation state detection

`tests/phaser/boardViewMapper.test.ts` covers:

- tile movement by id
- refill spawn detection
- board/view id coverage

## Notes

- The board uses Phaser Graphics and text only.
- No in-game icon PNGs or image resources are used.
- Match rules stay in `src/game/core`; Phaser does not duplicate match detection.
- Debug panel remains opt-in through Settings and now shows input/session metrics.
