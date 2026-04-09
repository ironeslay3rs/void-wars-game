# Big Plan — The Open World Awakens

**Status:** Active design pass (started 2026-04-09)
**Supersedes:** `docs/world-expansion-plan.md` (outdated — references "Spirit" school + flat 3-path model)
**Companion docs:** `docs/7-school-gameplay-spine.md` (canonical mapping), `docs/black-market-law.md` (sin lane registry), `lore-canon/01 Master Canon/`

---

## The vision in one sentence

> Reveal the canonical three-layer world structure (3 empires → 7 schools → 7 black market lanes) as the spine of every interaction, so players actually see and traverse the world the lore promises.

## Why now

Audit on 2026-04-09 confirmed the game's biggest game-feel gap is **identity**. Canon defines a rich three-layer structure but the game shows a flat three-school surface:

| Canon layer | Status before this plan |
|---|---|
| 3 Empires (Bio / Mecha / Pure as civilizational bodies) | Conflated with "schools as paths" — one HQ each at `/bazaar/faction-hqs` |
| **7 Schools (per-nation institutions tied to sin × empire)** | **Missing — exist only as numeric zone doctrine pressure** |
| 7 Black Market Lanes (shadow survivor venues) | All present at `/bazaar/black-market/*` |

The shadow half is built. The open half is invisible. Players walk into the Arena of Blood (Wrath shadow) and never learn the Bonehowl of Fenrir (Wrath open) exists. The world feels half-built because it *is* half-built.

## The four design pillars

1. **Dual face.** Every sin has a public school AND a shadow lane. Both are walkable. Visiting one always shows the other.
2. **Empire scale.** Three empires are *parents* to seven schools. Doctrine pressure rolls up from zone → school → empire. Players can read the world at any zoom level.
3. **Origin truth.** Every mission, material, and broker has a real home in the world. Mission origin tags resolve to school HQs. Brokers carry a school affinity. Materials trace to their source nation.
4. **First-session clarity.** A new player understands the three-layer structure within 60 seconds of `/new-game`. Onboarding briefs the dual face explicitly.

## Canonical data — the seven schools

Source: `docs/7-school-gameplay-spine.md` cross-checked against `lore-canon/01 Master Canon/`.

| Sin | School (open face) | Nation | Pantheon | Empire | Lane (shadow face) | Pressure identity | Countermeasure style |
|---|---|---|---|---|---|---|---|
| Wrath | Bonehowl of Fenrir | Norway | Norse | Bio | Arena of Blood | Escalation | Burst sustain + disengage |
| Gluttony | Mouth of Inti | Peru | Inca | Pure/Rune | Feast Hall | Consumption | Efficiency + conversion |
| Envy | Flesh Thrones of Olympus | Greece | Greek | Bio | Mirror House | Comparison | Modular swap kits |
| Lust | Crimson Altars of Astarte | Lebanon | Canaanite | Bio | Velvet Den | Temptation | Cleansing + boon mgmt |
| Greed | Thousand Hands of Vishrava | India | Hindu | Pure/Rune | Golden Bazaar | Hoarding | Compression + asset protect |
| Pride | Divine Pharos of Ra | Egypt | Egyptian | Mecha | Ivory Tower | Exposure | Shielding + anti-mark |
| Sloth | Clockwork Mandate of Heaven | China | Chinese | Mecha | Silent Garden | Delay | Tempo restoration |

## Phased implementation

Each phase ships independently. Each phase typechecks. Each phase is one commit.

### Phase 1 — Data foundation
**Goal:** Schools and empires exist as first-class data, with selectors that resolve player affinity, zone presence, and lane pairing.

- `features/empires/empireTypes.ts` — `EmpireId`, `Empire` shape
- `features/empires/empireData.ts` — 3 empires (bio, mecha, pure) with philosophy + child school list + accent color
- `features/empires/empireSelectors.ts` — `getEmpireById`, `getEmpireForSchool`, `getEmpireForPlayerAlignment`
- `features/schools/schoolTypes.ts` — `SchoolId`, `School` shape, `PressureIdentity`, `CountermeasureStyle`
- `features/schools/schoolData.ts` — 7 schools with full canon metadata
- `features/schools/schoolSelectors.ts` — `getSchoolById`, `getSchoolsByEmpire`, `getSchoolForLane`, `getSchoolForOriginTag`, `getSchoolForZone`, `getSchoolsForPlayer`
- `features/schools/schoolSelectors.test.ts` — round-trip tests for all selectors
- `features/empires/empireSelectors.test.ts` — round-trip tests

**Acceptance:** All seven schools + three empires exist as data. Lane→school, originTag→school, zone→school resolve cleanly. No reducer changes — pure data + selectors.

### Phase 2 — Routes
**Goal:** Players can navigate to `/empires` and `/schools` and see the world's structure.

