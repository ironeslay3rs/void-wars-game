# Void Wars: Oblivion — Codex Master Execution Brief

## Role Summary
This brief turns the approved full-product doctrine into a production-safe execution map with:
- exact milestone gates,
- file ownership boundaries,
- implementation sequencing,
- explicit "not now" constraints.

It is intended as the working contract for Codex-driven implementation slices.

---

## Doctrine Lock (Source of Truth)

1. **Book canon and Void Wars identity are non-negotiable.**
2. **Overmortal patterns are progression scaffolding only.**
3. **AFK Journey patterns are readability and return-loop UX only.**
4. **Launch-facing path naming remains Bio / Mecha / Pure.**

Supporting references:
- `03-Docs/game-direction/fusion-doctrine.md`
- `docs/game-canon-registry.md`
- `docs/black-market-law.md`
- `docs/expansion-roadmap.md`
- `docs/faction-visual-law.md`

---

## Product Objective
Ship a web-first, systems-heavy, dark cultivation war RPG where players:
- start fragile (Puppy),
- survive through consequence-driven loops,
- specialize via Bio/Mecha/Pure,
- grow through profession and market interdependence,
- and eventually approach fusion as late-game truth.

North-star rule: **growth brings power, war gives purpose, every ascent risks corruption.**

---

## System Ownership Model (Permanent)

### 1) Layout / Route Lead
- Scope: route shells, route-level composition, navigation wiring.
- Owns:
  - `app/**/page.tsx`
  - top-level route loading/error wrappers.
- Must not own domain logic.

### 2) UI Systems Lead
- Scope: reusable UI blocks, panels, cards, chrome, bars.
- Owns:
  - `components/**`
- Must not hardcode gameplay rules.

### 3) Data / Logic Lead
- Scope: progression, mission rules, readiness doctrine, economy rules.
- Owns:
  - `features/**`
  - `lib/**` (shared non-visual registries/helpers)
- Must keep logic modular and composable.

### 4) Asset / Integration Lead
- Scope: production asset placement, naming, and registry wiring.
- Owns:
  - `public/assets/**`
  - `lib/assets.ts`
- Must never ship `/incoming` references.

---

## Milestones and Feature Gates

## Phase 0 — Doctrine + Architecture Lock
**Goal:** prevent drift before additional feature depth.

### Required outputs
- Canon-safe terminology checks across launch surfaces.
- Architecture checklists enforced (`app` thin, `components` UI, `features` rules).
- Fusion doctrine brief is active reference in roadmap docs.

### Gate to pass
- No player-facing "Spirit" where "Pure" should be used.
- No new god files or route-embedded gameplay logic.

### Not included
- New economies, war-map expansion, broad content unlocks.

---

## Phase 1 — Home Shell V1
**Goal:** one readable command deck for state, pressure, and next action.

### Core files
- `app/home/page.tsx`
- `components/home/**`
- `features/home/**`
- `lib/assets.ts` (if new visual references are wired)

### Gate to pass
- Player can immediately identify readiness, queue pressure, and next actionable step.
- Navigation hierarchy remains stable and route-safe.

### Not included
- Deep progression rewrites.

---

## Phase 2 — First Playable Black Market Slice
**Goal:** first 30-minute loop proves fantasy and retention intent.

### Required loop beats
1. Puppy start.
2. First rumor/bad deal.
3. First deployment.
4. First consequence/recovery moment.
5. First broker/market interaction.
6. First mark eligibility signal.

### Core files
- `app/new-game/**`
- `app/bazaar/**`
- `features/game/**`
- `features/missions/**` (if mission scaffolding split exists)

### Gate to pass
- New player completes one full prepare -> deploy -> extract -> recover cycle and understands what to do next.

---

## Phase 3 — Progression Depth
**Goal:** growth feels meaningful and path-shaped.

