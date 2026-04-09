\# VOID WARS DIRECTOR



\## Project Identity



Void Wars: Oblivion is a survival-first, war-scarred dark RPG where players deploy from the Black Market into the Void, hunt in dangerous field maps, extract resources, and return stronger. The game must feel readable, costly, and world-driven.



North star: growth brings power, war gives purpose, and every ascent risks corruption.



\## Locked Canon



\- Void = 3D prison where humanity was exiled

\- Fusion = body + mind + soul (the divine trinity, hidden until late-game)

\- Bio = Verdant Coil (blood, mutation, hunting, survival instinct)

\- Mecha = Chrome Synod (cybernetics, precision, engineered perfection)

\- Pure = Ember Vault (runes, soul, memory, sacred fire)

\- Black Market = neutral survivor citadel, not owned by any faction

\- Three Empires exist in the distance; Black Market survives on their scraps

\- Players start as Puppies (new, hungry, hopeful, easy to bait)

\- Book 1 scope only — grounded reality, lore below the surface

\- The first mistake is important. It should become the seed of identity.



\## Tech Stack



\- Next.js (App Router) on Vercel

\- GitHub for version control (push = auto-deploy)

\- Supabase for auth (cookie-based session, JWT in void-wars-session cookie)

\- Client-side state in features/ with reducer pattern

\- No backend database yet — player state is localStorage + Supabase auth



\## Live Site



https://void-wars-game.vercel.app



\---



\## Current Phase



\*\*M1 + Phase 6–9 (war front + guild + mythic convergence)\*\* — War Exchange buy/sell demand multipliers + UI; Home/Missions **regional war front** strip; void-field extraction uses `ADD_FIELD_LOOT` for ledger parity; Phase 9 convergence (hybrid relief, field pickup mult, valor, Golden Bazaar sell bonus). Phase 5 arena closed (modes, SR, telegraph).



\## Live Audit Status (March 28, 2026)



\### Live Home stack (canonical)

\- `app/home/page.tsx` → `components/layout/GameHudShell.tsx` → `components/home/HomeHudClient.tsx` (+ `MainMenuLeftRail`, `MainMenuCenterStage`, `MainMenuRightRail`, `HomeResourceStrip`, `BottomNav`).

\- Legacy duplicate `components/layout/HomeShell.tsx` and `components/layout/HomeHudClient.tsx` were removed — do not revive parallel home stacks.



\### Working



\- Login flow with cookie persistence (Step 1 DONE)

\- Homepage command deck: `GameHudShell` / `HomeHudClient` — path selector, condition, missions, resource strip, rails, bottom nav

\- Status screen: character identity, system states, rank/mastery, survival state with recovery prompts

\- Inventory: live item data, rarity tags, capacity tracking, resource counts, utility items

\- Missions: queue with timers, auto-resolve, reward previews, path-locked missions

\- Black Market hub: districts navigable; War Exchange buy/sell wired (prototype)

\- New Game: callsign + school + career → `createNewPlayer`; `characterCreated` gates all routes except `/new-game` until completion

\- Pure district route id: `/bazaar/pure-enclave` (legacy `/bazaar/spirit-enclave` redirects)

\- Career: Mastery Tree, Hour 20-40 spine, tri-rail Bio/Mecha/Pure progression

\- Arena: ranked/practice modes with condition gating

\- All routes survive hard navigation (session auth fixed)



\### Broken / Missing



\- Condition recovery tuning may still be needed — Emergency Ration uses `emergencyRationAvailableAt`; Recover Condition uses `conditionRecoveryAvailableAt` (separate cooldowns in code)

\- Inventory capacity: enforcement, overload penalties, and player-facing cues now live in `inventoryLogic`, inventory/Home/Missions — verify against design targets

\- Loadout: equip flow improved (weapon-first + next-slot highlight); further polish optional

\- Crafting District: recipes / loop depth still M1-limited

\- Hunt / void field: realtime and shell combat need ongoing parity and clarity

\- Mobile / z-index regressions: verify after each home change (resource strip vs cinematic)



\---



\## 10-Step Upgrade Plan (Execution Order)



Each step is one bounded session. Steps 1-2 are complete. Steps 3-10 remain.



