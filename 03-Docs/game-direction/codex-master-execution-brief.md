# Void Wars: Oblivion — Codex Master Execution Brief

## Role Summary
This brief converts the approved full-product doctrine into a production-safe execution contract with:
- exact milestone sequence,
- clear 4-person ownership boundaries,
- feature gates per phase,
- explicit M1 scope controls.

This document is implementation-focused and canon-locked.

---

## Canon and Naming Lock (Non-Negotiable)

### Locked truths
- Void = 3D prison.
- Fusion = body + mind + soul (late-game truth).
- Bio = Verdant Coil.
- Mecha = Chrome Synod.
- Pure = Ember Vault.
- Black Market = neutral survivor citadel.
- Book 1 = current implementation scope.

### Player-facing naming
Use only:
- Bio
- Mecha
- Pure

Do not surface `Spirit` in launch-facing UI or progression copy.

### Tone lock
Survival-first, war-scarred, costly progression, readable pressure, consequence-forward.

---

## Final Product Target
Void Wars: Oblivion ships as a web-first, systems-heavy, identity-driven dark cultivation war RPG.

North star:
**growth brings power, war gives purpose, and every ascent risks corruption.**

Target experience:
- not twitch-MMO first,
- not passive idle-menu filler,
- expandable toward deeper social/economy/war layers,
- self-hosting only after core loop retention is proven.

---

## Core Experience Spine

### Central question
**What kind of being am I becoming inside the Void?**

### Full arc (player truth)
- 0-3h: survive,
- 3-10h: become someone,
- 10-20h: choose what shapes you,
- late game: no single path is enough; fusion is the highest truth.

### Starting fantasy (must stay fragile)
Player starts as Puppy: unmarked, weak, hungry, undefined.

---

## Permanent Screen Pillars
- Home
- Career
- Mastery
- Professions
- Market
- Arena
- Guild
- Inventory / Status
- Missions / Factions

Screen law: readable state, clear next action, pressure visibility, no menu sprawl.

---

## 4-Person Ownership Model (Permanent)

### 1) Layout Lead
Owns route wrappers and screen composition boundaries.
- Primary scope: `app/**/page.tsx`
- Rule: routes stay thin; no domain logic embedded.

### 2) UI Systems Lead
Owns reusable view systems.
- Primary scope: `components/**`
- Rule: presentation only; no gameplay rules hardcoded in UI.

### 3) Data / Config Lead
Owns game logic, progression, resources, balancing inputs.
- Primary scope: `features/**`, `data/**`, selected `lib/**`
- Rule: deterministic, composable, feature-local logic.

### 4) Asset / Integration Lead
Owns visual integration pipeline.
- Primary scope: `public/assets/**`, `lib/assets.ts`
- Rule: never ship `/incoming` or `/_incoming` references in production wiring.

---

## Milestone Matrix (Execution Control)

| Milestone ID | Maps to Phase | Delivery Target | Mandatory Exit Gate |
| --- | --- | --- | --- |
| M1.0 | Phase 0 | Doctrine + architecture lock | Canon naming lock and architecture separation verified |
| M1.1 | Phase 1 | Home shell v1 readability | Player can identify pressure/readiness/next action in one screen |
| M1.2 | Phase 2 | First playable Black Market loop | New player completes one full prepare->deploy->extract->recover loop |
| M1.3 | Phase 3 | Progression depth baseline | Early decisions create meaningful path divergence |
| M1.4 | Phase 4 | Crafting economy baseline | Crafter lane is viable and economically relevant |
| M1.5 | Phase 5 | Tactical encounter baseline | Preparation quality materially changes outcomes |
| M1.6 | Phase 6 | Faction pressure baseline | Market and mission choices reflect persistent war pressure |
| M2.0 | Phases 7-8 | Mythic economy + social dependence | Rune hierarchy and guild systems become load-bearing |
| M3.0 | Phases 9-10 | Late-game convergence + platform path | Fusion pacing proven and ops complexity justified |

### Milestone sequencing rule
No milestone may advance unless the previous milestone's exit gate is met in-player, not only in code.

---

## Ownership-to-File Map (Exact Working Surface)

### Layout Lead (routes only)
- `app/home/page.tsx`
- `app/new-game/page.tsx`
- `app/missions/page.tsx`
- `app/hunt/page.tsx`
- `app/bazaar/**/page.tsx`
- `app/status/page.tsx`
- `app/inventory/page.tsx`
- `app/mastery/page.tsx`
- `app/professions/page.tsx`
- `app/arena/**/page.tsx`
- `app/factions/page.tsx`
- `app/guild/page.tsx`

### UI Systems Lead (presentation only)
- `components/layout/**`
- `components/home/**`
- `components/missions/**`
- `components/hunt/**`
- `components/inventory/**`
- `components/status/**`
- `components/mastery/**`
- `components/professions/**`
- `components/arena/**`
- `components/black-market/**`
- `components/bazaar/**`

