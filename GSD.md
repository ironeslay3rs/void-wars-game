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
| **Void field (realtime shell)** | `/void-field`, `/deploy-into-void/field`, `/bazaar/void-field` | `features/void-maps/`, `VoidRealtimeBridge`, `rollVoidFieldLoot`, `resolveAuthoritativeMobLoot` | Deploy, `ADD_FIELD_LOOT`, `APPLY_VOID_INSTABILITY_DELTA`, extraction | 🟢 | Server mob loot parity closed Phase 8: bridge falls back to client roll on silent `mob_defeated`. Deploy → loot → extract → ledger + strain still smokes the same way |
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

---

## 2026-04-09 — M3 (pivoted): The Open World Awakens — Phases 1-5 shipped

Big design pass per `docs/big-plan-open-world-awakens.md`. Landed five
incremental commits that bring the canonical 3-empire / 7-school /
7-lane structure to life as the spine of the game. Full test suite
remains green (70/70 tests passing). Typecheck clean after every phase.

**Phase 1 — Data foundation (`31aa58b`)**
- `features/empires/{empireTypes,empireData,empireSelectors}.ts` — three
  empires (Bio, Mecha, Pure) as civilizational bodies, each parented to
  2-3 schools.
- `features/schools/{schoolTypes,schoolData,schoolSelectors}.ts` — the
  canonical 7 schools (Bonehowl of Fenrir, Mouth of Inti, Flesh Thrones
  of Olympus, Crimson Altars of Astarte, Thousand Hands of Vishrava,
  Divine Pharos of Ra, Clockwork Mandate of Heaven) with full canon
  metadata: sin, nation, pantheon, parent empire, paired black market
  lane, pressure identity, countermeasure style, and origin tag joins.
- `features/schools/schoolSelectors.test.ts` — 19 tests pinning the
  structure.
- `docs/big-plan-open-world-awakens.md` — design vision document
  (supersedes the outdated `world-expansion-plan.md`).

**Phase 2 — Routes (`b78897f`)**
- `/empires` index, `/empires/[empireId]` detail, `/schools` index,
  `/schools/[schoolId]` HQ. All four routes static-generated from the
  canonical SCHOOL_ORDER and EMPIRE_ORDER arrays.
- `components/empires/{EmpireOverviewCard,EmpireDetailScreen}.tsx`,
  `components/schools/{SchoolListByEmpire,SchoolHqScreen}.tsx`.
- Navigation entries added to `homeMenuData.ts`.

**Phase 3 — Dual-face cross-links (`39bc3e6`)**
- `components/schools/OpenFaceLink.tsx` — declarative lane → school
  link.
- Rolled into all 7 sin lanes: Arena (wrath), Feast Hall (gluttony),
  Mirror House (envy), Velvet Den (lust), Golden Bazaar (greed), Ivory
  Tower (pride), Silent Garden (sloth). Each lane now surfaces a
  one-click jump to its open-face school. The school → lane direction
  was already built into `SchoolHqScreen` in Phase 2.

**Phase 4 — Mission origin resolution (`b54b842`)**
- `MissionOriginBadge` becomes a clickable Link when the origin tag
  resolves to a canonical school via `getSchoolForOriginTag()`. Six
  of seven origin tags resolve (`black-market-local` is by-design
  unmapped). Hover title carries the full lineage: `School name —
  Nation (Pantheon) · material flavor`.

**Phase 5 — Doctrine pressure surfaces school names (`280bbde`)**
- `ZoneDoctrinePressurePanel` replaces `Dominant: Bio` with
  `Held by the Bio Empire` (linking to `/empires/bio`) plus a row of
  clickable school chips showing every school the dominant empire
  owns, each linking to its HQ.

**Player success criteria (from the design doc):**
1. ✅ Open `/empires` and immediately understand there are 3 empires
2. ✅ Click any empire and see its 2-3 child schools
3. ✅ Open `/schools` and see all 7 schools organized by empire
4. ✅ Click any school and see its sin, nation, lane pairing, pressure
5. ✅ Walk into any black market lane and click through to the open-face school
6. ✅ See any mission's origin tag resolve to a real school name with one click
7. ✅ Read any zone's doctrine pressure as a school name, not a percentage triplet

