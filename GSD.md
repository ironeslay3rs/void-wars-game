# GSD — Get Shit Done

Working doc for **closing loops**, **auditing flows**, and **shipping incremental upgrades** on *Void Wars: Oblivion*. Use this alongside `AGENTS.md`, `project-docs/workflow/VOID_WARS_TASK_QUEUE.md`, and `project-docs/workflow/VOID_WARS_DIRECTOR.md`.

---

## How to use this file

1. **Before a work session:** pick one **wave** or one **loop row** below; define files in scope; note what is explicitly *out of scope*.
2. **During implementation:** keep routes thin; put logic in `features/`; reuse `gameReducer` actions — avoid parallel state machines.
3. **After changes:** `npx tsc --noEmit`; targeted tests if the loop has coverage (`npm test -- <pattern>`); manual smoke per **Verification** column.
4. **Update this doc** when a loop moves from 🔴→🟡→🟢 or when crafting layout changes (small diff in the tables).

**Status legend:** 🟢 trusted / wired end-to-end · 🟡 partial or shell UI · 🔴 stub, copy-only, or known parity gap.

---

## 1. Core gameplay loops (audit matrix)

| Loop | Primary routes | Feature / logic hubs | Key actions / outcomes | Status | Verification (smoke) |
|------|----------------|----------------------|-------------------------|--------|-------------------------|
| **Onboarding** | `/new-game`, `/` | `features/game/createNewPlayer`, `gameContext`, `GameOnboardingRouteGuard` | `characterCreated`, path pick, starter resources | 🟢 | New save → cannot skip to home without completing flow |
| **Home command deck** | `/home` | `HomeHudClient`, `MissionPanel`, `MainMenuRightRail`, `gameSelectors` | Readiness, doctrine strip, ascension step, strain | 🟢 | Open home → panels render; links resolve |
| **Mission queue (AFK)** | `/missions` | `missionRunner`, `gameMissionUtils`, `PROCESS_MISSION_QUEUE` | Queue, timers, `RESOLVE_HUNT`, rewards, strain | 🟡 | Queue mission → completes → resources/XP/strain update |
| **Hunt resolve (legacy path)** | `/hunt` | `app/hunt/page.tsx`, encounter flow | Condition, loot, `RESOLVE_HUNT` | 🟡 | Confirm still consistent with mission definitions |
| **Void field (realtime shell)** | `/void-field`, `/deploy-into-void/field`, `/bazaar/void-field` | `features/void-maps/`, `VoidRealtimeBridge`, `rollVoidFieldLoot` | Deploy, `ADD_FIELD_LOOT`, `APPLY_VOID_INSTABILITY_DELTA`, extraction | 🟡 | Deploy → loot → extract → ledger + strain; see task queue for server mob parity |
| **Void field boss** | `/void-field/boss-encounter` | Boss flow + loot | Boss rewards, condition | 🟡 | Single path smoke after field changes |
| **Exploration / biotech lead** | `/bazaar` map → biotech, `ExplorationPanel` | `START_EXPLORATION_PROCESS`, `CLAIM_EXPLORATION_REWARD` | Timed process, hunger cost, infusion tithe | 🟡 | Start sweep → wait/resolve → claim → state updates |
| **Arena** | `/arena`, `/arena/match`, `/bazaar/arena` | `features/combat`, arena SR, mythic valor | `APPLY_ARENA_RANKED_SR_DELTA`, valor gains when converged | 🟢 | Match → SR/valor change where applicable |
| **War Exchange** | `/bazaar/war-exchange` | `marketActions`, `warDemandMarket`, `warEconomy` | `MARKET_BUY` / `MARKET_SELL`, demand multipliers | 🟢 | Buy/sell → credits + capacity enforced |
| **Golden Bazaar (void market)** | `/bazaar/black-market/golden-bazaar`, `/bazaar/void-market` | `VOID_MARKET_TRADE`, listings | Trade execution | 🟢 | Sell credits now apply `war.sellMult` in reducer (parity with UI); disabled buttons show shortfall copy |
| **Black Market sin venues** | `/bazaar/black-market/*` | District screens, feast hall, etc. | `USE_FEAST_HALL_OFFER`, district state | 🟡 | Each venue: link in + primary action works or shows honest lock |
| **Crafting District** | `/bazaar/crafting-district` | `craftActions`, `recipeData`, work orders | `CRAFT_RECIPE`, work order progress | 🟢 | Craft success/fail → mats + infusion; work order ticks |
| **Path districts** | `/bazaar/mecha-foundry`, `/bazaar/pure-enclave`, `/bazaar/biotech-labs` | Path-specific UI + data in `features/*` | Varies by screen | 🟡 | Per-screen: one primary action + resource change |
| **Guild** | `/guild`, `/bazaar/mercenary-guild` | `factionWorldLogic`, contracts | `GUILD_*` actions | 🟡 | Post/claim contract path; pledge theater copy |
| **Loadout** | `/loadout` | Loadout slots, combat modifiers | `EQUIP_LOADOUT_ITEM` | 🟢 | Equip → void field / encounter reads modifiers |
| **Mastery / Mythic** | `/mastery` | `runeMastery*`, `mythicAscension*` | Depth, convergence, valor redemption | 🟡 | Functional depth exists; full mastery layer still shallow (see gaps) |
| **Recovery** | `/recover`, `/status`, Feast Hall | Survival ticks, `RECOVER_CONDITION` | Condition, hunger, infusion decay | 🟢 | Recovery clears or softens pressure meters |
| **Teleport / deploy** | `/bazaar/teleport-gate`, `/deploy-into-void` | Gate state, zone selection | `unlockedRoutes`, deploy binding | 🟡 | Gate open flow → void entry |

