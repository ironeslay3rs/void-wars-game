# Void Wars: Oblivion — System Backlog

Generated from canon vault audit (Pass 7). Cross-references `lore-canon/` against implemented systems.

## Vault-Defined Systems NOT Yet Implemented

### P1 — Critical (Core Loop Gaps)

#### The Chronicle System
- **Vault Source:** Book 04 canon extraction — "Game-like structures introduced within reality. Access to power controlled through Chronicle system."
- **Description:** A structured progression framework that governs how the player accesses and advances through power systems. The Chronicle is the canonical "progression spine" — it replaces our ad-hoc rank/mastery/mythic ladder with a single unified structure.
- **Dependencies:** Rank system, mastery system, mythic ascension
- **Estimated Scope:** Large — requires rethinking progression UI and data model
- **Status:** No implementation. Our current rank/mastery ladder is a functional equivalent but not canon-named.

#### Canonical Currency System
- **Vault Source:** 01 Master Canon — Economy/Currencies
- **Description:** The vault defines four currencies: Ichor (Bio), Soul Crystals (Pure), Sinful Coin (Black Market), and Ironheart-linked materials (Mecha). Our game uses ResourceKey types (credits, bioSamples, runeDust, etc.) which map imperfectly. Pass 7 updated display names but the underlying economy isn't structured around the canonical four-currency model.
- **Dependencies:** Economy reducer, War Exchange, resource system
- **Estimated Scope:** Medium — display names updated, but economy logic may need restructuring
- **Status:** Display names partially fixed (Pass 7). Economy logic unchanged.

#### Mana System
- **Vault Source:** 01 Master Canon — Mana System; Book 02 canon extraction
- **Description:** Core universal force tied to law, memory, power, adaptation. Behaves differently inside vs outside the Void. Can be learned, inherited, stolen, refined, or grown. Not yet represented in game systems.
- **Dependencies:** Rune system, school progression
- **Estimated Scope:** Large — new game mechanic
- **Status:** No implementation. Rune system exists but mana as a resource/mechanic does not.

### P2 — High (Identity & Feel Gaps)

#### Blackcity Entry Experience
- **Vault Source:** Book 04 — "Entry into Black Market/Blackcity"
- **Description:** "Blackcity" is the canonical name for the Black Market entry point. The onboarding should reference this. The first-time experience of entering Blackcity could be a stronger narrative moment.
- **Dependencies:** Onboarding flow (puppyOnboardingData.ts)
- **Estimated Scope:** Small — naming update + narrative enhancement
- **Status:** We use "Black Market" everywhere. "Blackcity" is never referenced.

#### Ember Vault as Canonical Location
- **Vault Source:** Book 04 — "Ember Vault (market location)"
- **Description:** The Ember Vault is not just a school name — it's a canonical market location within Blackcity. Our "Pure Enclave" district may need to be renamed or repositioned.
- **Dependencies:** District data, Pure school references
- **Estimated Scope:** Small — naming/lore update
- **Status:** We use "Pure Enclave" as a district. Vault says "Ember Vault" is a market location.

#### Sin Institution System
- **Vault Source:** 01 Master Canon — Seven Capital Sins
- **Description:** Each sin has an "institution" (organization) — not just a lane/district. The vault has a template for sin institutions but names are not yet assigned. This is a deeper layer than just the 7 sin lanes we have.
- **Dependencies:** District data, faction system
- **Estimated Scope:** Medium — define institution identities, wire into faction pressure
- **Status:** We have sin lanes (districts). Institutions as organizations don't exist.

#### Rune Level Visual Distinction
- **Vault Source:** 07 Art Bible — Rune Visual Language
- **Description:** Runes should have visual distinction by level (L1-L6+). Shape language, engraving style, material embedding, body placement, container placement. Currently our mastery UI shows depth numbers but no visual rune identity.
- **Dependencies:** Mastery UI, rune install flow
- **Estimated Scope:** Medium — visual design + component work
- **Status:** No visual rune assets or level-based styling.

### P3 — Medium (Expansion Readiness)

#### Pantheon System
- **Vault Source:** 01 Master Canon — Pantheon Structure
- **Description:** Pantheons are "shattered remnants of older divine civilizations." 7 pantheons (Norse, Greek, Canaanite, Inca, Hindu, Egyptian, Chinese) each connect to nations and schools. This is deeper than our nation system — pantheons are theological/mythological layers.
- **Dependencies:** Nation data, faction system
- **Estimated Scope:** Medium — data model + narrative integration
- **Status:** Nations exist but pantheons as a distinct concept do not.

