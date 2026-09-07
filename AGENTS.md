# AGENTS.md

## Project layout

- The real app is `final-acces/` (Vue 3 + Vite 8 + Pinia + Vue Router + Tailwind 4 + Flowbite + Phaser 4.2). Root `README.md` and root `package-lock.json` are stubs — run everything from `final-acces/`.
- App pages: `src/views/*.vue`; shared UI: `src/components/` (incl. `HUD.vue`); Pinia stores: `src/stores/`; routes: `src/router/index.js`.
- Phaser game: `src/game/scenes/` (one file per level), `src/game/objects/` (Player, Enemy, Box, Key, AttackHitbox, projectile).

## Commands (run inside `final-acces/`)

- `npm run dev` — Vite dev server; `npm run build` / `npm run preview`
- `npm run lint` — oxlint + eslint, both run with `--fix` (they rewrite files); eslint uses a cache
- `npm run format` — prettier on `src/` only
- No test suite is configured.

## Game wiring (non-obvious)

- The only live Phaser bootstrap is `src/views/GameView.vue:onMounted` (creates `Phaser.Game` in `#game-container`, starting **Level2Scene**). `src/game/main.js` is an unused standalone bootstrap (no physics, no parent element) referenced nowhere — a new/edited scene won't run unless wired up in `GameView.vue`.
- `GameView.vue` imports `Level1Scene` but never starts it. Verify which scene you touched before claiming a level is reachable.
- Phaser and Vue share state via Pinia: `src/game/objects/player.js` mutates `useGameStore()` (`src/stores/game.js`, fields `vidas`, `llaves`, `enemigos`), which `src/components/HUD.vue` reads.
- Controls (defined in `player.js`): A/D move, SPACE jump, L attack, G pick up key / open door.
- Level assets are Tiled maps at `public/maps/Mapa_level_*.json` plus tilesets in `public/tiles/` and sprites in `public/img/`, loaded in each scene's `preload()` with root-relative paths (`/img/...`, `/maps/...`). Map edits go through Tiled JSON.
- Object-layer names must match the map exactly: Level 1 reads `map.getObjectLayer('DoorObjet')` (intentional typo matching the JSON); Level 2 uses `'DoorObject'` and `'PinchosDanger'`.
- Animations (`caminar`, `saltar`, `atacar`, …) are recreated per scene in `create()`; a new scene must define them before `play()`.
- `Player.atacar()` assumes `scene.enemies` and `scene.boxes` exist — Level2Scene doesn't create them yet, so combat is Level-1-only.
- Tailwind 4 is configured CSS-first in `src/assets/main.css` (no `tailwind.config.js`; custom fonts via `.font-pixel`, `.font-goldman`, etc.).

## Style

- Prettier defaults: `semi: false`, `singleQuote`, `printWidth: 100`. Older game code (`src/game/`) predates this and uses semicolons/double quotes/4-space indent — match the surrounding file rather than reformatting whole files; `npm run format` is the normalization path.
- Comments and console logs in the codebase are frequently in Spanish; leave them consistent.