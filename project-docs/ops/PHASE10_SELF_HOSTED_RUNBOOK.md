# Phase 10 — Self-hosted platform path (runbook)

Codex reference: **Phase 10 — Self-hosted platform path** (staging, Docker, reverse proxy, backups, NAS-style deploy). This repo now ships **optional** artifacts; **you** operate them.

---

## What is included

| Artifact | Purpose |
| -------- | ------- |
| `next.config.ts` `output: "standalone"` | Slim production Node bundle for Docker |
| `Dockerfile` | Next.js `web` image |
| `Dockerfile.realtime` | `wsServer.ts` + full `features/` (tsx + `@/` paths) |
| `docker-compose.yml` | `web` + `realtime` + **Redis** + **Postgres** (auction persistence) |
| `.env.selfhosted.example` | Env template for compose + **build args** |
| `deploy/caddy/Caddyfile.example` | TLS termination + reverse proxy to `web` / `realtime` |
| `scripts/ops/backup-postgres.sh` | `pg_dump` helper for bundled Postgres |

---

## Prerequisites

- Docker + Docker Compose v2
- DNS + public IP (or internal NAS only — no Let’s Encrypt)
- **Supabase** (or swap auth later) — `NEXT_PUBLIC_*` keys
- Understanding that **`NEXT_PUBLIC_VOID_WS_URL` is compiled into the web bundle** at **image build** time. Rebuild `web` when the public realtime URL changes.

---

## Staging vs production

| Concern | Staging | Production |
| ------- | ------- | ----------- |
| Domains | e.g. `staging.app.example.com` | `app.example.com` |
| Secrets | Rotatable, weaker acceptable | Strong `POSTGRES_PASSWORD`, least privilege |
| Data | Disposable volume or restore test | **Backup schedule** (Postgres + volume snapshots) |
| Build args | Staging Supabase project / WS subdomain | Live projects |

Use separate compose projects (`-p void-staging`) or different env files so volumes don’t mix.

---

## Build & run (full stack)

1. `cp .env.selfhosted.example .env` and fill values.
2. Build web with **real** `NEXT_PUBLIC_*` (compose passes build args from `.env`):
   ```bash
   docker compose --env-file .env build --no-cache web
   docker compose --env-file .env up -d
   ```
3. Open `http://localhost:${WEB_HOST_PORT:-3000}` (dev) or your Caddy URL (prod).
4. Health: `GET /api/health` on the web service.

---

## TLS + reverse proxy (production)

1. Put `deploy/caddy/Caddyfile.example` on the edge host (rename to `Caddyfile`, fix domains).
2. Join Caddy to the **same Docker network** as `web` and `realtime` (see comment in file).
3. Set `NEXT_PUBLIC_VOID_WS_URL=wss://realtime.your-domain.com` and **rebuild `web`**.
4. Confirm browser devtools: WS connects without mixed-content errors.

**Nginx / Traefik** — same idea: HTTP/1.1 upgrade to `realtime:3002`, HTTPS to `web:3000`.

---

## Backups & restore

- **Postgres:** `scripts/ops/backup-postgres.sh` or one-off:
  ```bash
  docker compose exec -T postgres pg_dump -U postgres void_wars | gzip > backup.sql.gz
  ```
- **Redis:** optional RDB snapshots (`redis_data` volume) — auction cache; Postgres is authoritative when both are on.
- **NAS / cron:** run backup script nightly; **test restore** on a clone quarterly.
- **Off-box copy:** sync encrypted dumps object storage second location.

---

## NAS quickstart (you already have the box)

This stack maps cleanly to **Docker Compose on a NAS** (Synology *Container Manager*, QNAP *Container Station*, TrueNAS *Apps* + Compose, Unraid *Docker Compose*, etc.). High level:

### 1. Get the project onto the NAS

- **Git clone** in an SSH session, or sync the repo into a shared folder (`/volume1/docker/void-wars-game`).
- Put **`.env`** next to `docker-compose.yml` (copy from `.env.selfhosted.example`). Never commit secrets.

### 2. Build on the NAS (or build elsewhere, push to a registry)

- **On-NAS build:** open a terminal, `cd` to the project, run  
  `docker compose --env-file .env build && docker compose --env-file .env up -d`  
  First build can take **many minutes** on low-power CPUs; that is normal.
- **Offload build:** build `web` / `realtime` images on a PC or CI, **push to Docker Hub / GHCR**, then on the NAS use `image: yourname/void-wars-web:tag` in a small override compose file (skip `build:`) — faster iteration on weak NAS.

### 3. Ports & LAN play

- Map host ports (defaults **`3000`** web, **`3002`** realtime) in the NAS UI or in `.env` (`WEB_HOST_PORT`, `REALTIME_HOST_PORT`).
- **Browser URL example:** `http://NAS_IP:3000`  
  Then set **`NEXT_PUBLIC_VOID_WS_URL=ws://NAS_IP:3002`** (same host, correct port) and **rebuild `web`** so the client opens the socket to your NAS.
- **HTTPS pages** must use **`wss://`** to the same “site” policy; plain **`http://` + `ws://`** is fine for **household / LAN** testing.

### 4. Use NAS features you already pay for

- **Snapshots** on the volume that holds Docker data (or the named volumes `postgres_data`, `redis_data`) — quickest “oops” recovery.
- **Scheduled tasks** to copy `pg_dump` outputs to another share or cloud (script in `scripts/ops/`).
- **UPS / RAID** — you already know this; game DB is still “real data” once players depend on it.

### 5. Remote access without exposing the NAS raw

- **Tailscale / ZeroTier** on the NAS: hit the app at the tailnet IP, same `NEXT_PUBLIC_VOID_WS_URL` pattern with that IP or MagicDNS name — **rebuild `web`** when the hostname you give players changes.
- **Public domain + reverse proxy** on the NAS is possible but **Let's Encrypt** from home often needs **DNS-01** (port 80 blocked, dynamic IP). Caddy / NPM docs for your vendor apply.

### 6. When the NAS struggles

- **Split:** run **`web` + realtime** on a small VPS, keep **Postgres + Redis** on the NAS (compose split or two stacks), OR run only **`realtime` + Redis + Postgres** on NAS and keep **`web` on Vercel** with `NEXT_PUBLIC_VOID_WS_URL` pointing at your NAS/tailnet edge.

---

## Homelab (non-NAS)

- Let’s Encrypt on residential ISP can be painful; use **DNS-01** challenges or **Tailscale** + internal CA for family-only builds.
- CPU on a small box may require **offloaded image builds** (see above).

---

## When **not** to use Phase 10

- You are happy with **Vercel + managed WS host** — fewer ops, faster iteration.
- You have **no** backup/restore discipline yet — fix that before self-hosting user data.

---

## Exit gate (from codex)

> Retention and product value justify ops complexity.

If uptime, security patches, and backups are not budgeted, **stay on managed hosting** until they are.
