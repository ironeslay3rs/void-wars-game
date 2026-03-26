# System-to-Book Mapping Plan

## Role Summary
This document converts the locked seven-book expansion roadmap into a repo-facing implementation plan. It does **not** change canon, add lore, or redesign sequencing. It only maps current and planned game systems into practical delivery buckets for **Base Game / Book 1**, **Expansion 1 / Book 2**, **Expansion 2 / Book 3**, and **later expansions only**, while separating what to **build now**, **foreshadow now but unlock later**, and **leave untouched**.

## Exact Files
Use these files as the current ownership map for the systems below.

### Core loop and shared state
- `features/game/initialGameState.ts`
- `features/game/gameActions.ts`
- `features/game/gameMissionUtils.ts`
- `features/game/gameProgress.ts`
- `features/game/gameTypes.ts`

### Base-loop UI already in repo
- `components/exploration/ExplorationPanel.tsx`
- `components/exploration/ExplorationScreenSummary.tsx`
- `components/missions/MissionsScreen.tsx`
- `components/hunting-ground/HuntingGroundScreen.tsx`
- `components/bazaar/BazaarScreen.tsx`

### System shells already exposed in navigation or district screens
- `features/bazaar/bazaarDistrictData.ts`
- `features/factions/factionsScreenData.ts`
- `features/mastery/masteryScreenData.ts`
- `features/professions/professionsScreenData.ts`
- `features/career/careerScreenData.ts`
- `features/crafting-district/craftingDistrictScreenData.ts`
- `features/teleport-gate/teleportGateScreenData.ts`
- `features/arena/arenaScreenData.ts`
- `features/guild/guildScreenData.ts`

## Base Game / Book 1 Systems
These are the systems that should define the shippable foundation.

### 1) Build now
- **Exploration**
  - Keep as a first-session entry loop.
  - Continue using it as the source of leads, resources, and progression setup.
  - Treat this as a locked Book 1 pillar because it already drives the live home flow and reward claim loop.
- **Missions**
  - Keep the timed queue, reward payout, and path-tagged mission board as a Book 1 core system.
  - Standardize this as the reusable async progression loop for solo play.
- **Crafting**
  - Build only the **basic Book 1 layer**: recipe ownership, material spend, item/result output, and simple station states.
  - Use existing tracked resources first; avoid deeper specialization logic.
- **Factions**
  - Support **alignment selection**, **influence gain**, and **basic faction-gated mission/crafting hooks**.
  - Keep faction depth light in Book 1: enough to branch rewards and UI state, not enough to become its own meta-system.
- **Bazaar**
  - Keep the bazaar as the main Book 1 service hub and navigation layer.
  - District visibility is fine; deep district mechanics are not all required on day one.
- **Mastery**
  - Keep mastery as a **numeric progression rail** in Book 1.
  - Limit Book 1 scope to thresholds, unlock checks, and lightweight milestone messaging.
- **Teleport / Map**
  - Book 1 should only support **local navigation and route-state scaffolding**.
  - The gate can exist, but external travel should remain sealed or limited.

### 2) Foreshadow now, unlock later
- **Professions**
  - Show category structure and future role identity, but do not make profession choice a required Book 1 progression commitment.
- **Careers**
  - Keep read-only framing, milestone hints, and terminology visible.
  - Do not attach irreversible branching yet.
- **Arena**
  - Keep discoverable in the bazaar and navigation shell.
  - Allow only placeholder status or tightly limited test access if needed for UI continuity.
- **Guild**
  - Allowed in the current build plan: implement the M7 social layer (guild roster, shared contracts, faction participation).
  - Scope note: prefer local-first (save) scaffolding before server authority, unless infrastructure is explicitly scheduled.

### 3) Do not touch yet
- Full profession specialization trees.
- Career branch lock-ins and respec rules.
- Guild governance, member management, or social dependency (unless explicitly required by the M7 milestone slice).
- Ranked or seasonal arena structures.
- Multi-route world travel or expedition map depth.

## Book 2 Systems
Book 2 should deepen identity and structured progression without replacing the Book 1 loop.

### Primary unlock target
- **Professions**
  - Move from descriptive shell to active gameplay system.
  - Add profession-linked bonuses, production advantages, and role gating for selected content.
- **Careers**
  - Convert from roadmap-facing shell to actual specialization direction.
  - Career should sit on top of Book 1 mastery/faction progress rather than replacing it.
- **Crafting expansion**
  - Add recipe families, profession-linked outputs, and stronger progression ties.
  - Keep implementation grounded in the same resource economy already used by exploration and missions.