\### DONE — Step 1: Session auth persistence

Cookie-based auth in middleware.ts. Hard nav keeps session. VERIFIED LIVE.



\### DONE — Step 2: Condition recovery wiring

Moss Ration recipe (50 credits + 10 bioSamples), Emergency Ration action (USE\_EMERGENCY\_RATION), recovery prompts wired. NEEDS TUNING: Emergency Ration should bypass recovery cooldown.



\### SUPERSEDED — Step 3: Homepage layout (was LeftCommandMenu stack)

\- Original targets pointed at `components/layout/LeftCommandMenu.tsx` + old `HomeShell` — removed.

\- Current work: `components/layout/GameHudShell.tsx`, `components/home/HomeHudClient.tsx`, `config/layout.ts`, `HomeResourceStrip`, bottom nav safe areas.

\- Gate: identity / pressure / next action readable; no clipped nav on mobile and desktop.



\### Step 4: Inventory capacity enforcement (HIGH)

\- Create `features/resources/inventoryLogic.ts` with checkCapacity(), enforceCapacity(), getOverflowPenalty()

\- Show OVERLOADED warning when capacity > max

\- Add Sell Surplus (links to Market) and Discard buttons

\- Block new pickups when overloaded

\- Files: `features/resources/inventoryLogic.ts`, `components/inventory/StorageOverview.tsx`

\- Gate: over max shows red warning + penalties on inventory, Home resource strip, Home mission panel, and full Missions screen; pickups blocked when overloaded (`enforcePickup`)



\### Step 5: Loadout equip flow (HIGH)

\- Create `features/player/loadoutState.ts` with slots: weapon/armor/core/runeSet/professionBind

\- equipItem(slot, itemId) moves from inventory to slot; unequipItem returns to inventory

\- Build loadout screen with slot cards and ItemPicker modal

\- Files: `features/player/loadoutState.ts`, `app/loadout/page.tsx`, `components/shared/ItemPicker.tsx`

\- Gate: Mirefang Sidearm equippable from inventory to weapon slot



\### Step 6: Black Market buy/sell (MEDIUM)

\- Create `features/market/marketData.ts` with 10+ listings (weapons, armor, consumables, materials)

\- Create `features/market/marketActions.ts` with buyItem() and sellItem() (10% tax on sells)

\- Build War Exchange screen with listing grid, Buy/Sell tabs, confirmation modal

\- Files: `features/market/marketData.ts`, `features/market/marketActions.ts`, `app/bazaar/war-exchange/page.tsx`

\- Gate: Player can buy Field Med Patch, credits decrease, item appears in inventory



\### Step 7: Mission execution + rewards (MEDIUM)

\- Create `features/missions/missionRunner.ts` with queueMission(), onMissionComplete(), getMissionStatus()

\- Build MissionTimer (live countdown) and MissionResult (reward breakdown card)

\- Rewards distribute to playerState on completion (XP, credits, materials, condition cost)

\- Files: `features/missions/missionRunner.ts`, `components/missions/MissionTimer.tsx`, `components/missions/MissionResult.tsx`

\- Gate: Queue Scavenge the Outer Wastes → 10s countdown → +25 XP, +60 Credits, -8 Condition



\### Step 8: New Game onboarding (MEDIUM)

\- Build multi-step wizard: name entry → school lean → career focus → confirmation

\- Create `features/player/playerFactory.ts` with createNewPlayer(name, school, career)

\- Starter state: Puppy rank, condition 100%, 500 credits, 20 Iron Ore, 10 Bio Samples, 2 Moss Rations

\- Files: `app/new-game/page.tsx`, `features/player/playerFactory.ts`, `components/onboarding/SchoolSelector.tsx`

\- Gate: NEW GAME → enter name → select Bio → land on homepage with fresh Puppy state



\### Step 9: Crafting recipes (MEDIUM)

\- Define 5+ recipes in `features/crafting/recipeData.ts`: Moss Ration, Scrap Blade, Bone Plating, Rune Sigil, Bio Serum

\- Create `features/crafting/craftActions.ts` with craftItem() — checks materials, deducts, rolls success, adds output

\- Build Crafting District page with category tabs, recipe cards, material cost display

