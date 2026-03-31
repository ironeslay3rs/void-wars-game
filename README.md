# Void Wars: Oblivion

A Next.js game client for a faction-driven sci-fi fantasy RPG centered on district progression, timed missions, biotech hunts, and long-term expansion into Bio, Mecha, and Pure campaign arcs (Book 1 scope).

## Project snapshot

The current repository already establishes the game's core pillars:
- **Three primary faction paths**: Bio, Mecha, and Pure (Ember Vault).
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
- **Production:** host the WS server (Fly.io, Railway, your VPS, etc.), terminate TLS so the browser can use `wss://`, then set **`NEXT_PUBLIC_VOID_WS_URL`** on Vercel to that full URL. Optional server env: `VOID_WS_PORT`, `VOID_WS_HOST` (default bind `0.0.0.0`), `REDIS_URL` for fast auction state persistence, and `DATABASE_URL` (Postgres) for durable snapshots/trade history.

See `.env.example` for variable names.

## Self-hosted stack (Phase 10)

Docker + Compose + optional Caddy TLS for studio / NAS / VPS:

- **Runbook:** [`project-docs/ops/PHASE10_SELF_HOSTED_RUNBOOK.md`](project-docs/ops/PHASE10_SELF_HOSTED_RUNBOOK.md)
- **Compose:** `docker-compose.yml` · **Env template:** `.env.selfhosted.example`
- **Images:** root `Dockerfile` (Next standalone) · `Dockerfile.realtime` (WebSocket server)
- **TLS example:** `deploy/caddy/Caddyfile.example`
- **DB backup:** `scripts/ops/backup-postgres.sh`

`NEXT_PUBLIC_*` variables must be supplied as **build args** when building the `web` image (see runbook).

**Already have a NAS?** The runbook includes a **NAS quickstart** (LAN `http`/`ws`, port mapping, snapshots, Tailscale vs public TLS, weak-CPU build tips).

## Checks

Run local quality gates before shipping:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Release candidate smoke (Steam / production)

After deploy, verify in a **clean browser profile**:

1. Open the production URL, **Login** (Supabase session).
2. **New Game** (or load) — confirm `characterCreated` gate and Home loads.
3. Queue or run a **hunting-ground** mission — void field opens; **extract** banks loot; **hunt result** shows expected rewards.
4. Optional: confirm **realtime** only if `NEXT_PUBLIC_VOID_WS_URL` points at a live `wss://` server.

Full checklist: [`project-docs/workflow/STEAM_RELEASE_READINESS.md`](project-docs/workflow/STEAM_RELEASE_READINESS.md).

## Mobile / “app on your phone”

The site is an **installable PWA** (Web App Manifest + iOS `apple-touch-icon`). On Android/iOS, use the browser’s **Install** / **Add to Home Screen** after deploying over **HTTPS**.

**Roadmap for Play Store / App Store** (Capacitor WebView → same production URL): [`project-docs/workflow/MOBILE_APP_STRATEGY.md`](project-docs/workflow/MOBILE_APP_STRATEGY.md).

**Mobile gotchas:** use **`wss://`** for realtime on production; verify void field + bottom nav on a small viewport.

## Health endpoint

The web app exposes a lightweight health endpoint:

- `GET /api/health`

It reports `status`, current timestamp, and whether key environment variables are set (`NEXT_PUBLIC_SUPABASE_URL` + anon key, `NEXT_PUBLIC_VOID_WS_URL`, optional `REDIS_URL`, `DATABASE_URL`).

