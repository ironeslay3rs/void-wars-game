# Canon Naming Migration Plan

## Role Summary
This document scopes a small, safe migration plan from the repo's current legacy `Spirit` macro-path wording to the locked canon naming law.

Canon rules used here:
- Macro path names: `Bio` / `Mecha` / `Pure`
- Named doctrines: `Verdant Coil` / `Chrome Synod` / `Ember Vault`
- `Ember` / `Ash` / `Rune` are Pure-side subtraditions, not peer macro paths
- Use `Affiliation` when a screen mixes path and organization language

This plan intentionally does **not** recommend a broad rewrite yet.

## Exact Files
These are the exact files where legacy `Spirit` wording still acts as the macro path in user-facing labels, path copy, route names, or code-facing path identifiers.

### Immediate UI wording layer
- `features/factions/factionData.ts`
- `features/factions/factionsScreenData.ts`
- `features/faction-hqs/factionHqsScreenData.ts`
- `features/status/statusScreenData.ts`
- `features/career/careerScreenData.ts`
- `features/professions/professionsScreenData.ts`
- `features/bazaar/bazaarDistrictData.ts`
- `features/bazaar/bazaarMapNodes.ts`
- `features/spirit-enclave/spiritEnclaveScreenData.ts`
- `app/bazaar/spirit-enclave/page.tsx`
- `app/bazaar/faction-hqs/page.tsx`
- `app/arena/page.tsx`
- `app/arena/match/page.tsx`
- `components/home/MissionPanel.tsx`
- `components/home/MainMenuCenterStage.tsx`
- `components/inventory/InventoryScreen.tsx`
- `components/inventory/InventoryOverviewCard.tsx`
- `components/missions/MissionsScreen.tsx`
- `components/status/StatusHeroCard.tsx`

### Medium-risk route and screen naming layer
- `features/navigation/navigationData.ts`
- `features/navigation/navigationTypes.ts`
- `features/bazaar/bazaarRouteMap.ts`
- `features/bazaar/bazaarDistrictData.ts`
- `features/bazaar/bazaarMapNodes.ts`
- `app/bazaar/spirit-enclave/page.tsx`
- `features/spirit-enclave/spiritEnclaveScreenData.ts`

### High-risk system and persistence layer
- `features/game/gameTypes.ts`
- `features/game/initialGameState.ts`
- `features/game/gameStorage.ts`
- `features/game/gameActions.ts`
- `features/game/gameSelectors.ts`
- `features/game/gameProgress.ts`
- `features/game/gameMissionUtils.ts`
- `features/factions/factionData.ts`
- `config/theme.ts`
- `config/bazaarTheme.ts`
- `components/bazaar/BazaarNode.tsx`

## Current Legacy Terms
The current repo still uses these terms as top-level or peer-path language:
- `Spirit` as the third macro path label
- `spirit` as the third path key alongside `bio` and `mecha`
- `Spirit Enclave` as the third bazaar district name
- `Spirit Sanctum` as a navigation route
- `Spirit Wing` as a faction/HQ choice label
- `Bio | Mecha | Spirit` as a peer-path trio
- `Spirit-aligned` / `spirit-based progression` copy
- `Faction Alignment` and `Current faction` on screens that also describe organization-side structures

## Target Canon Terms
Use the following canon replacements and constraints:
- Macro path label: `Spirit` -> `Pure`
- Macro path trio: `Bio / Mecha / Spirit` -> `Bio / Mecha / Pure`
- Organization/doctrine trio: `Bio / Mecha / Spirit` when used as org language -> `Verdant Coil / Chrome Synod / Ember Vault`
- Mixed path + organization screens: use `Affiliation` instead of `Faction Alignment`
- Keep `Ember`, `Ash`, and `Rune` under the Pure umbrella as subtraditions, not replacement peer macro paths
- Do **not** immediately rename storage keys, mission ids, route ids, or serialized values from `spirit` until compatibility work is prepared

## Safe Immediate Fixes
These are safe because they are wording-only and can be done without changing ids, persisted values, or route structure.

1. Replace user-facing macro-path labels from `Spirit` to `Pure` in formatter helpers and static screen data.
   - Examples: `features/status/statusScreenData.ts`, `features/factions/factionsScreenData.ts`, `app/arena/page.tsx`, `app/arena/match/page.tsx`, `components/home/MissionPanel.tsx`, `components/inventory/InventoryScreen.tsx`, `components/inventory/InventoryOverviewCard.tsx`, `components/missions/MissionsScreen.tsx`, `components/status/StatusHeroCard.tsx`