### Required systems
- mastery pressure,
- path-specific progression flavor,
- alpha-safe doctrine readiness/cadence/gate rules,
- early consequence signals (without feature bloat).

### Core files
- `features/progression/**`
- `components/home/MainMenuRightRail.tsx`
- `components/missions/**`

### Gate to pass
- Doctrine guidance aligns with gameplay permission outcomes.
- Queue and readiness behavior is deterministic and readable.

---

## Phase 4 — Crafting + Market Economy Base
**Goal:** profession value and player interdependence become real.

### Required systems
- gather/refine/craft chain,
- market listings/prototype contracts,
- upkeep/sinks/taxes,
- school-shaped material outcomes.

### Core files
- `features/market/**`
- `features/resources/**`
- `features/professions/**`
- `app/bazaar/**`

### Gate to pass
- Crafter-focused playstyle is viable.
- Economy reads as player-driven, not vendor-spam.

---

## Phase 5 — Tactical Encounter Layer
**Goal:** preparation-driven combat depth with consequence texture.

### Required systems
- loadout relevance,
- enemy behavior variety,
- risk/reward texture,
- arena rule clarity.

### Core files
- `components/hunting-ground/**`
- `components/arena/**`
- `features/game/gameMissionUtils.ts`
- `features/game/gameActions.ts`

### Gate to pass
- Better preparation materially improves outcomes.
- Combat remains system-resolved, not twitch-first.

---

## Phase 6 — Faction War Layer
**Goal:** world pressure exceeds individual session scope.

### Required systems
- contested zones,
- faction influence,
- regional pressure events,
- contribution impact on demand/value.

### Gate to pass
- Players feel persistent war pressure in mission and market decisions.

---

## Phase 7 — Rune Hierarchy + High-End Crafting
**Goal:** unlock mythic economy roles without breaking earlier loops.

### Required systems
- Rune Crafter progression,
- unstable high-tier materials,
- Rune Knight enablement hooks,
- restricted high-end economy lane.

### Gate to pass
- High-end crafting has strategic wartime significance, not cosmetic inflation.

---

## Phase 8 — Guild and Social Dependence
**Goal:** cooperative identity and coordination loops become load-bearing.

### Required systems
- guild contracts,
- contribution ranks,
- shared objectives,
- rivalry/belonging pressure.

### Gate to pass
- Guild membership creates practical progression leverage.

---

## Phase 9 — Mythic Late Game
**Goal:** deliver convergence truth at correct pacing.

### Required systems
- advanced hybrid unlocks,
- convergent progression arc,
- empire-scale stakes,
- long-form chapter revelations.

### Gate to pass
- Fusion reads as earned late-game truth, never early shortcut.

---

## Phase 10 — Self-Hosted Platform Path
**Goal:** infrastructure expansion only after loop and retention prove out.

### Required outputs
- staging workflow,
- containerized deployment plan,
- backup and restore posture,
- NAS self-host path.

### Gate to pass
- Product justifies operations complexity.

---

## Cross-Phase Guardrails

### Never do
- giant war-map first,
- menu bloat over world presence,
- identity flattening into borrowed clones,
- broad rewrites from one mixed branch,
- `/incoming` visual paths in production UI.

### Always do
- small, reviewable slices,
- targeted validation per slice,
- keep survival pressure and consequence visible,
- preserve Black Market tone,
- keep Bio/Mecha/Pure identity distinct in mechanics and wording.

---

## Codex Implementation Checklist (Per Slice)

1. Define exact scope in 1-3 files where possible.
2. Confirm canon and architecture references before edits.
3. Implement with layered separation.
4. Run targeted checks first (eslint/tsc/diff check as needed).
5. Report included vs not included scope.
6. Ship only when gate criteria for that slice are met.

---

## One-Line Execution Doctrine
**Build in order: identity -> Black Market playable slice -> progression depth -> crafting economy -> tactical encounters -> faction war -> rune mythic layer -> social dependence -> self-host path.**