\- Files: `features/crafting/recipeData.ts`, `features/crafting/craftActions.ts`, `app/bazaar/crafting-district/page.tsx`

\- Gate: Craft Moss Ration → Bio Samples and credits decrease, Moss Rations increase



\### Step 10: Hunt encounter + result screen (MEDIUM)

\- Define 5+ creatures in `features/combat/creatureData.ts`: Rustfang, Hollowed Drone, Spore Crawler, Scrap Sentinel, Void Wisp

\- Create `features/combat/encounterEngine.ts` with resolveEncounter() — outcome based on condition + loadout

\- Build hunt screen with creature display, auto-resolve combat, loot breakdown

\- Files: `features/combat/creatureData.ts`, `features/combat/encounterEngine.ts`, `app/hunt/page.tsx`, `components/hunt/HuntResult.tsx`

\- Gate: Deploy → fight Rustfang → Victory → +15 XP, +3 Iron Ore, -5 Condition → return to homepage



\---



\## M1–M7 Roadmap (Long-Term)



\### M1: Foundation Slice (Steps 1–10 above)

A new player can create a character, hunt, loot, craft, equip, buy, run missions, and recover condition.

\*\*Success test:\*\* A Puppy understands the fantasy and wants to return.



\### M2: Black Market Depth

\- Crafting District utility: Moss Binder, Refinery Bay, Rune Crafter output

\- Progression/crafting priority: survival buffers first, stabilizing wards second

\- Character portrait UI consistency across hub/HUD

\- War Exchange depth: 4 commodity categories, dynamic pricing seeds

\*\*Success test:\*\* A crafter has real choices and real outputs.



\### M3: Progression Depth

\- Mastery tree becomes interactive (spend mastery points, unlock nodes)

\- First profession trees wired (Combat → Blood Hunter/Marksman, Gathering → Beast Hunter/Bio Harvester)

\- Corruption and consequence system: Void Pressure, Mutation Instability

\- Path-specific visual identity on Character screen

\*\*Success test:\*\* Growth feels meaningful, not cosmetic. Schools feel different.



\### M4: Tactical Encounter Layer

\- Loadout bonuses affect combat outcomes

\- 3+ enemy tiers with distinct behaviors and loot tables

\- Hollowfang as first flagship boss (economy-spiking prestige challenge)

\- Risk-reward: better loot zones cost more condition

\*\*Success test:\*\* Preparation matters and combat has texture.



\### M5: Faction War Layer

\- Contested zones with faction influence mechanics

\- School pressure: Bio/Mecha/Pure alignment affects available missions and rewards

\- Regional war stakes tied to mission board

\- Faction reputation unlocks school-specific gear and crafting recipes

\*\*Success test:\*\* The world feels alive and larger than the individual player.



\### M6: Mythic Progression

\- Rune Crafter prestige line (Level 5 Saint Rune = title earned)

\- Rune Knight ascent path (elite wartime power class)

\- Rare material economy: Bloodvein, Ironheart, Ashveil, Meldheart

\- Story arc reveals (Chapter 2+)

\*\*Success test:\*\* Late-game identity feels mythic, not just bigger numbers.



\### M7: Social Layer

\- Guilds with contribution systems and shared contracts

\- Rankings and seasonal competitive structure

\- Server-authoritative multiplayer (transition from client-only state)

\- Campaign participation and guild-vs-guild operations

\*\*Success test:\*\* Players gain routine, rivalry, and belonging.



\---



\## Architecture Rules



\### Code Structure

\- `app/` = thin route wrappers only (page.tsx files stay under 50 lines)

\- `components/` = presentation and composition (no business logic)

\- `features/` = logic, data, helpers, state management

\- `data/` = static game data (items, creatures, recipes, missions)

\- `lib/` = utilities, shared helpers

\- `store/` = global state management

\- `types/` = shared TypeScript types

\- `public/assets/` = production-ready images and icons



\### Principles

\- Avoid god files — split when a file exceeds 200 lines

\- One approved task at a time

\- No unrelated edits in any PR

\- Extend existing systems before inventing new ones

\- Pages stay thin, shared UI stays reusable

\- Navigation logic belongs in data/config files, not view components

\- Data-driven UI: bottomNavData.ts, homeMenuData.ts pattern for all nav



