# Void Wars: Oblivion

A Next.js prototype for a faction-driven sci-fi fantasy RPG centered on district progression, timed missions, biotech hunts, and long-term expansion into Bio, Mecha, and Spirit campaign arcs.

## Project snapshot

The current repository already establishes the game's core pillars:
- **Three primary faction paths**: Bio, Mecha, and Spirit.
- **A city-based progression hub** anchored by the Black Bazaar and its specialized districts.
- **A first-session gameplay loop** built around exploration, biotech lead discovery, hunt resolution, and recovery.
- **Expansion-ready system shells** for careers, professions, arena combat, guild progression, faction HQs, and gate travel.

## Current gameplay foundation

The prototype currently supports or scaffolds these systems:
- global player state and persistence,
- mission queue and timed operations,
- condition and recovery flow,
- hunt-result progression,
- rank, mastery, and influence growth,
- district screens for Bio, Mecha, Spirit, Arena, Guild, Crafting, and Travel.

## Expansion planning

A new world and expansion roadmap is available here:
- [`docs/world-expansion-plan.md`](docs/world-expansion-plan.md)

That document converts the current repo's lore, mission data, district structure, and faction language into a practical multi-book expansion plan.

## Development

Install dependencies and run the app locally:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Realtime WebSocket (field + social chat)

The Next.js app does **not** expose a WebSocket server on Vercel. Chat and void-field realtime expect a separate process: `npm run dev:ws` (see `server/void-realtime/wsServer.ts`).

- **Local:** run `npm run dev` and, in another terminal, `npm run dev:ws`. Clients default to `ws://localhost:3002`.
- **Production:** host the WS server (Fly.io, Railway, your VPS, etc.), terminate TLS so the browser can use `wss://`, then set **`NEXT_PUBLIC_VOID_WS_URL`** on Vercel to that full URL. Optional server env: `VOID_WS_PORT`, `VOID_WS_HOST` (default bind `0.0.0.0`), and `REDIS_URL` for persisted auction listings/accounts/history across server restarts.

See `.env.example` for variable names.

## Checks