### Data / Config Lead (rules + state)
- `features/game/**`
- `features/player/**`
- `features/resources/**`
- `features/missions/**`
- `features/combat/**`
- `features/crafting/**`
- `features/market/**`
- `features/progression/**`
- `features/factions/**`
- `features/professions/**`
- `features/navigation/**`
- `features/status/**`
- `lib/assets.ts` (references only, no raw asset placement)

### Asset / Integration Lead (asset movement and registration)
- `public/assets/maps/**`
- `public/assets/maps/void-fields/**`
- `public/assets/icons/**`
- `public/assets/icons/skills/**`
- `public/assets/icons/items/**`
- `public/assets/backgrounds/**`
- `public/assets/ui/**`
- `public/assets/factions/**`
- `public/assets/creatures/**`
- `public/assets/bosses/**`
- `lib/assets.ts` (production path registry updates)

### Ownership conflict rule
If one change requires touching more than two ownership areas, split into separate slices unless explicitly approved as a coordinated integration task.

---

## Execution Order with Gates (Master Sequence)

## Active Build Queue (M1 Implementation Order)

These are the currently actionable, bounded slices for M1 hardening and first-playable loop completion.

### Slice A — Home shell readability pass
**Primary files**
- `app/home/page.tsx`
- `components/layout/LeftCommandMenu.tsx`
- `components/home/HomeResourceStrip.tsx`

**Gate**
- Center content is readable at common desktop widths.
- Left command stack is fully visible with no clipping.

**Not included**
- New combat systems
- New economy systems

### Slice B — Inventory capacity enforcement
**Primary files**
- `features/resources/inventoryLogic.ts`
- `components/inventory/InventoryOverviewCard.tsx`
- `components/inventory/OverloadWarning.tsx`

**Gate**
- Capacity overflow is visible and mechanically meaningful.
- Overloaded state blocks unsafe gain patterns.

### Slice C — Loadout equip loop
**Primary files**
- `features/player/loadoutState.ts`
- `app/loadout/page.tsx`
- `components/shared/ItemPicker.tsx`

**Gate**
- Player can equip and unequip one valid item per slot flow.

### Slice D — Black Market transaction baseline
**Primary files**
- `features/market/marketData.ts`
- `features/market/marketActions.ts`
- `app/bazaar/war-exchange/page.tsx`

**Gate**
- Buy and sell actions update inventory and credits coherently.

### Slice E — Mission execution and result handoff
**Primary files**
- `features/missions/missionRunner.ts`
- `components/missions/MissionTimer.tsx`
- `components/missions/MissionResult.tsx`

**Gate**
- Queue -> countdown -> result -> state update path completes.

### Slice F — New game onboarding to first loop
**Primary files**
- `app/new-game/page.tsx`
- `features/player/playerFactory.ts`
- `components/onboarding/SchoolSelector.tsx`

**Gate**
- New player reaches home in valid Puppy state with starter resources.

### Slice G — Crafting district production loop
**Primary files**
- `features/crafting/recipeData.ts`
- `features/crafting/craftActions.ts`
- `app/bazaar/crafting-district/page.tsx`

**Gate**
- Craft action consumes required inputs and yields registered output.

### Slice H — Hunt encounter result loop
**Primary files**
- `features/combat/creatureData.ts`
- `features/combat/encounterEngine.ts`
- `app/hunt/page.tsx`
- `components/hunt/HuntResult.tsx`

**Gate**
- One deploy encounter can resolve and return rewards/costs visibly.

### Queue discipline rule
Only one slice should be active in implementation at a time unless a documented blocker requires a paired follow-up.

---

## Phase 0 — Doctrine + Architecture Lock
**Goal:** prevent drift before feature growth.

### Required outputs
- Canon-safe naming and terminology lock (Bio/Mecha/Pure).
- Layer enforcement (`app` routes, `components` UI, `features` logic).
- Home shell ownership and reusable UI language formalized.
- No giant files, no random inline data, no asset-path scatter.

### Gate to pass
- No launch-facing `Spirit` strings.
- No new parallel subsystem when existing loop can be extended.

### Not included
- New war systems,
- economy expansion,
- speculative Book 2+ implementation.

---

## Phase 1 — Homepage Shell V1
**Goal:** establish the modular command deck baseline.

### Required slice
- `app/home/page.tsx`
- `components/layout/HomeShell.tsx`
- top bar, command menu, path cards,
- condition widget, resource bar, bottom nav,
- config/data ownership,
- centralized asset references.

### Gate to pass
A player can understand identity, pressure, readiness, and next action within one screen.

---

## Phase 2 — Foundation Slice (First Playable Black Market Loop)
**Goal:** first retention-worthy loop.

### Required beats
- Puppy creation/start,
- first rumor/bad deal,
- first consequence event,
- first hunt/prey,
- first broker interaction,
- first market understanding,
- first Mark eligibility,
- first simple combat resolution,
- persistence between sessions.

### Gate to pass
A new player understands the fantasy and wants to return.

---

## Phase 3 — Progression Depth
**Goal:** growth feels real, not cosmetic.

### Required systems
- mastery progression,
- differentiated path feel,
- early corruption/consequence,
- one to two professions,
- readiness/doctrine/gating logic,
- path-shaped growth rhythm.

