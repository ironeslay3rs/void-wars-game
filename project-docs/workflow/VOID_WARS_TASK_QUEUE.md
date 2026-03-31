# VOID WARS TASK QUEUE

## Current approved task

- **M1 consolidation pass:** war **sell** demand surfaced on War Exchange (`getWarExchangeSellDemandMultiplier` per row); **regional doctrine strip** on Home `MissionPanel` + `MissionsScreen` (`missionDoctrineStrip.ts`); void-field **extraction** banks via `ADD_FIELD_LOOT` (hunt `fieldLootGained` parity + pickup strain; extraction bulk strain omits duplicate lootUnits); **Phase 9** Knight `runeKnightValor` + Golden Bazaar **convergence sell bonus** (`warEconomy.ts`); **Convergence** +2% field pickup mult (`pathGatheringYield.ts`). Hunt ledger settlement: dev `[void-wars:hunt-field-loot]` + `npm test` (`huntLootLedgerResolution.test.ts`). Next: deeper arena prestige spend sinks.

## Recently closed (March 28, 2026)

- Puppy-first enforcement: `characterCreated` + `GameOnboardingRouteGuard` in `features/game/gameContext.tsx`; initial save is uncreated until New Game completes.
- Single Home stack: `GameHudShell` + `components/home/HomeHudClient.tsx` only; removed duplicate `components/layout/HomeShell.tsx` and `components/layout/HomeHudClient.tsx`.
- Pure district URL/id: `/bazaar/pure-enclave` + `pure-enclave` in bazaar data; legacy `/bazaar/spirit-enclave` redirects.
- New Game copy aligned with `SCHOOL_STARTER_PACK_SUMMARY` / `createNewPlayer` school resources.
- Home carry meter + mission overload cue: `HomeResourceStrip` / `MissionPanel` show capacity, penalties (time / field move / rewards), links to Inventory + War Exchange; loadout page highlights next empty slot + weapon-first guidance.
- Carry relief on Home: near-cap strip links War Exchange; overloaded strip uses `QuickDiscardResourceButtons` (shared with inventory `OverloadWarning`). Pure enclave screen data lives in `features/pure-enclave/` (removed `features/spirit-enclave/`).
- Missions screen carry pressure: `components/missions/MissionsScreen.tsx` mirrors Home overload / near-cap messaging, War Exchange + Inventory links, and quick discard when overloaded.
- Phase 3 (M1 slice) closed out: void field extraction applies `APPLY_VOID_INSTABILITY_DELTA` via `computeVoidStrainFromVoidFieldExtraction`; `ADD_FIELD_LOOT` adds capped pickup strain; Home right rail + void HUD chip surface strain; moss ration trims strain; launch directive when instability high.
- Phase 4 start: refining tab + 3 `refining` recipes in `recipeData.ts`; `getRefiningPathBonus` in crafts; `WAR_EXCHANGE_SELL_BROKER_CUT` + War Exchange / Crafting District copy.
- Phase 4 continuation: path-themed gathering (`pathGatheringYield.ts`, void field + realtime hunt resources + encounterEngine); broker **work orders** (`craftWorkOrder` on `PlayerState`, Crafting District panel, claim/abandon).
- **Phase 4 closed (March 28, 2026):** rotating contract catalog (`getRotatingWorkOrderCatalog`); stall rent / arrears / War Exchange buy markup + `StallArrearsCallout`; docs aligned in codex Phase 4 repo line.
- Phase 5 (March 28, 2026): arena hub passes `mode` to `/arena/match`; `APPLY_ARENA_RANKED_SR_DELTA`; `arenaMatchModes.ts` + practice payout mult; practice bypasses 40% condition gate; **archetype SR + payout mult**; **3-beat telegraph** on enemy counters (`arenaEncounterProfiles` constants).
- **Phase 5 closed:** tournament **bracket display shell** (round counter, M1 cosmetic); prep/telegraph/SR variance delivered — see codex Phase 5.
- Phase 6 (March 28, 2026): contested-zone rotation + war-demand **buy** pricing + UI surfacing.

## Next suggested slices

- **Phase 8 (closed for vertical slice):** guild board, contracts, pledge theater, capacity-safe claims — see `app/guild`, `factionWorldLogic`.
- **Phase 9:** spend sinks for `runeKnightValor`; empire-scale copy on War Front; optional `getMasteryAligned*` cap bump (avoid stacking explosion).
- **Hunt timing / E2E:** `VOID_FIELD_ORB_COLLECTED` fills `fieldLootGainedThisRun` on pickup; extraction `ADD_FIELD_LOOT` uses `skipRunLedger` to avoid double-counting. Dev settlement logs: `[void-wars:hunt-field-loot]` (`gameMissionUtils` / `NODE_ENV=development`). Unit coverage: `npm test` → `features/game/huntLootLedgerResolution.test.ts` (queue resolves before extract + `skipRunLedger`). Full-browser E2E + authoritative double-roll checks still optional.
- **Black Market:** Golden Bazaar already wires `VOID_MARKET_TRADE`; extend listings or favor-cost layer when canon allows.
- Re-triage director Step 4+ (loadout tooltips, crafting failure toasts) — see `VOID_WARS_DIRECTOR.md`.
