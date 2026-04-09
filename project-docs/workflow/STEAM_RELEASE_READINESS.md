# Steam page announcement → full release

This repo ships **Void Wars: Oblivion** as a **web client** (Next.js on Vercel). A Steam page typically drives **discovery and trust**; gameplay may open in the browser (or a future desktop wrapper). Use this checklist so the **store promise matches the build** and ops does not surprise players.

**Canon / tone:** Player-facing Steam copy must follow `docs/game-canon-registry.md`, `docs/faction-visual-law.md`, and project canon rules (Bio / Mecha / **Pure**, not legacy Spirit naming in new copy).

---

## 1. Product and positioning (before writing the store page)

- [ ] **Edition:** Early Access vs 1.0 — one paragraph “what’s in / what’s not” aligned with M1 scope in `AGENTS.md`.
- [ ] **Platform truth:** State clearly that the game runs in the **browser** (URL), login method (e.g. Supabase), and **offline** = not supported unless you add it.
- [ ] **Realtime:** Hunting-ground multiplayer expects a **hosted WebSocket server** (`NEXT_PUBLIC_VOID_WS_URL` / `server/void-realtime/wsServer.ts`). Document degraded behavior if WS is down (shell / solo clarify).
- [ ] **Save model:** Local persistence + optional remote — set expectations for **device change**, clears, and backups.
- [ ] **No false MMO claims:** Match concurrent features to what the WS server actually guarantees.

---

## 2. Steam store assets (Valve requirements + quality bar)

- [ ] **Capsule images** (main, small, header, library) — match `VISUAL_DIRECTION.md` / faction law.
- [ ] **Short + long description** — survival-first, war-scarred, Black Market hub; avoid invented lore beyond Book 1 scope.
- [ ] **Screenshots** (5+) — readable UI, representative zones, not mock-only art.
- [ ] **Trailer** (recommended) — loop clarity: deploy → hunt → extract → home.
- [ ] **Tags, genre, release date** — consistent with actual content.

---

## 3. Legal, privacy, support

- [ ] **Privacy policy** URL (Supabase/auth, analytics if any, cookies).
- [ ] **Terms / EULA** if you take payments on web or link out to purchases.
- [ ] **Age rating / questionnaire** — complete accurately for violence and tone.
- [ ] **Support channel** — email or Discord + response expectation for EA.

---

## 4. Technical readiness (ship weekly)

- [ ] **Production URL** stable (e.g. Vercel prod) with custom domain optional.
- [ ] **Env (Vercel):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, **`NEXT_PUBLIC_VOID_WS_URL`** (`wss://…`) for HTTPS sites.
- [ ] **WS server** deployed with TLS; health/ops runbook (restart, logs, Redis/DB if enabled). Self-host path: `project-docs/ops/PHASE10_SELF_HOSTED_RUNBOOK.md` + `docker-compose.yml`.
- [ ] **`GET /api/health`** monitored; extend checks as needed (Supabase, etc.).
- [ ] **CI green on `main`:** `tsc`, `lint`, `build`, **`npm test`** (`.github/workflows/ci.yml`).
- [ ] **Smoke test** after each deploy: login → new game → mission → void field → extract → home (document steps in `README` or runbook).

---

## 5. Quality and parity

- [ ] **Mobile + desktop** pass on Home, missions, void field, bazaar entry.
- [ ] **Hunt settlement:** `fieldLootGained` / orb ledger behavior understood; see `VOID_WARS_TASK_QUEUE.md` (Hunt timing / E2E).
- [ ] **Known gaps** from `VOID_WARS_DIRECTOR.md` (Broken/Missing) triaged — either fixed or called out in EA disclaimer.

---

## 6. Steamworks (when you create the app)

- [ ] Steamworks partner account, app ID, store page draft.
- [ ] Decide: **Steam-only keys**, **free web + Steam for visibility**, or **future Steam embed** — engineering follows that decision.
- [ ] Pricing, regional availability, review build if Valve requests.

---

## 7. Launch week

- [ ] Freeze a **release git tag**; deploy that commit to prod.
- [ ] **Rollback plan** (Vercel instant rollback; WS version pinned).
- [ ] **Incident comms** template (status message if WS or auth fails).

---

## Immediate engineering tasks (suggested order)

1. Run CI on the branch you merge to production; keep **`main`** as the release branch if that matches Vercel.
2. Add **`npm test`** to CI (done when this doc landed — verify).
3. Extend **`/api/health`** with auth/realtime checks operators care about.
4. Add a **one-page smoke checklist** to `README.md` for “release candidate.”
5. Schedule **browser E2E** (Playwright) when scope for Steam date is fixed.

---

## References

- `README.md` — local + production env, WS, health.
- `.env.example` — variable names.
- `AGENTS.md` — M1 scope guardrails.
- `VOID_WARS_TASK_QUEUE.md` — current approved slices.
- `project-docs/ops/PHASE10_SELF_HOSTED_RUNBOOK.md` — Docker / Compose / TLS / backups (optional).