---

## 2. Crafting & prep layout (where things live)

| Surface | Route(s) | Purpose | Recipes / systems | Upgrade notes |
|---------|----------|---------|---------------------|---------------|
| **Crafting District** | `/bazaar/crafting-district` | Core recipes, refining tab, work orders, stall arrears | `craftRecipes`, `craftWorkOrderData`, `lastCraftOutcome` + `CLEAR_LAST_CRAFT_OUTCOME` | **Done (2026-04-04):** tabbed `CRAFT_RECIPE` shows success vs fail vs gate deny. Next: afford feedback on `CRAFT_NEXT_RUN_MODIFIER` silent no-op. |
| **Next-run modifiers** | Crafting district panel | Single-slot prep kits | `CRAFT_NEXT_RUN_MODIFIER`, `getNextRunModifierCraftBlocker` | **2026-04-04:** preflight mats + void-extract gate before dispatch; no false “Kit primed” |
| **Mecha Foundry** | `/bazaar/mecha-foundry` | Mecha-themed crafting/binds | Tied to mecha path + recipes | Audit: every CTA maps to a real `dispatch` |
| **Pure Enclave** | `/bazaar/pure-enclave` | Pure/rune-facing services | `features/pure-enclave/` | Legacy `/bazaar/spirit-enclave` must keep redirecting |
| **Biotech Labs** | `/bazaar/biotech-labs`, `.../result` | Specimen / bio loop | Leads, `hasBiotechSpecimenLead` | Wire result page to exploration claim if fragmented |
| **Feast Hall** | `/bazaar/black-market/feast-hall` | Hunger / recovery offers | `USE_FEAST_HALL_OFFER` | Confirm lockout chips match `activeFeastHallOfferId` |
| **War Exchange** | `/bazaar/war-exchange` | Resource sink/source | Not crafting but feeds prep | Already surfaces war front + doctrine panel |
| **Inventory** | `/inventory` | Capacity, overload, discard | `checkCapacity`, quick discard | Cargo infusion copy unified — keep penalty math single-sourced |

**Layout principle:** one **mental model** for players: *Crafting District = general forge*; path halls = *flavor + gated recipes*; Black Market = *sin + survival services*. If two screens do the same thing, **merge CTAs** or **cross-link** with one canonical action.

---

## 3. Known gaps (do not “discover” from scratch)

Synced with `CLAUDE.md` + `VOID_WARS_TASK_QUEUE.md` — treat as backlog sources of truth:

- **Realtime mob loot parity** — shell mobs vs server-authoritative mobs (`features/void-maps/realtime/`).
- **Mastery functional layer** — ~~capacity costs + set tiers~~ wired in tree; **2026-04-04:** install success/fail toasts (`lastRuneInstallOutcome`); `/mastery` hub cards live from save; unit tests on rune logic + reducer.
- **Black Market** — extend buy/sell beyond Golden Bazaar / void market when canon allows.
- **Phase 2 named materials** — not in current resource keys until scoped.
- **Hunt ledger / E2E** — unit tests exist; full browser E2E optional but valuable.
- **Director UI debt** — loadout tooltips; ~~crafting failure feedback~~ (recipe toasts shipped — kits/work orders still thin).