#### Hearts vs Spades (Faction Testing)
- **Vault Source:** Book 05 — "Hearts vs Spades faction testing scenarios"
- **Description:** Structured faction testing system from the war arc. Victory conditions are not always permanent. This could become a PvP/guild mechanic.
- **Dependencies:** Arena system, faction system, guild system
- **Estimated Scope:** Large — new game mode
- **Status:** No implementation.

#### Three Empires as Distinct Entities
- **Vault Source:** 01 Master Canon — Three Empires; Book 05
- **Description:** The three empires (Bio, Mecha, Pure) are civilizational bodies larger than individual schools. Each has its own economy, military, and political structure. Our game treats schools as paths — empires as geopolitical entities are not represented.
- **Dependencies:** Faction system, world simulation
- **Estimated Scope:** Large — world-building layer
- **Status:** Schools exist. Empires as geopolitical entities do not.

### P4 — Low (Late-Game / Beyond Book 1)

#### Sevenfold Convergence Mechanics
- **Vault Source:** Book 06 — Fusion Truth
- **Description:** Full fusion mechanics for Body + Mind + Soul convergence. Currently we seed hidden tracking (crossSchoolExposure) but the actual convergence gameplay is not designed.
- **Dependencies:** All three school systems, mastery, mythic ascension
- **Estimated Scope:** Large — endgame system
- **Status:** Data seed exists (Pass 3). No gameplay mechanics.

#### Beyond the Void
- **Vault Source:** Book 07 — Escape
- **Description:** Post-escape world, new rules, legacy systems. Way beyond current scope.
- **Dependencies:** Everything
- **Estimated Scope:** Massive — expansion-level
- **Status:** No implementation. Not needed for Book 1.

#### Legacy / Child System
- **Vault Source:** Book 07 — "Child represents new form of existence"
- **Description:** Next-generation character system. Book 7 content.
- **Dependencies:** Everything
- **Estimated Scope:** Massive
- **Status:** No implementation.

---

## Implemented Systems — Canon Compliance Status

| System | Canon Status | Notes |
|--------|-------------|-------|
| Three Schools (Bio/Mecha/Pure) | CANONICAL | Names confirmed in vault |
| Black Market / 7 Sin Lanes | CANONICAL | Lane names confirmed exactly |
| Rune System (L1-L7 depth) | PARTIALLY CANONICAL | Vault defines L1-L6+ levels; our L7 cap is game-specific |
| Convergence (hidden seed) | CANONICAL APPROACH | Book 6 revelation; hidden tracking correct |
| Ironheart material | CANONICAL | Confirmed in vault 07 Art Bible |
| Currency display names | FIXED IN PASS 7 | Sinful Coin, Ichor, Soul Crystals now canon-sourced |
| Nation-Sin-School mapping | GAME-SPECIFIC | Vault has template only; our assignments are design choices |
| Doctrine milestones | GAME-SPECIFIC | No vault source for specific doctrine names |
| NPC brokers | GAME-SPECIFIC | No canonical NPCs except "Iron" (protagonist) |
| "Puppy" terminology | GAME-SPECIFIC | Not found in vault |
| Canon quotes | GAME-SPECIFIC | Not from the books; game-created flavor text |

---

## Locked Rules Compliance Report

| Locked Rule | Status | Details |
|-------------|--------|---------|
| Lore core always wins over code | COMPLIANT | Architecture separates lore data from logic |
| Do not let borrowed systems erase Void Wars identity | COMPLIANT | Overmortal/AFK Journey used as structure only |
| Void Wars canon overrides all influence | COMPLIANT | Pass 7 added canon status to all files |
| Clean modular layered architecture | COMPLIANT | Thin pages, features/, components/, shared/ |
| This is NOT the card game / browser game / PvP fighter | COMPLIANT | App-first RPG, no card mechanics |
| Each medium keeps own execution logic | COMPLIANT | All game logic in features/game/ |
| Core canon truths cannot be adapted | COMPLIANT | Schools, sins, Black Market structure all canonical |
| Adaptations must not betray core truth | COMPLIANT | Hidden convergence, survival pressure, school identity preserved |
