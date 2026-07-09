# Sprint 6 Effects Combo Addendum QA

## Scope

Implemented:

- richer normal and special tile pop bursts in `TileView`
- combo text from cascade step 2 upward
- 10+ combo `하임팡!` finish branch
- vibration feedback hooks for normal pop, special pop, combo, and finish
- debug snapshot fields for last combo count/effect

## Validation

Commands:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `rg -n "Math\\.random|3120|1440|innerWidth \\*" src tests`

Results:

- tests: 14 files passed, 103 tests passed
- lint: passed
- build: passed with the existing Phaser bundle-size warning
- audit: 0 vulnerabilities
- forbidden random/device-pixel sizing: no new random/fixed physical-resolution usage

## Mobile Layout QA

URL:

- `http://127.0.0.2:5173/`

Chrome CDP mobile viewport checks:

| Viewport | Canvas | Board | Tile | Canvas | Images | Bottom tabs |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| 390x844 | 358x354 | 341px | 37px | nonblank | 0 | below game host |
| 412x915 | 380x382 | 365px | 40px | nonblank | 0 | below game host |
| 430x932 | 398x389 | 373px | 41px | nonblank | 0 | below game host |

All target viewports keep tiles above 36 CSS px. Galaxy Ultra-class targets remain 40-41 CSS px.

## Gameplay QA

412x915:

- invalid adjacent move kept `moveCount` unchanged and returned to `READY`
- Stage 1 cleared: `won`, score 306, moves remaining 16
- Stage 1 save reward persisted: stage 1 cleared, stage 2 unlocked, 1 coupon available, top memory log `stage-1-clear`
- 2 combo observed during Stage 1: `lastComboCount: 2`, `lastComboEffect: combo`
- Stage 6 special mission reached `1/1,60/420`, created `line_horizontal`
- Stage 20 forced lose reached `lost`, score 837, moves remaining 0, reward pending false
- console/page errors: 0

## 10+ Combo

The 10+ combo natural cascade was not hit during deterministic browser play. The branch is covered by unit tests:

- `shouldShowHaimpangBurst(10) === true`
- `shouldShowHaimpangBurst(11) === true`
- 10+ duration is stronger than ordinary combo duration
- `haimpang-finish` vibration pattern is tested