**Phases deferred:**
- Phase 6 — First-session school affinity (touches `/new-game` flow that
  was just refreshed in M2; defer until Phases 1-5 prove the data shape)
- Phase 7 — Convergence wire-up (the natural payoff; needs schools to be
  walkable first, which is now true)
- Phase 8 — Realtime mob loot parity (parallel technical track; lives at
  `features/void-maps/realtime/`)

---

## 2026-04-09 — Open World Awakens — Phases 6-8 shipped (full plan complete)

Three independent slices landed in one session: school affinity,
convergence wire-up, and realtime loot parity. Full suite green
(89/89 tests passing). Typecheck clean after every phase.

**Phase 6 — First-session school affinity (`cf496fd`)**
- `PlayerState.affinitySchoolId` (string | null) + `SET_AFFINITY_SCHOOL`
  action wired through `playerIdentityReducer`. `SET_FACTION_ALIGNMENT`
  now clears the affinity (switching empires invalidates the prior pick).
- `gameStorage` normalizes the field on load; legacy saves get `null`.
- `createNewPlayer()` accepts `affinitySchoolId`.
- `components/onboarding/SchoolAffinityPicker.tsx` — picks one of the
  empire's 2-3 schools as the open-face affinity, surfacing sin, nation,
  and paired lane on each card.
- `/new-game` step 2 grows: `SchoolSelector` picks empire, picker fades
  in below for affinity choice. `canNextFrom2` requires both. Step 4
  confirmation reads "You stand with the [School Name] in [Nation]. The
  [Lane] is your shadow walk in Blackcity."
- `components/home/AffinityBadge.tsx` — compact card on the home command
  deck showing school + empire + shadow lane, all clickable. Renders
  nothing for unbound players or pre-Phase 6 saves.

**Phase 7 — Convergence wire-up (`39aff38`)**
- `applyCrossSchoolExposureToPlayer()` helper consolidates the
  `trackCrossSchoolExposure` + `getAnomalyFlavorLine` + `lastAnomalyToast`
  bookkeeping that was inline in `INSTALL_MINOR_RUNE`. Reducers now have
  a one-liner contract.
- New `RECORD_CROSS_SCHOOL_EVENT` action wired in `progressionReducer`.
- `SchoolHqScreen` dispatches the action exactly once per off-empire
  school visit via a per-school ref guard.
- `AnomalyToast` moved INSIDE `GameProvider` (in `AuthProvider`) so the
  Book 6 reveal can fire on any authenticated route. `GameHudShell`
  drops its local mount to avoid double-rendering.
- `convergenceSeed.test.ts` — 12 tests pinning unbound no-op, same-school
  no-op, encounter and anomaly counters, mismatchEncountered threshold
  (5 touches across 2 schools), one-shot toast firing, school identity
  updates on second-school touch, derived helpers.

**Phase 8 — Realtime mob loot parity (`f4ad433`)**
- `features/void-maps/realtime/resolveAuthoritativeMobLoot.ts` — pure
  helper that resolves a `mob_defeated` event into loot lines. Trusts the
  server when present, falls back to a deterministic client roll using
  the same `rollVoidFieldLoot()` shell mobs already use when the server
  is silent. Closes the gap where pre-M4 servers (or any silent server)
  would silently rob the player of loot from server-authoritative mobs.
- `VoidRealtimeBridge.mob_defeated` handler now calls the helper instead
  of inlining the trust check — code shrinks and intent gets clearer.
- `resolveAuthoritativeMobLoot.test.ts` — 7 tests covering trust-the-
  server, fallback when undefined, fallback when empty array, degenerate
  empty result on unknown zone, deterministic seed reproducibility, boss
  mob fallback path.

**GSD status promotions earned (pending smoke verification):**
- *Void field (realtime shell)* (🟡 → on track for 🟢) — server mob loot
  is now robust against missing `lootLines`.

**Loops affected:**
- *Void field boss* (🟡): boss fallback path tested, drop is now
  deterministic.