2. Update trio copy from `Bio / Mecha / Spirit` to `Bio / Mecha / Pure` in descriptive text.
   - Examples: `features/career/careerScreenData.ts`, `features/professions/professionsScreenData.ts`, `features/bazaar/bazaarDistrictData.ts`
3. On mixed org/path screens, rename `Faction Alignment` and `Current faction` to `Affiliation`.
   - Examples: `features/faction-hqs/factionHqsScreenData.ts`, `app/bazaar/faction-hqs/page.tsx`
4. Rename organization-facing button labels from generic path wording to canon doctrine wording where the UI is clearly about HQs.
   - Example: `Bio Wing` / `Mecha Wing` / `Spirit Wing` -> `Verdant Coil` / `Chrome Synod` / `Ember Vault` in `app/bazaar/faction-hqs/page.tsx`
5. Keep internal values as `bio` / `mecha` / `spirit` for now while mapping the displayed label for `spirit` to `Pure`.

## Medium-Risk Targets
These areas are still mostly presentation-facing, but they also affect routing, imports, and developer mental models.

1. Rename `Spirit Enclave` presentation to a canon-safe Pure-side location name, while keeping the current route id temporarily if needed.
   - Files: `features/spirit-enclave/spiritEnclaveScreenData.ts`, `app/bazaar/spirit-enclave/page.tsx`, `features/bazaar/bazaarDistrictData.ts`, `features/bazaar/bazaarMapNodes.ts`
2. Decide whether `Spirit Sanctum` should become a Pure macro-path route label or a doctrine/subtradition-specific destination.
   - Files: `features/navigation/navigationData.ts`, `features/navigation/navigationTypes.ts`
3. Centralize label mapping so multiple screens stop hardcoding `if (faction === "spirit") return "Spirit"`.
   - Files currently duplicating this pattern: `app/arena/page.tsx`, `app/arena/match/page.tsx`, `components/home/MissionPanel.tsx`, `components/inventory/InventoryScreen.tsx`, `components/inventory/InventoryOverviewCard.tsx`, `components/status/StatusHeroCard.tsx`, `components/missions/MissionsScreen.tsx`, `features/factions/factionsScreenData.ts`, `features/faction-hqs/factionHqsScreenData.ts`
4. Review whether `factionData` should stay path-oriented, doctrine-oriented, or split into separate path-vs-organization datasets.
   - File: `features/factions/factionData.ts`

## High-Risk Targets
These areas should wait until after the wording layer is stabilized because they can break saved data, reducers, mission data, route access, or theme lookups.

1. Core type system and persisted state keys still encode `spirit` as the third canonical path key.
   - Files: `features/game/gameTypes.ts`, `features/game/gameStorage.ts`
2. Initial missions and game content use `path: "spirit"` and ids like `spirit-ember-trial`.
   - File: `features/game/initialGameState.ts`
3. Reducers and selectors likely depend on `spirit` surviving as a valid discriminant.
   - Files: `features/game/gameActions.ts`, `features/game/gameSelectors.ts`, `features/game/gameProgress.ts`, `features/game/gameMissionUtils.ts`
4. Theme maps and node styling are keyed by `spirit`.
   - Files: `config/theme.ts`, `config/bazaarTheme.ts`, `components/bazaar/BazaarNode.tsx`, `features/bazaar/bazaarMapNodes.ts`
5. Saved-game hydration currently validates `spirit` values directly, so a raw key rename would require backward-compat migration logic.
   - File: `features/game/gameStorage.ts`

## Best First Migration Slice
The best first slice is:

**UI label normalization only, with no id or storage changes.**

Scope:
- Add a shared display-label helper that maps `bio -> Bio`, `mecha -> Mecha`, `spirit -> Pure`
- Replace duplicated `Spirit` formatter returns in current screens with that helper
- Update static copy from `Bio / Mecha / Spirit` to `Bio / Mecha / Pure`
- On `Faction HQs`, switch mixed wording to `Affiliation` and relabel the three HQ buttons to `Verdant Coil`, `Chrome Synod`, and `Ember Vault`

Why this first:
- It fixes the most visible canon mismatch immediately
- It avoids breaking persistence, route ids, and reducer logic
- It creates one translation layer before touching deeper data-model terminology
- It keeps Pure-side subtraditions (`Ember` / `Ash` / `Rune`) under the correct umbrella instead of accidentally promoting them to peer paths

## Final Result
Recommended migration order:
1. **First**: ship the UI-only label normalization slice.
2. **Second**: rename route and district presentation names after choosing the canon Pure-side district naming.
3. **Third**: plan a compatibility migration for internal `spirit` keys, mission ids, route ids, and saved-game hydration.

This keeps the first pass small, safe, and canon-correct while preserving repo stability.
