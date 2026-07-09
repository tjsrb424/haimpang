# Sprint 3 Animation and Input State

## Scope

Sprint 3 connects the Sprint 2 pure match-3 core to the Phaser board. Phaser now owns pointer input, tile selection, swap animation, invalid rollback, pop/drop/refill animation, cascade sequencing, and feedback hooks.

React still owns the surrounding app shell. It receives a throttled session summary only when a session starts or a swap/cascade sequence completes.

## Input State Machine

The input state machine lives in `src/game/input/inputState.ts`.

States:

- `BOOT`
- `READY`
- `POINTER_DOWN`
- `DRAGGING`
- `SWAP_ATTEMPT`
- `SWAP_ANIMATING`
- `INVALID_ROLLBACK`
- `MATCH_CHECK`
- `POPPING`
- `DROPPING`
- `REFILLING`
- `CASCADE_CHECK`
- `PAUSED`
- `WIN`
- `LOSE`

Board input is accepted only in `READY`. Gesture collection uses `POINTER_DOWN` and `DRAGGING`; animation and cascade states lock board input until the sequence returns to `READY`.

## Session Model

`src/game/phaser/session/GameSession.ts` stores:

- board
- seed
- moveCount
- score
- selectedTile
- inputState
- isBusy
- lastMatches
- cascadeCount
- pointerDownTile
- lastSwipeDirection

`GameSessionSummary` exposes only `score`, `moveCount`, `inputState`, and `cascadeCount` to React.

## Tile Mapping

`TileView` instances are keyed by `BoardTile.id`.

The board-view mapper helpers derive visual changes without duplicating match rules:

- `deriveTileMovements`: maps existing tile ids from one board snapshot to another.
- `deriveRefillSpawns`: detects new refill ids and assigns spawn rows above the board.
- `assertBoardViewCoverage`: test helper for board/view id coverage.

## Swap Flow

Valid swap:

1. `SWAP_ATTEMPT`
2. `trySwap` from the core engine
3. `SWAP_ANIMATING`
4. 135ms tile exchange tween
5. session board is replaced with the swapped core board
6. moveCount increments by 1
7. `MATCH_CHECK`
8. `resolveCascade`
9. pop/drop/refill steps animate in order
10. `READY`

Invalid swap:

1. `SWAP_ATTEMPT`
2. `trySwap` from the core engine
3. `INVALID_ROLLBACK`
4. 90ms forward feedback tween
5. 125ms rollback tween
6. moveCount stays unchanged
7. selectedTile clears
8. `READY`

## Cascade Flow

Each `resolveCascade` step animates as:

1. `POPPING`: matched TileViews play pop tween and are destroyed.
2. score increments by removed tile count with cascade multiplier.
3. `DROPPING`: existing TileViews move by id to dropped positions.
4. `REFILLING`: new TileViews spawn above the board and tween into place.
5. `CASCADE_CHECK`: short delay before the next step when needed.

The final visual map and core board are aligned by tile id after every step.

## Timings

- valid swap: 135ms
- invalid forward: 90ms
- invalid rollback: 125ms
- pop: 120ms
- drop: distance * 55ms, minimum 80ms
- refill: 150ms
- cascade delay: 100ms

## Feedback Hooks

`src/game/phaser/animation/effects.ts` provides stubs:

- `playFeedback('swap-valid')`
- `playFeedback('swap-invalid')`
- `playFeedback('pop')`
- `playFeedback('cascade')`
- `vibrateLight()`

They currently use light Android vibration when available. Real sound assets are deferred.
