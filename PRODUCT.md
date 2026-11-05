# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual players looking for a 2D platform game with progression through levels.

## Product Purpose

Final Acces is a browser game centered on 2D platforming and progression. Players choose and complete levels, then review their results and continue progressing. The product also includes accounts and profiles, character selection, missions, a store, and multiplayer lobbies.

## Positioning

Open. The repository describes a 2D platform game with progression but does not document a distinct differentiator or market position.

## Operating Context

Players use the web app to register or sign in, select a character and level, play, and review a level summary. Multiplayer lobbies are also available. Gameplay supports keyboard controls and touch controls on touch devices.

## Capabilities and Constraints

- Frontend: Vue 3, Vite 8, Pinia, Vue Router, Tailwind CSS 4, Flowbite, and Phaser 4.2.
- Backend: Node.js 22, Fastify 4, TypeScript, Drizzle ORM, and PostgreSQL; the README identifies Neon as the hosted database.
- The app includes accounts, profiles, character selection, level progression, missions, a store, and multiplayer lobbies.
- Keyboard gameplay uses A/D or the left/right arrow keys to move, Space or the up arrow to jump, L to attack, and G to pick up a key or open a door. Touch devices have on-screen movement and action controls.

## Brand Commitments

The repository names the product “Final Acces.” The README and most interface copy are in Spanish. No formal voice guide or external brand guide is documented.

## Evidence on Hand

`README.md` documents the product and technical stack. `src/views/` and `src/game/` contain the game, progression, account, and multiplayer flows; `public/maps/` and `public/img/` contain game maps and visual assets. No testimonials, customer claims, or comparative evidence are documented.

## Product Principles

- Keep 2D platforming and level progression at the center of the experience.
- Make it clear how players enter a level and continue after completing one.
- Keep accounts, characters, missions, and multiplayer in service of playing and progressing.
- Reflect level outcomes in the player's progression and results.
