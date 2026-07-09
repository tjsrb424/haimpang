# Sprint 5 Special Tiles

## Scope

Sprint 5 adds the first special-tile pass to the match-3 engine:

- special creation from line4, line5, L, and T matches
- special activation from matched specials and direct special swaps
- special scoring bonuses
- special missions
- Phaser tile overlays and activation effects
- debug visibility for special state

The core engine owns the rules. Phaser reads `CascadeResult` and animates the result.

## Special Types

`BoardTile.specialKind` supports:

- `line_horizontal`
- `line_vertical`
- `bomb`
- `rainbow`

The tile kind is still the normal `TileKind`; `specialKind` is an optional overlay capability.

## Core Rules

Implemented in:

- `src/game/core/special.ts`
- `src/game/core/cascade.ts`
- `src/game/core/moveResolution.ts`

Creation rules:

- line3 creates no special
- horizontal line4 creates `line_horizontal`
- vertical line4 creates `line_vertical`
- line5 creates `rainbow`
- L/T creates `bomb`
- if the moved tile is inside the match, that position is used
- otherwise line specials use the middle position
- L/T matches use the intersection
- the created tile remains on the board and the other matched tiles are removed

Activation rules:

- a matched special activates before removal
- swapping a special tile with any adjacent tile is a valid move
- horizontal line clears the row
- vertical line clears the column
- bomb clears a clipped 3x3 area
- rainbow with a target kind clears all tiles of that kind
- special-to-special chains are handled by queued sequential activations

## Cascade Contract

Each `CascadeStep` now includes:

- `specialCreations`
- `specialActivations`
- `removedPositions`

`removedPositions` is the union of normal match positions and activated special affected positions, excluding protected special-creation positions.

## Scoring

Base scoring remains:

- removed tile: `+10`
- cascade multiplier stays in `scoreRemovedTiles`

Special activation bonus:

- line: `+50`
- bomb: `+80`
- rainbow: `+120`

## Stage Missions

`StageMission` now supports:

- `create_special`
- `activate_special`

Each special mission accepts a specific `specialKind` or `any`.

Sprint 5 stage hooks:

- Stage 6: create one horizontal line tile
- Stage 8: create one bomb tile
- Stage 10: activate two special tiles
- Stage 15: create one rainbow tile

## Phaser

Implemented in:

- `src/game/phaser/objects/TileView.ts`
- `src/game/phaser/animation/boardTweens.ts`
- `src/game/phaser/scenes/Match3Scene.ts`

Tile overlays are drawn with Phaser Graphics:

- line tiles use a white ribbon and pink guide line
- bomb tiles use concentric rings and sparkle dots
- rainbow tiles use a ring with colored arcs

Activation effects are also Graphics-only:

- row/column sweep for line specials
- pulse for bombs
- sparkle targets for rainbow

No in-game image assets were added.

## Debug

The debug snapshot and debug panel now expose:

- current special tile count
- created special count
- activated special count
- last created special kind
- last activated special kind
- last affected position count

## Automated Tests

Added:

- `tests/core/special.test.ts`

Extended:

- `tests/stage/stageSession.test.ts`

Coverage includes:

- line3 no-special regression
- line4 horizontal/vertical creation
- line5 rainbow creation
- L/T bomb creation
- overlapping combo dedupe
- line, bomb, and rainbow activation
- special-to-special activation chain
- cascade creation position preservation
- matched special activation during cascade
- direct special swap validity
- `create_special` mission progress
- `activate_special any` mission progress
