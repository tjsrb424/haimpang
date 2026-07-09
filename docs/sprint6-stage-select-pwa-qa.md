# Sprint 6 Stage Select and PWA QA

## Stage Select

Implemented in:

- `src/pages/StageSelectPage.tsx`
- `src/stage/stageSelect.ts`
- `src/App.tsx`

The bottom tab count stays at five. The `게임` tab now opens the stage select subview, while Home `이어서 하기` starts the recommended stage directly.

## Stage State Rules

`getStageSelectStatus(save, stageId)`:

- `cleared`: `stageId` is in `clearedStages`
- `unlocked`: `stageId` is in `unlockedStages` but not cleared
- `locked`: not unlocked

Locked stage buttons are disabled.

## Recommended Stage

`getRecommendedStage(stages, save)` returns:

1. the lowest unlocked stage that has not been cleared
2. otherwise the last unlocked stage
3. otherwise Stage 1

Home and `이어서 하기` use this helper.

## Result Overlay Links

Victory:

- Next stage
- Coupon wallet when the reward includes a coupon
- Stage select
- Replay
- Home

Loss:

- Retry
- Stage select
- Replay
- Home

Replay clear messaging now states that first-clear rewards were already claimed.

## PWA Install Guide

Implemented in:

- `src/pwa/installPrompt.ts`
- `src/pages/HomePage.tsx`
- `src/pages/SettingsPage.tsx`

The helper checks:

- `(display-mode: standalone)`
- `(display-mode: fullscreen)`
- iOS-style `navigator.standalone`

If standalone is detected, the guide changes to an app-running state. Otherwise it shows Android Chrome home-screen guidance.

## Automated Tests

Added:

- `tests/stage/stageSelect.test.ts`
- `tests/pwa/installPrompt.test.ts`

Coverage:

- cleared/unlocked/locked state calculation
- locked stage start guard
- recommended stage calculation
- all-cleared fallback
- special mission marker
- standalone detection
- install guide visibility
- no-window fallback safety

## Validation

Commands:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `rg "Math\\.random|<img|new Image|assets/.*\\.(png|jpg|jpeg|gif|webp)" src tests docs public -n`

Results:

- tests: 12 files passed, 95 tests passed
- lint: passed
- build: passed
- audit: 0 vulnerabilities
- image references: PWA manifest icons only

## Mobile Layout QA

Home/PWA checks:

| Viewport | Home continue | Stage select CTA | Install guide | Coupon count | Console/Page Errors | Images |
| --- | --- | --- | --- | --- | ---: | ---: |
| 390x844 | pass | pass | pass | pass | 0 | 0 |
| 412x915 | pass | pass | pass | pass | 0 | 0 |
| 430x932 | pass | pass | pass | pass | 0 | 0 |

Game board checks:

| Viewport | Canvas | Board | Tile | Console/Page Errors | Images |
| --- | ---: | ---: | ---: | ---: | ---: |
| 390x844 | 358x354 | 341px | 37px | 0 | 0 |
| 412x915 | 380x382 | 365px | 40px | 0 | 0 |
| 430x932 | 398x389 | 373px | 41px | 0 | 0 |

All tile sizes remain above the 36 CSS px minimum.

## Coupon QA

412x915:

- locked coupon state visible
- available coupon detail opened
- code/QR placeholder visible
- confirmation step visible
- coupon changed to `used`
- `usedAt` recorded
- reload-style persistence check passed
- used coupon reuse blocked
- coupon use memory log visible
- console/page errors: 0
- image count: 0

## Stage Select QA

412x915:

- cleared state visible
- unlocked state visible
- locked state visible
- 18 locked stage buttons disabled in a save with only stages 1-2 unlocked
- unlocked Stage 2 started successfully
- result overlay includes Stage select link

## Regression QA

412x915:

- invalid move kept move count unchanged
- Stage 1 clear: won, score 396, moves remaining 20
- Stage 1 special activation: activated count 1
- Stage 6 special mission: `1/1,90/420`
- Stage 20 forced lose: lost, score 612, moves remaining 0
- canvas count: 1 on game screens
- image count: 0
- console/page errors: 0

## Known Issues

- Stage select is a clean list, not a decorative world map.
- QR placeholder is visual only.
- Bundle size warning remains from Phaser and is unchanged in spirit from earlier sprints.

## Sprint 7 Suggestions

- booster 3-pack
- hint system
- shuffle system
- stage balance tuning
- stronger clear celebration
- sound/vibration polish
