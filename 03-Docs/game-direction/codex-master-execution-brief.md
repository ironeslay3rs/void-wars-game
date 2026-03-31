# Void Wars: Oblivion — Codex Master Execution Brief

## Purpose
This is the master implementation brief for the full product direction of `Void Wars: Oblivion`.

It turns the approved game vision into:
- exact milestone order,
- clear ownership boundaries,
- phase gates,
- scope guardrails,
- implementation-safe delivery rules.

This brief is canon-locked and architecture-aware. **Treat this file as the Codex master execution brief** — milestone order, phase gates, and team split live here (especially §8–§9); keep them aligned with the running app.

**See also:** `fusion-doctrine.md` (borrowed-pattern merge rules), `docs/game-canon-registry.md`, `docs/black-market-law.md`, `project-docs/visuals/UI_MOCKUP_REFERENCE.md` (layout / tone reference mockups; Pure not Spirit in shipped UI).

---

## 1. Final Product Target

`Void Wars: Oblivion` should ship as a web-first, systems-heavy, identity-driven dark cultivation war RPG.

It is:
- not a twitch MMO,
- not a passive idle menu game,
- expandable over time,
- mobile-usable later,
- self-hosted only after the core loop proves itself.

North star:

**Growth brings power, war gives purpose, and every ascent risks corruption.**

### Identity stack

| Layer | Role |
| --- | --- |
| Book canon | truth and tone |
| Overmortal | progression spine |
| AFK Journey | readability / presentation layer |
| Vampire Wars | conflict / faction pressure reference |
| Darkest Dungeon | consequence / expedition weight reference |

### Naming law

Launch-facing naming must use:
- Bio
- Mecha
- Pure

Do not surface `Spirit` in player-facing UI unless compatibility work explicitly requires it.

---

## 2. What the Final Game Is

The full game is built around one question:

**What kind of being am I becoming inside the Void?**

Everything supports that:
- path identity,
- dangerous progression,
- consequence,
- profession interdependence,
- faction war,
- lore as gameplay.

### End-state platform vision

A self-hosted, expandable dark faction RPG platform where players choose Bio, Mecha, or Pure, grow through missions and professions, fight inside a living war economy, face corruption and consequence, and eventually rise into elite wartime roles shaped by Rune Crafters and Rune Knights.

---

## 3. Player Fantasy and Long Arc

The full player arc is:
- 0–3 hours: survive
- 3–10 hours: become someone
- 10–20 hours: choose what will shape you
- late game: learn that no single path is enough; fusion becomes the highest truth

### Starting state

The player starts as:
- Puppy
- unmarked
- weak
- hungry
- undefined

This fragile start is non-negotiable.

The game is not about spawning as a hero.
It is about proving you deserve to keep power at all.

---

## 4. Gameplay Formula

### Core loop

Log in -> review pressure/readiness -> claim offline output / status -> choose contract, hunt, market, or arena action -> resolve encounter -> harvest / loot / process -> upgrade mastery / profession / loadout -> queue next cycle

### Emotional loop

survive -> stabilize -> specialize -> profit -> hybridize -> converge

### Social loop

Guilds should naturally want:
- fighters
- gatherers
- crafters
- brokers
- specialists
- hybrid experts

No single role should dominate the whole society.

---

## 5. System Pillars

### A. Identity and progression

Core spine:
- First Mark
- Main Rune
- Mastery tree
- Career Focus
- Profession path
- Hybrid temptation
- Convergence late game

Rule:
- early game rewards stronger purity
- mid game rewards experimentation
- late game reveals fusion as final truth

### B. Path law

The three paths must feel fundamentally different:
- Bio = instinct, adaptation, body pressure
- Mecha = structure, precision, engineered scaling
- Pure = soul, memory, meaning, highest long-term ceiling

They may solve similar problems, but never through the same truth.

### C. Consequence

Power must cost something:
- condition
- corruption
- overload
- fracture
- instability
- Void pressure
- rune backlash
- soul damage

