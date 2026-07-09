# Sprint 5 Special Tile QA

## Commands

Validation commands:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `rg "Math\\.random|<img|new Image|assets/.*\\.(png|jpg|jpeg|gif|webp)" src tests docs public -n`

Results:

- tests: 7 files passed, 77 tests passed
- lint: passed
- build: passed
- audit: 0 vulnerabilities
- runtime images: 0 `document.images` on game screens
- image references: PWA manifest icons only

## Dev Server

QA server:

- `npm run dev -- --port 5174 --strictPort`
- URL: `http://127.0.0.1:5174/`

Port 5173 was already in use, so Sprint 5 QA used 5174.

## Viewport Layout QA

| Viewport | Canvas | Board | Tile | Console/Page Errors | Images | Canvas |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 390x844 | 358x354 | 341px | 37px | 0 | 0 | nonblank |
| 412x915 | 380x382 | 365px | 40px | 0 | 0 | nonblank |
| 430x932 | 398x389 | 373px | 41px | 0 | 0 | nonblank |

Notes:

- All target viewport tile sizes stayed above the 36 CSS px minimum.
- Galaxy Ultra-class target viewports stayed in the 40-41 CSS px tile range.
- Board remained centered inside the mobile app frame.
- Bottom tabs remained below the game area and did not cover the board.

## Stage 1 Clear QA

Viewport:

- 412x915

Result:

- stage: 1
- final status: `won`
- final input state: `WIN`
- valid moves used: 4
- moves remaining: 20
- score: 396
- mission: `300/300`
- created specials: 3
- activated specials: 1
- last created: `line_horizontal`
- last activated: `line_horizontal`
- last affected positions: 8
- console/page errors: 0
- images: 0

This confirms the normal stage-clear loop still works with special tiles in the cascade path.

## Stage 6 Special Mission QA

Viewport:

- 412x915

Setup:

- QA save unlocked stages 1-6 and marked stages 1-5 as cleared.
- Start game selected Stage 6.

Result:

- stage: 6
- status after special mission progress: `playing`
- valid moves used: 3
- moves remaining: 20
- score: 90
- mission progress: `1/1,90/420`
- special tiles on board: 1
- created specials: 1
- activated specials: 0
- last created: `line_horizontal`
- console/page errors: 0
- images: 0

This confirms `create_special` mission progress and the line-tile visual state.

## Stage 20 Forced Lose QA

Viewport:

- 412x915

Setup:

- QA save unlocked stages 1-20 and marked stages 1-19 as cleared.
- Low-score move selection was used to avoid completing Stage 20 missions.

Result:

- stage: 20
- final status: `lost`
- final input state: `LOSE`
- valid moves used: 18
- moves remaining: 0
- score: 612
- mission progress: `6/28,612/1050`
- reward pending: false
- console/page errors: 0
- images: 0

This confirms the lost path still works after special-tile changes.

## Asset QA

- No new image assets were added for special tiles.
- Special tile overlays use Phaser Graphics.
- Special activation effects use Phaser Graphics.
- PWA icon files remain launcher metadata only.

## Known Follow-Ups

- Stage balance is still first-pass and should be tuned after more manual play.
- Special-to-special combinations are sequential v1 behavior, not bespoke combo recipes.
- Debug panel is useful for QA but can cover the board, so automated input QA runs with the panel hidden.
