# Stability + Production Roadmap — Section 4 (HIGH, M2: 2–3 sessions)

Source: internal roadmap screenshot (Section 4).

Goal: make the “puppy experience” real in hour 0–3 — the player can create a character, do a first action, see what changed, and always know what to do next.

## Deliverables checklist

### 1) New Game flow
- **Requirement**: Real onboarding screen (not a placeholder) with:
  - **Name entry**
  - **Puppy state initialization**
  - **School lean selection** (Bio / Mecha / Pure)
  - **First action made clear**
- **Acceptance**:
  - New operator can set a callsign and select Bio/Mecha/Pure.
  - Home shows identity as chosen, and “what to do next” is explicit.
- **Likely files**:
  - `app/(auth)/...` or `app/new-game/...` (route may need creating)
  - `features/game/gameActions.ts` (`SET_PLAYER_NAME`, `SET_FACTION_ALIGNMENT`)
  - `components/home/*` (first-session prompts)

### 2) First Mark Awakening
- **Requirement**: Trigger after first hunt kill; visual moment where the player’s Mark appears and school identity becomes visible. Transition from Unmarked → Marked.
- **Acceptance**:
  - After first hunt result is applied, a one-time “Mark Awakening” moment is shown.
  - Player sees the school identity become “real” (UI/state change + messaging).
- **Likely files**:
  - Hunt resolution: `features/game/gameMissionUtils.ts` / `features/game/gameActions.ts`
  - Result UI: `app/bazaar/biotech-labs/result/page.tsx`
  - Guidance: `features/guidance/firstSessionGuidance.ts`

### 3) Missions screen
- **Requirement**: At least 1 active mission with clear objectives, progress tracking, and visible reward (functional mission card).
- **Acceptance**:
  - Mission(s) can be queued and claimed.
  - UI clearly indicates objective and payout.
- **Likely files**:
  - `components/missions/MissionsScreen.tsx`
  - `features/missions/*`
  - `features/game/gameMissionUtils.ts`

### 4) Black Market buy
- **Requirement**: 1 working buy transaction using credits. Player sees item, spends credits, item appears in inventory. “Economy is real” for the first time.
- **Acceptance**:
  - Buy reduces `credits`.
  - Purchased item appears in an inventory UI view (not just a toast).
- **Likely files**:
  - Bazaar route(s): `app/bazaar/*`
  - Inventory UI: `components/inventory/*`, `features/inventory/*`
  - Economy logic: `features/bazaar/*` + `features/game/gameActions.ts`

### 5) Hunt result summary
- **Requirement**: After hunt completion, show a clear summary: what dropped, what changed, what XP was earned. Player returns to homepage understanding what happened.
- **Acceptance**:
  - Result screen lists resources/XP changes and next-step guidance.
- **Likely files**:
  - `app/bazaar/biotech-labs/result/page.tsx`
  - `features/guidance/firstSessionGuidance.ts`

### 6) Loadout equip path
- **Requirement**: Empty loadout shows direction to acquire gear. After first item acquired, loadout shows equip action. Player sees kit fill up.
- **Acceptance**:
  - If no gear, player is directed to acquisition.
  - After acquisition, loadout page has a clear “equip” interaction or next-step.
- **Likely files**:
  - `app/loadout/page.tsx`
  - `components/inventory/*`
  - `features/inventory/*`

## Session breakdown (from roadmap)
- **Session A**: New Game flow + Puppy state + name entry + school lean. Player can create a character and land on homepage with identity visible.
- **Session B**: First hunt + Mark Awakening + hunt result summary. Player can do first action and see the result.
- **Session C**: Missions card + Market buy + loadout equip. Full 0–3 hour loop playable end-to-end.

## Puppy loop flow (from roadmap)
1. New Game → enter name, choose school lean
2. Homepage loads with Puppy rank, empty loadout, first mission visible
3. Follow mission prompt → go to hunt zone
4. Complete first hunt → Mark Awakening triggers → hunt result summary
5. Return to homepage → see updated condition/resources/XP
6. Follow loadout prompt → visit Black Market → buy first weapon
7. Equip weapon in loadout → ready for second hunt