- **Mastery expansion**
  - Promote mastery from a number/checkpoint system into a structured unlock framework.
  - Book 2 is the right place for visible milestone rewards and clearer branch identity.

### Build now for Book 2 compatibility
- Save-schema fields for profession/career selection.
- Recipe metadata that can later key off profession or career requirements.
- UI states that distinguish `locked`, `preview`, and `unlocked`.

### Foreshadow now, unlock later
- Show profession families and career tracks in read-only mode.
- Let Book 1 rewards reference future compatibility only in generic terms.
- Keep all messaging system-first, not lore-first.

## Book 3+ Systems

### Expansion 2 / Book 3
Book 3 should expand outward rather than only deepening menus.

#### Primary unlock target
- **Teleport / Map**
  - Upgrade from local route scaffolding into real route unlocks, travel destinations, and expedition structure.
  - This is the cleanest place to turn the current gate shell into a gameplay system.
- **Exploration expansion**
  - Add route-based variation, travel-linked risk/reward, and destination-aware outputs.
  - Keep the same core process model where possible so Book 1 systems remain useful.
- **Faction expansion**
  - Add stronger faction-specific access checks and destination-linked reward differences only after route travel exists.

### Later expansions only
These systems should remain outside current implementation scope except for shell-level foreshadowing.

- **Arena as a major progression pillar**
  - Ranked ladders, prestige loops, seasonal structures, or broad progression dependency.
- **Guild as a major progression pillar**
  - Guild creation, member roles, cooperative objectives, group progression, or territory/influence layers.
- **Any system that requires deep social, multiplayer, or endgame dependency**
  - Keep these out of the near-term architecture unless a later book explicitly needs them.

## Foreshadowing Rules
Use these rules whenever a later-book system is visible in Book 1.

1. **Visible is fine; interactable is conditional.**
   - A system can appear in navigation, on the bazaar map, or in a summary card before it is playable.
2. **Use locked-state language, not fake depth.**
   - Prefer `Locked`, `Sealed`, `Preview`, or `Reserved` over placeholder mechanics that will be thrown away.
3. **Only foreshadow through state the repo already owns.**
   - Example: alignment, influence, unlocked routes, mastery progress, recipes, queue state.
4. **Do not require later-book systems for Book 1 retention.**
   - Base progression must stand on exploration, missions, early crafting, factions, bazaar flow, and basic mastery.
5. **Do not bind save data to speculative design.**
   - Add only minimal enum/state scaffolding that clearly maps to locked future unlock states.
6. **No lore invention in tooltips, rewards, or system labels.**
   - Keep copy generic and implementation-facing until the roadmap reaches that book.

## Systems To Delay
Delay these until their assigned book actually becomes active work.

- **Arena progression depth** beyond a shell or isolated test encounter.
- **Guild membership systems** beyond presentation and placeholder status.
- **Full profession/career branching** before Book 2 implementation starts.
- **Travel-map content expansion** before Book 3 implementation starts.
- **Cross-system dependency webs** where crafting, careers, professions, factions, arena, and guild all depend on each other at once.

## Best First Build Priorities
In order, the best practical first build sequence is:

1. **Finish the Book 1 core loop**
   - exploration -> missions -> rewards -> resource sinks -> repeat.
2. **Add basic crafting tied to current resources**
   - gives immediate purpose to earned materials without needing Book 2 specialization.
3. **Make factions matter in light-touch ways**
   - alignment, influence thresholds, and mission/reward variations.
4. **Turn mastery into a usable Book 1 unlock rail**
   - thresholds for recipes, routes, and light faction/crafting gates.
5. **Keep teleport gate, professions, careers, arena, and guild in preview-safe states**
   - visible enough to promise future depth, but not expensive to maintain now.
6. **Only after Book 1 is stable, prepare Book 2 data contracts**
   - profession/career fields, richer recipe metadata, and cleaner unlock-state enums.

## Final Result
The practical mapping is:

- **Base Game / Book 1:** exploration, missions, bazaar hub flow, basic crafting, light factions, basic mastery, and local teleport/map scaffolding.
- **Expansion 1 / Book 2:** professions, careers, mastery depth, and crafting specialization.
- **Expansion 2 / Book 3:** real teleport/map travel, route-based exploration expansion, and stronger faction gating tied to travel.
- **Later expansions only:** arena as a major progression system, guild as a major progression system, and other deep social/endgame layers.

This keeps current repo momentum aligned with the locked roadmap, uses existing systems first, and avoids premature work on high-cost later-book features.