### D. Professions and economy

The economy is player-driven and world-supported:
- gatherers feed the world
- refiners convert chaos into usable inputs
- crafters keep armies operational
- Rune Crafters become strategic apex enablers
- Rune Knights become top wartime output later

### E. War and world pressure

The world should not feel like disconnected menus.
It should feel contested, alive, and ideologically shaped.

The war layer comes after the loop is fun, not before.

---

## 6. Permanent Screen Pillars

The final screen pillars are:
- Home — identity, current state, pressure, next action
- Career — rank, breakthroughs, long-term advancement
- Mastery — doctrines, path specialization, divergence
- Professions — gathering, refining, crafting, Rune Crafter lane
- Market — player economy, listings, commissions, demand
- Arena — build proof, rankings, prestige
- Guild — social identity, shared contracts, contribution
- Inventory / Status — loadout, materials, condition, corruption, readiness
- Missions / Factions — chapter pressure, return loop, war stakes

Concept coverage (existing art / mock direction already maps here): main menu, mastery, professions, Black Market UI, hunt rewards, crafting, inventory, PvP ruleset, city hub map, status pages, Hollowfang boss sheet — use these as the visual spine while systems catch up; do not block shell work waiting for final art.

Screen law:
- state must be readable,
- next action must be obvious,
- pressure must stay visible,
- the world must not collapse into menu clutter.

---

## 7. World Structure

The hub remains the lived-in center of the game.

Permanent districts:
- Void Market
- Black Market
- Mercenary Guild
- Mecha Foundry
- Crafting District
- Pure enclave
- Arena
- Teleport Gate
- Faction HQs

### Black Market law

The Black Market is not best at Bio, Mecha, or Pure purity.
It is best at unstable, memorable, improvised combinations.

That identity must remain intact.

### Expansion rule

Each major expansion should feel like a force mutating the city.

First major expansion remains:
- Fenrir’s Wrath / The Coliseum

---

## 8. Team Implementation Model

Keep the 4-person structure permanent.

### 1. Layout lead
- Owns route wrappers, shells, framing
- Primary scope: `app/**/page.tsx`
- Rule: routes stay thin

### 2. UI systems lead
- Owns reusable panels, cards, widgets
- Primary scope: `components/**`
- Rule: no gameplay rules in UI

### 3. Data / config lead
- Owns labels, values, tokens, mock/system data, gameplay rules
- Primary scope: `features/**`, selected registries under `lib/**`
- Rule: deterministic, composable, modular logic

### 4. Asset / integration lead
- Owns exports, icons, backgrounds, asset wiring
- Primary scope: `public/assets/**`, `lib/assets.ts`
- Rule: no asset-path scatter, no shipping `/incoming`

### Permanent feature split

Every feature must stay split into:
- visual assets
- UI components
- screen composition
- logic/data

---

## 9. Final Implementation Phases

## Phase 0 — Doctrine and architecture lock

Before more feature work:
- lock canon language
- lock Bio / Mecha / Pure naming
- lock 4-person modular structure
- lock home shell ownership
- lock reusable UI language
- lock no giant files / no random inline data / no asset path scatter

### Exit gate
- No player-facing `Spirit`
- `app/` thin, `components/` UI, `features/` logic
- no god files
- Puppy-first entry: new saves complete **New Game** (`characterCreated`) before hub play; no parallel Home stacks — canonical **`GameHudShell` + `components/home/HomeHudClient`**
- Shipped bazaar ids/URLs use **Pure** naming (e.g. `pure-enclave`, `/bazaar/pure-enclave`; legacy `spirit-enclave` redirects only)

## Phase 1 — Homepage shell v1

Build:
- `page.tsx`
- `GameHudShell` + `components/home/HomeHudClient` (canonical home stack)
- chrome frame
- top bar
- command menu / left rail (live: `MainMenuLeftRail` + center/right rails)
- path cards
- condition widget
- resource bar
- bottom nav
- data/config files
- centralized `assets.ts`

