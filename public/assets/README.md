# HAIMPANG Asset Rules

Sprint 1 separates app launcher assets from in-game and UI assets.

## Folders

- `icons/`: PWA install icons, app launcher icons, favicon-like metadata only.
- `backgrounds/`: app and game background imagery.
- `ui/`: buttons, panels, cards, and decorative UI images.
- `game/`: in-game-only assets.
- `game/tiles/`: match-3 tile assets.
- `game/effects/`: pop, sparkle, score, and other effect assets.
- `legacy/`: preserved legacy visual resources whose runtime usage is undecided.

## Required Rule

icons 폴더의 앱 아이콘은 PWA/런처 아이콘 전용이며, 인게임 리소스로 사용하지 않는다.

## Preserved App Icons

- `icons/icon-192.png`: legacy app icon PNG. The source filename said 192, but the actual image is 2048 x 2048.
- `icons/icon-512.png`: legacy app icon PNG. The source filename said 512, but the actual image is 2048 x 2048.

## Forbidden Icon Uses

Do not use app icons for Phaser scenes, GamePage backgrounds, match-3 tiles, board frames, cards, decorative images, buttons, or placeholders.

Sprint 1 uses CSS gradients and Phaser Graphics for temporary visuals instead of reusing launcher icons.
