---
name: general-fix
overview: "Audit and fix the top stability/clarity issues surfaced by the MP4 reference and repo scan: hunt timer init, nav route bounce, overlay readability, loading transition, and save/state drift. Keep diffs small and M1–M7 safe."
todos:
  - id: triage1
    content: Locate code paths for hunt timer, overlay haze, faction route bounce, deploy loading interstitial, and stat drift.
    status: completed
  - id: hunt-timer
    content: Fix hunt timer init ordering so the timer starts when entering an active field; remove false “field is quiet” state.
    status: completed
  - id: faction-nav
    content: Fix faction navigation/back target so transitions between `/factions` and `/bazaar/faction-hqs` don’t bounce/redirect incorrectly.
    status: completed
  - id: overlay
    content: Prevent overlay stacking and restore intended readability across routes; adjust overlay mount/unmount logic.
    status: completed
  - id: loading-fallback
    content: Add/adjust void-field bootstrap fallback so deploy never appears blank during hydration.
    status: completed
  - id: state-drift
    content: Ensure survival decay/tick and consumable effects are applied consistently once; avoid delayed overwrite across screens.
    status: completed
  - id: validate
    content: Run `npx tsc --noEmit` + `npm run lint`, then reproduce MP4 flow end-to-end.
    status: completed
isProject: false
---

## 1) Reproduce & localize (no behavior changes yet)

- Use the MP4 timeline markers as targets.
- Add/locate the exact code paths for each symptom:
  - Hunt timer message comes from `components/void-field/VoidFieldCanvas.tsx` (string found in repo).
  - Global haze/vignette likely comes from `components/layout/GameShell.tsx` and/or hub background overlays.
  - Route bounce between `/factions` and `/bazaar/faction-hqs` needs a route/back-target/redirect audit in navigation components.
  - Loading interstitial on deploy originates from `app/bazaar/void-field/page.tsx` + void-field bootstrap.
  - Stat drift likely comes from hydration/decay/tick effects (`features/game/gameStorage.ts`, `features/game/gameActions.ts`).

## 2) Fix hunt timer not running (most critical)

- Inspect `components/void-field/VoidFieldCanvas.tsx` around the “Hunt timer not running — field is quiet.” condition.
- Trace backwards to the state that controls “timer running”:
  - realtime join/session lifecycle in `features/void-maps/realtime/VoidRealtimeBridge.tsx`.
  - websocket session event ordering in `server/void-realtime/wsServer.ts`.
- Ensure timer starts after the first valid server/world event (e.g., after mob population spawn or after the first realtime “session ready” signal), and that UI unlocks don’t run before the timer state is set.

## 3) Fix route bounce between faction surfaces

- Search for back navigation/redirect rules affecting faction routes.
- Ensure `BazaarSubpageNav`/district nav “Back to …” uses a stable origin target.
- Confirm there is no guard redirect loop when switching between `/factions` and `/bazaar/faction-hqs`.

## 4) Fix overlay readability regression

- Inspect `components/layout/GameShell.tsx` and any root overlays (plus hub card overlays like `components/bazaar/CentralHubCard.tsx`).
- Prevent overlay stacking across route transitions (e.g., overlay mounted multiple times, or opacity applied twice).
- Align haze intensity to the visual direction checklist in `docs/void-wars-visual-implementation-checklist.md`.

## 5) Fix loading transition on deploy

- Review `app/bazaar/void-field/page.tsx` and the void-field boot state.
- Add a non-blocking skeleton/consistent background so the screen never appears “blank” during async bootstrap.

## 6) Fix cross-screen stat/state drift

- Audit survival tick/decay application points:
  - `features/game/gameStorage.ts` normalization/hydration.
  - `features/game/gameActions.ts` reducer/decay application.
- Ensure each tick/decay is applied exactly once per HYDRATE_STATE (and not on every screen change).
- Ensure Feasts/consumption updates don’t get overwritten by delayed hydration.

## 7) Validate

- After each fix cluster, run:
  - `npx tsc --noEmit`
  - `npm run lint`
- Then reproduce the same MP4 click path: deploy from expedition → void field → faction pages → inventory/status.

## Out of scope

- No new gameplay systems or economy redesign.
- Only bugfixes and clarity/UX stability improvements to existing flows.