- *Onboarding* (🟢): now teaches the dual-face structure in step 2.
- *Home command deck* (🟢): affinity badge surfaces the player's school.

**The full Open World Awakens plan is now COMPLETE. All 8 phases shipped.**

Player success criteria from `docs/big-plan-open-world-awakens.md` plus
the three follow-on phases:

1. ✅ Open `/empires` and immediately understand there are 3 empires
2. ✅ Click any empire and see its 2-3 child schools
3. ✅ Open `/schools` and see all 7 schools organized by empire
4. ✅ Click any school and see its sin, nation, lane pairing, pressure
5. ✅ Walk into any black market lane and click through to its school
6. ✅ See any mission's origin tag resolve to a real school name
7. ✅ Read any zone's doctrine pressure as a school name
8. ✅ NEW (P6) Pick a school in the New Game flow and see it on home
9. ✅ NEW (P7) Visit an off-empire school HQ and feel the convergence toast fire
10. ✅ NEW (P8) Get loot from every realtime kill — even if the server forgets to send it

---

## 2026-04-09 — Static smoke pass + GSD promotion

Ran `npx next build` after Phases 6-8: zero errors, zero warnings, all 10
new routes generate (`/empires`, `/empires/{bio,mecha,pure}`, `/schools`,
`/schools/[7 slugs]`). Full vitest suite still 89/89 green.

**Static walk of the 10 success criteria:**
- App routes for `/empires` + `/schools` exist and consume canonical
  data via `getAllEmpires()` / `getSchoolsByEmpire()`.
- `EmpireDetailScreen` consumes `SchoolListByEmpire` for child schools.
- `SchoolHqScreen` reads sin / nation / pantheon / laneRoute / pressure /
  countermeasure / breakthrough from `school` prop, fed by static params.
- `OpenFaceLink` is imported into all 7 sin lanes (Arena, Feast Hall,
  Mirror House, Velvet Den, Golden Bazaar, Ivory Tower, Silent Garden).
- `MissionOriginBadge` resolves through `getSchoolForOriginTag()`.
- `ZoneDoctrinePressurePanel` reads `getEmpireById(dom).name` and
  iterates `getSchoolsByEmpire(dom)`.
- `affinitySchoolId` flows through `gameTypes` → `initialGameState` →
  `gameStorage` (load normalize) → `playerIdentityReducer`
  (`SET_AFFINITY_SCHOOL`, cleared on `SET_FACTION_ALIGNMENT`) →
  `playerFactory.createNewPlayer` → `SchoolAffinityPicker` (picks) →
  `AffinityBadge` (surfaces on home).
- `RECORD_CROSS_SCHOOL_EVENT` action lives in `gameTypes` and is
  handled in `progressionReducer` via the new
  `applyCrossSchoolExposureToPlayer` helper. `SchoolHqScreen` dispatches
  it once per off-empire visit.
- `AnomalyToast` mounted globally inside `GameProvider` (in
  `AuthProvider`).
- `resolveAuthoritativeMobLoot` is wired into `VoidRealtimeBridge`'s
  `mob_defeated` handler with full server / fallback / empty branches
  pinned by 7 tests.

**One technical-debt cleanup found mid-walk:**
`features/game/reducers/missionReducer.ts` had two inline copies of the
convergence pattern that should have used the new helper from Phase 7.
Refactored both to call `applyCrossSchoolExposureToPlayer`. Hunt loot
ledger + expedition contract test files (24 tests) still pass.

**Status promotion:**
- *Void field (realtime shell)* 🟡 → 🟢 — the gap that kept it yellow
  ("see task queue for server mob parity") is exactly the gap Phase 8
  closes, and the helper is test-pinned.

**Cells that did NOT promote (need actual click-through):**
- Mission queue (AFK), Hunt resolve, Black Market sin venues, Path
  districts, Mastery / Mythic, Exploration / biotech lead — Phase 6-8
  changes are additive but the original verification flows still need
  manual smoke.

**Caveat:** This was a STATIC smoke pass — `next build` plus grep / read
verification. It catches build breakage, route generation failure, and
import drift, but does not exercise actual UI flows in a browser. Full
browser smoke is a future task.