---

## 4. General audit protocol (repeatable)

For any loop row above:

1. **Trace entry** — route → top-level client component.
2. **Trace state** — list `dispatch` types used; confirm each exists in `gameReducer`.
3. **Trace resources** — credits, materials, capacity, infusion/strain; no orphan UI that promises rewards not granted.
4. **Trace return** — where does the player land next (home, result, modal)? Is “what changed?” visible?
5. **Canon / naming** — Bio / Mecha / Pure (not Spirit) in player-facing copy; Black Market = neutral citadel.
6. **Record** — update the Status column in §1 when done.

---

## 5. Implementation waves (suggested order)

**Wave A — Trust & parity (highest ROI)**  
- Void field loot ledger + realtime parity checklist.  
- Mission queue vs hunt page consistency (single source of mission resolution if possible).  
- ~~Golden Bazaar / void market~~ — `VOID_MARKET_TRADE` buy/sell wired; sell uses regional `sellMult`; shortfall hints when disabled.  
- ~~Crafting: visible failure/success feedback~~ — `CRAFT_RECIPE` wired via `player.lastCraftOutcome` + Crafting District UI.

**Wave B — Clarity & onboarding**  
- ~~Loadout hints + deploy nudge~~ — `LOADOUT_SLOT_HINTS` on loadout cards; Void Expedition shows loadout link when weapon empty.  
- ~~Bazaar map~~ — added **Void Market** district node → `/bazaar/void-market` (War Exchange hub unchanged).  
- ~~Black Market venues~~ — hub **M1 loop** strip; Greed map tile → Golden Bazaar; shortfall lines on sin lanes + Feast Hall; Golden Bazaar links Auction House.

**Wave C — Depth (post–M1 or explicit approval)**  
- ~~Mastery functional layer~~ — **slice (2026-04-04):** rune install feedback + live hub stat cards + tests; deeper respec / hybrid unlocks still backlog (`masteryFramework`).  
- Named materials / economy expansion.  
- Steam / mobile / self-hosted tracks per task queue.

---

## 6. Agent session template (copy/paste)

```
Goal: GSD §[section] — [loop name]
Scope files: [list]
Out of scope: [list]
Canon checked: LOCKED_CANON / FACTION_LANGUAGE (if copy)
Validation: npx tsc --noEmit; [tests]
Smoke: [steps from Verification column]
```

---

## 7. Quick reference paths

| Area | Path |
|------|------|
| Reducer | `features/game/gameActions.ts`, `gameTypes.ts` |
| Loot | `features/void-maps/rollVoidFieldLoot.ts`, `ADD_FIELD_LOOT` |
| Missions | `features/missions/missionRunner.ts` |
| Market | `features/market/marketData.ts`, `features/world/warDemandMarket.ts` |
| Crafting | `features/crafting/recipeData.ts`, `features/crafting/craftActions.ts`, `lastCraftOutcome` on `PlayerState`, `features/crafting-district/nextRunModifierCraft.ts` |
| Infusion / strain copy | `features/status/voidInfusionMetaphor.ts`, `phase3Progression.ts` |
| Ascension step UI | `features/progression/ascensionStep.ts` |
| Nav | `features/navigation/navigationItems.ts`, `homeMenuData.ts` |
| Bazaar map nodes | `features/bazaar/bazaarDistrictData.ts`, `bazaarHubData.ts` |
| Loadout | `features/player/loadoutState.ts` (`LOADOUT_SLOT_HINTS`) |
| Black Market UX | `features/black-market/sinLaneDealHelpers.ts`, `BlackMarketMap.tsx` |
| Mastery hub / install UX | `features/mastery/masteryHubCards.ts`, `lastRuneInstallOutcome` + `CLEAR_LAST_RUNE_INSTALL_OUTCOME` in `gameTypes` / `gameActions` |

---

*Last seeded: 2026-04-04. Revise status cells as loops are proven. Session log: Wave A — `CRAFT_RECIPE` toasts; void market sell `war.sellMult` parity; next-run kit preflight; bazaar shortfall hints. Wave B — loadout slot hints, deploy loadout nudge, bazaar Void Market node, Black Market honesty pass (map Greed fix, sin-lane shortfalls, hub strip). Wave C (slice) — mastery install toasts, live `/mastery` stat cards, `runeMasteryLogic` + install-outcome reducer tests.*

---

## 2026-04-09 — M2 sealed: integrate-home-guide branch consolidation

