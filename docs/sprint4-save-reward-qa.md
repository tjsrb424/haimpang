# Sprint 4 Save and Reward QA

## Reward Rules

`applyStageClearReward` applies rewards only on first clear.

First clear:

- adds `stage.id` to `clearedStages`
- adds the next stage to `unlockedStages`
- grants `reward.stars`
- grants `reward.hearts` when present
- unlocks `reward.couponId` when present
- prepends a memory log when `memoryTitle` is present
- updates `lastPlayedAt`

Replay clear:

- does not grant duplicate stars
- does not grant duplicate hearts
- does not duplicate memory logs
- does not downgrade available or used coupons

## Automated Tests

Added:

- `tests/data/stages.test.ts`
- `tests/stage/stageSession.test.ts`
- `tests/save/stageReward.test.ts`

Coverage:

- 20+ unique stage ids
- stage move limits, missions, rewards, seeds
- coupon reward ids exist
- valid move increments moves
- invalid move does not increment moves
- score, collect, clear_tiles, and cascade mission progress
- win/lost status
- final move win before lost
- first-clear reward
- duplicate reward prevention
- coupon unlock stability
- export/import preservation

## Browser QA

Dev server:

- `npm run dev -- --port 5174 --strictPort`
- URL: `http://127.0.0.1:5174/`

Stage 1 clear QA:

| Viewport | Board | Tile | Invalid move | Clear | Result | Save after reload |
| --- | ---: | ---: | --- | --- | --- | --- |
| 390x844 | 341px | 37px | moves stayed 24 | won in 8 valid moves, score 306 | overlay visible | cleared `[1]`, unlocked `[1,2]`, coffee available |
| 412x915 | 365px | 40px | moves stayed 24 | won in 8 valid moves, score 306 | overlay visible | cleared `[1]`, unlocked `[1,2]`, coffee available |
| 430x932 | 373px | 41px | moves stayed 24 | won in 8 valid moves, score 306 | overlay visible | cleared `[1]`, unlocked `[1,2]`, coffee available |

Saved reward values after Stage 1:

- stars: 15
- hearts: 6
- `clearedStages`: `[1]`
- `unlockedStages`: `[1,2]`
- coffee coupon: `available`
- top memory log: `stage-1-clear`

Reload check:

- stars/hearts persisted
- cleared/unlocked stages persisted
- coupon status persisted
- memory log persisted

Result button smoke:

- Replay returns Stage 1 to `playing` with 24 moves.
- Next stage starts Stage 2 with 24 moves.

Lost path smoke:

- Stage 20 with only stage 20 unlocked reached `lost`.
- Final state: `LOSE`
- movesRemaining: 0
- score: 612
- result overlay visible

## Asset and Console QA

- console errors: 0
- page errors: 0
- failed requests: 0
- `document.images`: 0
- image resources: 0
- app launcher icons are still metadata-only, not in-game assets

## Known Issues

- Stage balance is intentionally easy for early stages and still needs real play feel tuning.
- Result overlay copy is functional and gentle, but clear animation can be richer in Sprint 5.
- There is no full stage select map yet.

## Sprint 5 Suggestions

- special tile creation and activation
- boosters
- coupon wallet redemption flow
- QR/code presentation polish
- stage select screen
- stronger clear celebration
- PWA install guidance