### Gate to pass
Early decisions create meaningful identity divergence.

---

## Phase 4 — Crafting Economy
**Goal:** profession interdependence becomes real.

### Required systems
- gathering,
- refining,
- crafting categories,
- market prototype,
- player contracts,
- school-shaped harvest outcomes,
- item sinks/taxes/upkeep.

### Gate to pass
Crafter-focused players have a compelling viable lane.

---

## Phase 5 — Tactical Encounter Layer
**Goal:** preparation-driven conflict depth.

### Required systems
- loadouts,
- enemy variety,
- risk/reward texture,
- arena rules,
- doctrine/behavior-influenced combat outcomes.

### Gate to pass
Combat outcome quality clearly tracks with preparation quality.

---

## Phase 6 — Faction War Layer
**Goal:** the world feels contested and alive.

### Required systems
- contested zones,
- faction influence,
- school pressure,
- regional events,
- contribution systems,
- war-demand impact on market value.

### Gate to pass
Players feel persistent war pressure beyond a single session.

---

## Phase 7 — High-End Crafting + Rune Hierarchy
**Goal:** unlock strategic mythic economy lanes.

### Required systems
- Rune Crafter progression,
- restricted war-economy lanes,
- rare unstable materials,
- advanced runes,
- late hybrid systems,
- Rune Knight enablement hooks.

### Gate to pass
High-tier crafting shapes war outcomes rather than pure vanity.

---

## Phase 8 — Guild + Social Dependence
**Goal:** social systems become load-bearing.

### Required systems
- guild contracts,
- contribution ranks,
- shared objectives,
- faction participation,
- rivalry/belonging/coordination loops.

### Gate to pass
Guild participation provides practical progression leverage.

---

## Phase 9 — Mythic Late Game
**Goal:** deliver convergence truth at earned pacing.

### Required systems
- advanced hybrid unlocks,
- Convergence arc,
- Rune Knight prestige,
- empire-scale war stakes,
- deeper Void truths,
- long-form chapter revelations.

### Gate to pass
Fusion is earned as late truth, never early shortcut.

---

## Phase 10 — Self-Hosted Platform Path
**Goal:** operational maturity after product proof.

### Required outputs
- staging environment,
- Docker stack,
- reverse proxy,
- backup flow,
- NAS deployment pathway,
- studio self-host operating baseline.

### Gate to pass
Core loop, retention, and ops burden justify self-hosting.

---

## Chapter / Arc Content Gating

Content rollout order remains:
1. Awakening
2. School Pressure
3. Rune Truth
4. War Escalation
5+. Mythic Revelation

Implementation rule:
- Chapter assets, systems, and mission chains must ship in this order.
- Later chapter hooks are allowed only as non-playable foreshadowing until their chapter gate opens.

---

## World and Hub Structure Law
The hub remains a lived-in wartime center with permanent districts:
- Void Market
- Black Market
- Mercenary Guild
- Mecha Foundry
- Crafting District
- Pure enclave
- Arena
- Teleport Gate
- Faction HQs

Black Market identity rule:
It is not the best at Bio, Mecha, or Pure purity lanes; it is best at unstable, memorable, improvised combinations.

---

## Monetization Law (Canon-Safe)
Allowed directions:
- listing fees,
- transaction tax,
- convenience,
- continuity/preservation systems,
- prestige cosmetics.

Forbidden direction:
- direct dev-sold power injection that bypasses survival/progression pressure.

---

## M1 Guardrails (Active Now)
Do not:
- build the giant war map first,
- expand crafting into disconnected bloat,
- frontload systems before fantasy clarity,
- let one branch touch everything,
- reduce the world to detached menus.

Do:
- preserve survival pressure,
- keep profession value real,
- keep Black Market personal and dangerous,
- keep fusion as late-game truth,
- prioritize vertical slice completion over broad expansion.

---

## Feature Gate Checklist (Per Task)
Before merge, every bounded slice should confirm:
1. Canon-safe naming and tone.
2. Layered architecture compliance.
3. Scope discipline (small, local diff).
4. No `/incoming` production path usage.
5. Clear next-action readability for player.
6. Targeted validation performed and reported.
7. Save/persistence compatibility for the touched loop.

### Required validation command baseline
- `git diff --check`
- `npx tsc --noEmit` (when TypeScript/runtime files are touched)
- `npx eslint <edited files>` (when linted source files are touched)

### Required task return payload
Every implementation task must report:
1. Role Summary
2. Exact Files Changed
3. Scope Decision (included / not included)
4. What Changed
5. Validation (commands + results)
6. Known Issues / follow-ups

### Scope budget defaults
- Prefer 1-3 files per task.
- 4-6 files allowed only when a single user-facing behavior crosses layers.
- 7+ files requires explicit justification and pre-approved integration scope.

---

## One-Line Execution Doctrine
**Build in this order: identity -> playable Black Market slice -> progression depth -> crafting economy -> tactical encounters -> faction war -> Rune Crafter/Rune Knight mythic layer -> social dependence -> self-hosted platform path.**
