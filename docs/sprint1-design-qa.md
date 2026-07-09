# Sprint 1 Design QA

## Asset Rules

- `public/assets/icons/icon-192.png` and `public/assets/icons/icon-512.png` are PWA/app launcher icons only.
- React screens do not render app icon images.
- Phaser scenes do not load app icon images.
- In-game placeholder visuals are made with CSS and Phaser Graphics.

## Design System

- Tokens are defined in `src/styles/tokens.css`.
- Shared surface, card, button, tab, status, and panel styles are defined in `src/styles/global.css`.
- The visual direction is warm pastel, soft pink, cream, peach, lavender, and clean mobile app surfaces.

## Mobile Checks

Generated screenshot targets:

- `artifacts/sprint1-home-390x844.png`
- `artifacts/sprint1-game-390x844.png`
- `artifacts/sprint1-wallet-390x844.png`
- `artifacts/sprint1-memory-390x844.png`
- `artifacts/sprint1-settings-390x844.png`
- `artifacts/sprint1-home-412x915.png`
- `artifacts/sprint1-game-412x915.png`
- `artifacts/sprint1-wallet-412x915.png`
- `artifacts/sprint1-memory-412x915.png`
- `artifacts/sprint1-settings-412x915.png`
- `artifacts/sprint1-home-430x932.png`
- `artifacts/sprint1-game-430x932.png`
- `artifacts/sprint1-wallet-430x932.png`
- `artifacts/sprint1-memory-430x932.png`
- `artifacts/sprint1-settings-430x932.png`

Manual criteria:

- Top app bar remains compact.
- Bottom navigation touch targets are at least 44px tall.
- Android gesture area is protected by safe-area padding.
- Game board frame fits within portrait viewport.
- Phaser canvas is visible and uses no launcher icon assets.
- Wallet, memory, and settings screens share the same design system.

## Known Deferred Work

- Match-3 core logic is deferred to Sprint 2.
- Real coupon redemption and QR behavior are deferred.
- Phaser chunk code splitting can be handled after gameplay wiring.
