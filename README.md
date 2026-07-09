# HAIMPANG Rebuild

HAIMPANG is being rebuilt as a mobile-first personal match-3 PWA.

Device/layout decisions follow `docs/device-target-policy.md`: HAIMPANG targets an installed Android PWA experience on Galaxy Ultra-class portrait phones, not a fully responsive desktop web game.

## Current Scope

- Vite + React + TypeScript app shell.
- Phaser 3 mounted inside the Game page.
- Mobile portrait Home, Game, Wallet, Memory, and Settings screens.
- PWA manifest and app launcher icon assets.
- Versioned localStorage save manager skeleton.
- Sprint 1 design tokens, asset-use rules, and icon-free in-game placeholder board.
- Fixed device target policy for Galaxy Ultra-class Android PWA layout QA.
- Sprint 3 touch input, tap selection, real swap/cascade animation, and session summary wiring.
- Sprint 4 stage loop, mission progress, result overlay, rewards, and local save persistence.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
```

The dev server starts on Vite's default port, usually `http://localhost:5173/`.

## Preserved Legacy Assets

See `public/assets/README.md`.

## Notes

The old static JavaScript, CSS, manifest, and DOM-driven implementation were removed from the runtime path.

App launcher icons live in `public/assets/icons` and are only used by PWA/browser metadata. Game screens and Phaser scenes use CSS and Phaser Graphics placeholders instead.

Sprint 2 should implement the pure TypeScript match-3 core and tests before gameplay logic is wired into Phaser.