WIP audit + 16 commits landed on `integrate-home-guide`. `npx tsc --noEmit` clean (exit 0). Status cells unchanged pending smoke verification — the commits below are *capability* deltas, not promotions to 🟢.

**State layer (keystone, `bea5396`)**
- `features/game/gameTypes.ts`: `MissionOriginTagId`, `CrossSchoolExposure` (hidden seed for M5), `lastAnomalyToast`, `brokerCooldowns`, `BROKER_INTERACT`, `activeRuns`, `MissionDefinition.{originTag, rumorFlavor}`.
- `features/game/lib/runPressure.{ts,test.ts}` for shared run-pressure math.
- Reducers updated: economy, mission, progression.

**Lore + brokers (`399926e`)**
- New `features/lore/` (broker, broker interaction, canon lines, district, market events, nation, pressure voice, puppy onboarding, resource flavor, settlement flavor).
- New shared components: `BrokerCard`, `BrokerInteractionModal`, `CanonQuote`, `LoadingQuote`, `ResourceTooltip`, `ScreenDataStatStrip`, `ScreenDataManualSections`.
- BrokerCard rolled into 9 district screens (Arena, Ivory Tower, Mirror House, Silent Garden, Velvet Den, Golden Bazaar, Black Market Map, Hunting Ground, Inventory).

**Convergence seed (`7d7c721`, M5 prep)**
- `features/convergence/{convergenceSeed,anomalyFlavorData}.ts` + `AnomalyToast`. Architecture in place; no reducer writes to it yet.

**Black Market (`18eb1e4`, `fbe78d4`)**
- FeastHallScreen decomposed into `feast-hall/{FeastHallBrokers,FeastHallLoreCards,OperativeReadiness}` (−374 lines on the parent shell).
- New `/bazaar/ember-vault` district route (canonical Pure/Rune market location per `lore-canon/01 Master Canon/Locations/Black Market.md`).

**Mastery (`48a51e4`)**
- `features/mastery/{doctrineData,doctrineEncounterCheck}.ts` (21 doctrine lines, 7 per school).
- `DoctrineMilestone` card + `DoctrineEncounterOverlay`.

**Missions / Hunt (`14ab2d6`)**
- `features/missions/missionOriginTags.ts` + `MissionOriginBadge` rendered in MissionsScreen + MissionResult.
- `features/hunt/huntNarrationData.ts` + `HuntNarration` + `SettlementLoreOverlay` for post-hunt lore beats.

**Home + Upgrades (`78a7aae`, `9bba505`)**
- `features/upgrades/` scaffold (types, hub data, roadmap data + test, selectors), `/upgrades` route, `UpgradeHub` + `UpgradeRoadmapSection`, `UpgradeNudge` on home rail.
- HomeHudClient integrated: guide rail + upgrade nudge + market event headline.
- `MarketEventHeadline` reads from `features/lore/marketEventData`.
- Status screen: `StatusHeroCard` + `StatusLoadoutSnapshotCard`.

**Guidance (`96c9165`)**
- `features/guidance/{homeCommandCopy,missionBlockReasonCopy,missionsPlaybookCopy}.ts` (each with unit tests).

**Onboarding (`5b038c1`)**
- `app/new-game/page.tsx` + `components/onboarding/SchoolSelector.tsx` overhaul.

**PWA + infra (`1184aef`, `7a8bcc6`)**
- `app/manifest.ts`, dynamic icon/opengraph/twitter routes, `lib/siteUrl.ts`, 11 route loading states.
- Playwright e2e scaffold (`playwright.config.ts`, `e2e/`).

**Loops affected (need smoke verification before status promotion):**
- *Black Market sin venues* (🟡): brokers + lore cards present on every lane; FeastHall decomposed.
- *Mastery / Mythic* (🟡): doctrine milestones + encounter overlay added.
- *Mission queue (AFK)* (🟡): origin tags + rumor flavor + run pressure surface.
- *Hunt resolve (legacy path)* (🟡): hunt narration + settlement overlay.
- *Home command deck* (🟢): guide rail + upgrade nudge + market event headline (status maintained, depth added).

**Known gaps still open after M2:**
- Realtime mob loot parity (shell ↔ server-authoritative) — M3.
- Combat engine ↔ field flow integration — M3.
- 7-school dual-face slice (open schools tied to black market lanes) — M4 (pivoted from convergence per 2026-04-09 canon check).
- Convergence wire-up — M5 (pushed from M4; seed already in state shape).

