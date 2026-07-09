# HAIMPANG Rebuild

HAIMPANG is being rebuilt as a mobile-first personal match-3 PWA.

## Sprint 0 Scope

- Vite + React + TypeScript project skeleton.
- Phaser 3 mounted inside the Game page.
- Mobile portrait app shell with Home, Game, Wallet, Memory, and Settings tabs.
- PWA manifest and preserved app icon assets.
- Versioned localStorage save manager skeleton.

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

The old static JavaScript, CSS, manifest, and DOM-driven implementation were removed from the runtime path. Sprint 1 will add the pure TypeScript match-3 core and tests before gameplay logic is wired into Phaser.