- `app/empires/page.tsx` — index showing 3 empires + child schools
- `app/empires/[empireId]/page.tsx` — empire detail (philosophy, schools, current pressure)
- `app/schools/page.tsx` — index of all 7 schools grouped by empire
- `app/schools/[schoolId]/page.tsx` — school HQ (lore, sin, lane, doctrine pressure, brokers)
- `components/empires/EmpireOverviewCard.tsx`, `EmpireDetailScreen.tsx`
- `components/schools/SchoolListCard.tsx`, `SchoolHqScreen.tsx`
- Navigation entries in `features/navigation/navigationData.ts`
- Bazaar map node addition (optional — only if it doesn't crowd the layout)

**Acceptance:** All 10 new routes render. Each empire links to its 2-3 child schools. Each school HQ shows its sin, lane pairing, and current zone presence.

### Phase 3 — Dual-face cross-links
**Goal:** Walking the shadow always reveals the open. Walking the open always reveals the shadow.

- Each black market lane screen header gets a `Visit the open face → [School Name]` link (Arena, Ivory Tower, Mirror House, Silent Garden, Velvet Den, Golden Bazaar, Feast Hall)
- Each school HQ screen gets a `Visit the shadow face → [Lane Name]` link
- `BlackMarketMap` shows each lane's open-face school name as a subtitle
- `BrokerCard` shows broker's school affinity if known

**Acceptance:** From any sin lane, the player can reach the open school in one click and back. The dual face is unmissable.

### Phase 4 — Mission origin resolution
**Goal:** Every mission's origin tag resolves to a real school in the UI.

- `MissionOriginBadge` becomes clickable; clicks navigate to the origin school HQ
- Mission detail / mission card shows `From the [School Name] in [Nation]`
- `missionsScreenData` enriches each mission with resolved school metadata

**Acceptance:** Players see `bonehowl-remnant` rendered as `Bonehowl of Fenrir — Norway` and can click through to the school HQ.

### Phase 5 — Doctrine pressure surfaces school names
**Goal:** The numeric `bio: 34, mecha: 33, pure: 33` doctrine pressure renames into school identity strings.

- `ZoneDoctrinePressureCard` (or equivalent) renders empire pressure as `held by [dominant empire] — [dominant school in that empire]`
- Faction screen shows empires → schools → zones hierarchy
- Mission panel headline: `This region answers to the [School Name]`

**Acceptance:** Players can read any zone and immediately know which empire + school holds it. Pressure is no longer abstract numbers.

### Phase 6 (deferred) — First-session school affinity
**Out of scope for the first implementation pass.** Touches the sensitive `/new-game` flow that was just refreshed in M2 commit `5b038c1`. Will be added once Phases 1-5 prove the data shape is right.

### Phase 7 (deferred) — Convergence wire-up
**The natural payoff.** Once players have walked all 7 schools and dabbled across multiple empires, the hidden `crossSchoolExposure` seed (already in state shape from M2 commit `bea5396`) starts firing anomaly toasts and culminates in the Book 6 fusion reveal. Pre-requisite for this is having the schools to expose to.

### Phase 8 (parallel track) — Realtime mob loot parity
**Separate technical track.** Deferred from previous M3 because identity > parity for player-facing impact. The realtime infra work doesn't block any of Phases 1-7 and can be done in parallel.

## Out of scope for this entire pass

- New combat mechanics
- New monetization
- Currency restructure (Sinful Coin / Ichor / Soul Crystals / Ironheart canon — separate concern, separate pass)
- Pantheon system (P3 in `VOID_WARS_SYSTEM_BACKLOG.md`)
- Mana mechanic (P1 in `VOID_WARS_SYSTEM_BACKLOG.md`)
- Realtime infrastructure changes
- Save migration
- New art assets
- Hearts vs Spades faction testing PvP

## Why this order is right

1. **Data first** because nothing else can be built on shifting ground.
2. **Routes before cross-links** because cross-links need destinations to point to.
3. **Cross-links before mission resolution** because mission resolution links to schools that must exist first.
4. **Doctrine UI last** because it consumes everything above and is the highest-visibility surface.

A professional designer ships a vertical slice that proves the structure works end-to-end before broadening. This plan does that — every phase delivers something playable. Phases 1-3 alone would be a complete identity pass. Phases 4-5 are the polish that elevates it from "structure visible" to "structure felt".

## Success criteria for the whole pass

A player who has never read the lore can:

1. Open `/empires` and immediately understand there are 3 empires
2. Click any empire and see its 2-3 child schools
3. Open `/schools` and see all 7 schools organized by empire
4. Click any school and see its sin, nation, lane pairing, and current pressure
5. Walk into any black market lane and click through to the open-face school
6. See any mission's origin tag resolve to a real school name with one click
7. Read any zone's doctrine pressure as a school name, not a percentage triplet

When all seven are true, the open world has awakened.