### Exit gate
A player can identify identity, pressure, readiness, and next action from one screen.

## Phase 2 — Foundation slice

Ship the first playable Black Market loop:
- Puppy creation/start
- first rumor / bad deal
- first event / consequence
- first hunt / first prey
- first broker
- first market understanding
- first Mark eligibility
- first simple combat resolution
- persistence between sessions

### Exit gate
A new player understands the fantasy and wants to return.

## Phase 3 — Progression depth

Build:
- mastery
- path identity feel
- early corruption / consequence
- one or two professions
- doctrine/readiness/gating systems
- path-shaped growth rhythm

**Repo (M1):** Void instability (strain) tracks mission/hunt/exploration payouts, extra condition drain on resolve, survival decay when stable, exploration credit tithe, path-aligned mastery bonus, recovery/ration relief, void field extraction + broker field loot pickup strain, Home + Status + field HUD surfacing, launch directive when strain is high.

### Exit gate
Growth feels meaningful, not cosmetic.

## Phase 4 — Crafting economy

Build:
- gathering
- refining
- crafting categories
- market prototype
- player contracts
- profession value
- school-shaped harvest outcomes
- item sinks / taxes / upkeep

**Repo (M1):** `refining` recipe category; path-aligned +1 staple on successful refine (`pathRefiningYield.ts`); War Exchange sell tithe `WAR_EXCHANGE_SELL_BROKER_CUT` + **stall arrears buy markup** (`stallUpkeep.ts`, `marketActions.ts`, `StallArrearsCallout`). **Gathering:** `pathGatheringYield.ts` — path-themed loot bias (void field / encounter / realtime). **Contracts:** `craftWorkOrder` + rotating 3-offer board (`getRotatingWorkOrderCatalog`, 7-day epoch). **Upkeep:** wall-clock stall rent, arrears, payoff action — wired through survival ticks and bazaar UI.

### Exit gate
A crafter-focused player has a compelling playstyle.

## Phase 5 — Tactical encounter layer

Build:
- preparation-driven encounter resolution
- loadouts
- enemy variety
- risk/reward texture
- arena rules
- behavior profile / doctrine-driven combat logic

Combat stays system-resolved and preparation-driven, not twitch-first.

**Repo (M1 — closed):** Arena match: loadout modifiers, archetypes, `?mode=` stakes, practice scaling, **SR + payout** by archetype, **telegraph** cadence, **tournament bracket round shell** (display + win counter / reset). Shell void strikes use loadout attack mult. Optional later: deeper enemy AI, PvE incoming parity.

### Exit gate
Preparation materially improves outcomes.

## Phase 6 — Faction war layer

Build:
- contested zones
- faction influence
- school pressure
- regional events
- contribution systems
- war demand affecting market value

### Exit gate
The world feels alive and larger than the individual player.

**Repo (M1 start):** Weekly-rotating **contested void sector** (`contestedZone.ts`) drives a **War Exchange buy demand** multiplier on tagged listings (`warDemandMarket.ts`, wired in `applyMarketBuy`). `WarFrontDemandCallout` on **War Exchange** and **Void Expedition** (highlights deploy into hot sector). Next: sell-side war pricing, faction contribution pressure, scripted regional events.

## Phase 7 — High-end crafting and rune hierarchy

Build:
- Rune Crafter progression
- restricted war economy
- rare unstable materials
- advanced runes
- late hybrid systems
- Rune Knight enablement

### Exit gate
The war economy becomes mythic and strategic, not cosmetic.

## Phase 8 — Guild and social layer

Build:
- guild contracts
- contribution ranks
- shared objectives
- faction participation
- social routines
- rivalry / belonging / coordination

### Exit gate
Guild participation creates real dependence, not just chat presence.