\### State Management

\- Player state lives in `features/player/playerState.ts` with reducer pattern

\- Resources tracked in `features/resources/` — every resource has a key, display name, icon, and category

\- Game actions dispatched through `features/game/gameActions.ts`

\- All state changes must be traceable (action type → reducer → new state)



\## Asset Pipeline



\- `/incoming` = raw source only — never use in production

\- Rename every asset clearly before moving to production

\- Move to `/public/assets/{category}/` (home, icons, creatures, items, etc.)

\- Split sprite sheets when practical

\- Register asset paths in `lib/assets.ts`

\- No important text baked into icons or images



\## Resource Keys (Canonical)



\### Survival

credits, mossRations, organicMatter, water, restSupplies



\### Bio Evolution

bloodShards, predatorMarrow, mutagenicTissue, bioSamples



\### Mecha Evolution

coreFragments, alloyPlates, energyCells, emberCore



\### Spirit Evolution

soulEmbers, memoryAsh, sigilDust, runeDust



\### Shared Crafting

bone, scrapMetal, relicShards, fiberHide, ironOre, scrapAlloy



\### Market

blackCredits, infamy, contractSeals



\### Forbidden (late-game)

voidResidue, trinityFragments, heartcores



\### Apex Materials (event/prestige only)

bloodvein, ironheart, ashveil, meldheart



\---



\## Worker Roles



\### Claude (Orchestrator / Planner)

Plans sessions, writes forge logs, designs systems, generates Cursor prompts, reviews architecture, maintains canon alignment. Does not write production code directly — generates specifications and prompts for workers.



\### Codex

Implements approved bounded tasks only. Must return: exact files changed, validations (tsc + lint), scope decision, and what changed. Async execution — can work on background tasks (test suites, type coverage, documentation).



\### Cursor

Applies local edits, testing, and repo-aware iteration. Receives Cursor prompts from Claude. Has full codebase context. Does not decide roadmap — executes approved steps.



\### ChatGPT

Art direction and image generation. Generates concept art, UI mockups, icons, creature designs, world art. Every image must match: cyberpunk + dark fantasy + Black Market survival tone.



\### Claude Code (when active)

Terminal-native agent for multi-file refactors, test generation, and architectural changes. Can spawn subagents for parallel work. Reads CLAUDE.md for project context.



\---



\## Required Task Return Format



Every worker must return:



1\. \*\*Role Summary\*\* — who did what

2\. \*\*Task Classification\*\* — which Step (1-10) or Milestone (M1-M7) this serves

3\. \*\*Exact Files Changed\*\* — full paths, no ambiguity

4\. \*\*Scope Decision\*\* — what was included, what was explicitly excluded

5\. \*\*What Changed\*\* — plain English description of logic changes

6\. \*\*Validation\*\* — `npx tsc --noEmit` pass + `npm run lint` pass (both required)

7\. \*\*Known Issues\*\* — anything that needs follow-up in next session



\---



\## Guardrails and Hard Truths



\- Do not let crafting become generic side content

\- The homepage is the style law for the rest of the game

\- Graphics first, structure second, functionality third

\- Every session ends with: what was finished, what is still broken, and the exact next task



\---



\## Session Protocol



1\. Identify the current active step from the 10-Step Plan

2\. Confirm what was completed in the last session

3\. Execute exactly one step per session (no jumping ahead)

4\. Validate: `npx tsc --noEmit` + `npm run lint`

5\. Push to GitHub → Vercel auto-deploys

6\. Record: what was finished, what is still broken, what is the exact next task

7\. Update this file's "Live Audit Status" section if any status changed



\---



\## Current Active Step



\*\*Step 3: Homepage layout fix\*\*



Next worker should: Move HomeResourceStrip to bottom position, fix z-index, fix left nav overflow.



\---



\## Canon Voice Reference



All player-facing text should match Black Market survival tone:

\- "Nobody survives the field empty-handed. The Market knows who came prepared."

\- "Rank is earned in blood, scrap, and proof. The city watches."

\- "No one in the Black Market stays alive for free."

\- "The first mistake is important. It should become the seed of identity."

\- "Returning players should experience a recovery arc, not a punishment screen."

