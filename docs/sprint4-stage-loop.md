# Sprint 4 Stage Loop

## Scope

Sprint 4 turns the animated match-3 board into a playable stage loop:

- stage definitions
- mission progress
- move limit
- win/lost status
- result overlay
- replay / next / home flow
- reward handoff from Phaser to React

Phaser owns the board and input. React owns save mutation and route/navigation.

## Data

`src/data/stages.ts` now defines 20 stages with:

- `id`
- `title`
- `subtitle`
- `moveLimit`
- `missions`
- `reward`
- `seed`
- `tileKinds`
- optional `backgroundId`

Supported mission types:

- `score`
- `collect_tile`
- `clear_tiles`
- `cascade`

## StageSession

`src/game/session/stageSession.ts` stores stage progress:

- `stageId`
- `status`
- `score`
- `movesUsed`
- `movesRemaining`
- `missionProgress`
- `cascadeMax`
- `removedTileCount`
- `collectedTiles`

`applyMoveResult` is called only after a valid swap and cascade finish. Invalid swaps do not change move count.

## Win/Lost Order

The status order is:

1. valid swap
2. visual swap animation
3. cascade animation
4. score and removed tile aggregation
5. mission progress update
6. win check
7. lost check
8. `READY`, `WIN`, or `LOSE`

This keeps the final valid move from losing early while a cascade can still complete a mission.

## Phaser/React Boundary

Phaser callbacks:

- `onStageProgress`
- `onStageFinished`

Phaser does not import or mutate `saveManager`.

React/App responsibilities:

- choose current stage
- apply first-clear rewards
- prevent duplicate rewards
- save to localStorage
- show result overlay actions

## Result Overlay

The result overlay is rendered by `GamePage`.

Victory:

- clear message
- score
- moves used
- stars/hearts
- coupon id when present
- next stage
- replay
- home

Lost:

- gentle retry message
- score and moves used
- retry
- home

## Debug

The debug snapshot now includes:

- stageId
- stageStatus
- movesRemaining
- missionProgress
- rewardPending
- inputState
- selectedTile
- cascadeCount
- seed

The panel remains opt-in through Settings.

## Deferred

- stage select map
- special tiles
- boosters
- QR coupon redemption
- richer clear effects