**Repo (M1 — Phase 8 closed for vertical slice):** Local guild roster (`gameActions` GUILD_*), contribution ledger + mercenary rank (`guildLiveLogic`, Home `MissionPanel`), shared contracts with zone/contested stacking, pledge-theater bonuses (`applyTheaterGuildBonusesToBase`), hunt result ledger slice, **capacity-safe** `GUILD_CLAIM_CONTRACT` + Guild page carry-trim toast.

## Phase 9 — Mythic late game

Build:
- advanced hybrid unlocks
- Convergence arc
- Rune Knight prestige
- empire-scale war stakes
- deeper Void truths
- long-form chapter revelations

### Exit gate
Fusion lands as earned late truth: body + frame + soul.

**Repo (M1 — Phase 9 started):** `mythicAscension.convergencePrimed` + **File convergence** on Mastery Mythic ladder (Rune Crafter license, rank 5+, two schools at rune depth 3+); `ATTEMPT_MYTHIC_UNLOCK` payload `convergence-prime`; Rune Knight + Professions copy when primed. **Gameplay:** `convergenceHybridRelief` stacks with Crafter in `getEffectiveCapacityMax` / installs / save hydration (`effectiveHybridReliefFromMythic`). Further prestige / empire stakes / revelations remain gated.

## Phase 10 — Self-hosted platform path

Only after the product earns it:
- staging
- Docker stack
- reverse proxy
- backup flow
- NAS deployment path
- self-hosted studio platform

### Exit gate
Retention and product value justify ops complexity.

---

## 10. Content Roadmap by Chapter / Arc

Campaign order:
1. Awakening
2. School Pressure
3. Rune Truth
4. War Escalation
5+. Mythic Revelation

### Chapter law

Ship content in that order.
Later arcs may foreshadow early, but not become fully playable ahead of their gate.

---

## 11. Monetization Law

Monetization must stay canon-safe.

Allowed:
- listing fees
- transaction tax
- convenience
- preservation / continuity systems
- prestige cosmetics

Forbidden:
- direct dev-sold power injection

### Black Market monetization model

- Favor Writs = play-earned standing
- premium = comfort / continuity / protection / faster recovery
- cosmetics = prestige expressions of truth — not fake skin-swaps that break species identity or canon tone

---

## 12. Guardrails

### Do not

- build the giant war map before the loop is fun
- let crafting become generic side content
- bury the player in systems before the fantasy is clear
- let one mixed branch touch everything without scope discipline
- treat the world like menus instead of a lived-in place

### Do

- build the proof of the world first
- preserve survival pressure
- keep professions meaningful
- keep the Black Market personal and dangerous
- make fusion the late-game truth, not the early-game shortcut

---

## 13. File Ownership Map

### Layout / route lead
- `app/home/page.tsx`
- `app/new-game/page.tsx`
- `app/missions/page.tsx`
- `app/status/page.tsx`
- `app/inventory/page.tsx`
- `app/mastery/page.tsx`
- `app/professions/page.tsx`
- `app/arena/**/page.tsx`
- `app/bazaar/**/page.tsx`
- `app/factions/page.tsx`
- `app/guild/page.tsx`

### UI systems lead
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

### Data / config lead
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

### Asset / integration lead
- `public/assets/**`
- `lib/assets.ts`

---

## 14. Delivery Rules Per Task

Before implementing:
1. Define exact scope
2. List exact files
3. State what is not included

For each implementation slice, report:
1. Role Summary
2. Exact Files Changed
3. Scope Decision
4. What Changed
5. Validation
6. Known Issues / follow-ups

### Scope defaults

- Prefer 1–3 files per task
- 4–6 files only when one user-facing behavior crosses layers
- 7+ files requires explicit integration justification

### Validation baseline

- `git diff --check`
- `npx tsc --noEmit` when TS/runtime files change
- `npx eslint <edited files>` when linted source files change

---

## 15. One-Line Execution Doctrine

**Build Void Wars: Oblivion in this order: identity -> playable Black Market slice -> progression depth -> crafting economy -> tactical encounters -> faction war -> Rune Crafter/Rune Knight mythic layer -> social systems -> self-hosted platform.**
