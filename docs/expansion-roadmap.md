# Void Wars Expansion Roadmap

## Purpose
This roadmap exists to keep project planning practical for game development without drifting from locked canon.

The repository may not contain the full lore manuscripts, but that does not authorize a rewrite of series structure. For planning purposes, the game must follow the canon seven-book spine.

## Locked Canon Expansion Order
The expansion ladder is fixed to the seven-book series order.

| Expansion rung | Canon source | Planning rule |
| --- | --- | --- |
| Expansion 1 | Book 1 | Base game and first live content layer must map here. |
| Expansion 2 | Book 2 | May build only after Book 1 coverage is structurally supported. |
| Expansion 3 | Book 3 | Must remain downstream of Books 1-2 content dependencies. |
| Expansion 4 | Book 4 | Cannot be used to replace or compress earlier canon beats. |
| Expansion 5 | Book 5 | Must stay in fifth position; do not treat this as a finale arc. |
| Expansion 6 | Book 6 | Reserved for sixth-position canon material only. |
| Expansion 7 | Book 7 | Reserved for end-of-series expansion planning. |

### Canon rules
- Do not collapse the franchise into a five-book arc.
- Do not promote later-series material ahead of earlier books for roadmap convenience.
- Do not invent substitute lore to fill gaps caused by missing repo manuscripts.
- If detailed lore references are unavailable, keep plans abstract at the `Book 1` through `Book 7` level rather than fabricating specifics.

## Current Repo Implementation State
The current repository is best understood as a systems-first prototype with broad UI coverage and partial gameplay scaffolding.

### What is already implemented at a practical level
- App routes and screen shells for home, missions, status, career, factions, professions, mastery, guild, inventory, arena, and bazaar districts.
- Shared layout components for HUD framing, menus, bars, and screen panels.
- Game state scaffolding for player resources, progression, persistence, feedback, and mission handling.
- Supporting feature data for navigation, characters, factions, exploration, combat, inventory, and district screens.

### What the repo does not currently prove
- Full canon-story implementation for any complete book.
- Authoritative lore sequencing derived from manuscripts.
- A validated content-to-book tagging system across all features.
- End-to-end expansion gating tied to the seven-book canon ladder.

### Planning implication
The repo is strong enough to support expansion preparation, but it should not be mistaken for a canon-complete content map. Development plans must distinguish between implemented systems, placeholder content or UI coverage, and canon-locked expansion sequencing.

## Roadmap Principles
- Documentation and canon alignment come before large content expansion.
- Core loop support comes before side systems.
- Each expansion should strengthen survival, preparation, forging, faction war, and breakthrough pressure.
- Avoid broadening scope with disconnected lore drops or oversized economy layers.
- Future roadmap, README, milestone, and implementation docs should state the canon book rung, the current codebase support level, the recommended milestone, and avoid unconfirmed lore detail.

## Phase 0: Canon Foundation
Goal: make future work safe and consistent.

- Maintain `docs/game-canon-registry.md` as the root canon index.
- Keep Black Market, faction presentation, and roadmap docs aligned.
- Require future tasks to separate locked canon from implementation choices.
- Introduce or maintain a lightweight content-tagging layer for `Book 1` through `Book 7` plus `Unassigned / system-only`.

## Phase 1: Canon-safe Foundation Hardening
Goal: stabilize the reusable systems that every book depends on.

Focus areas:
- Progression gates.
- Route unlock logic.
- Mission and reward loops.
- Inventory and resource rules.
- Combat and exploration scaffolding.
- Save/load and persistence behaviors.

Do not do yet:
- Massive new currencies.
- Broad collectible systems with weak gameplay purpose.
- Lore-heavy side arcs that bypass Iron's spine and the war loop.

## Phase 2: Citadel and Core Loop Cohesion
Goal: align hub systems with the project thesis and make Book 1 support load-bearing.

Focus areas:
- Preparation and loadout decision points.
- Scar, salvage, and extraction framing.
- Forging and rune-smithing support loops.
- Citadel roles tied to survival rather than menu bloat.
- Book 1-facing navigation and progression gates that do not bypass earlier canon structure.

## Phase 3: Rune Infrastructure
Goal: make power progression readable and canon-compliant.

Focus areas:
- Rune levels 1 to 7 as a visible progression law.
- Saint Rune recognition at Level 5.
- Rune Knight and Rune-Smith identity in systems and UI.
- Clear guardrails that Level 7 cannot be forged inside the Void.

Flexible implementation examples:
- Unlock pacing.
- Recipe exposure.
- UI explanation depth.
- Which professions surface first.

## Phase 4: Faction Identity and War Pressure
Goal: strengthen the three macro schools and seven sin-aligned powers without canon drift.

Focus areas:
- Strong faction differentiation in visuals, tone, and strategic pressure.
- Clear ties between nations, sins, schools, and seats of power.
- Pride and Sloth presence as major ruling forces.
- Book-appropriate hooks that remain downstream of the seven-book order.

Do not do yet:
- Full geopolitical rewrites.
- New nations, sins, or macro schools.
- Contradictory faction fantasy mixing that blurs Bio, Mecha, and Pure.

## Phase 5: Character Spine Integration
Goal: connect story-facing systems to the locked cast spine before scaling narrative volume.

Focus areas:
- Iron as the central player-facing spine.
- Richard as a rune-smith mentor anchor.
- Erick as Black Market connective tissue.
- Long-arc support for sisters, rivals, Blood Curse / Lineage Plunder, and Rune Knights.

Constraint:
- Add structure and hooks before adding high-volume narrative content.

## Phase 6: Controlled Content Growth
Goal: expand missions, rulers, factions, and front-line variation without canon drift.

Safe expansion examples:
- New mission chains tied to existing powers.
- Additional forging, extraction, and front-line pressures.
- More lane-specific Black Market content.
- More factional presentation assets under the visual law.

Unsafe expansion examples:
- Reward-first feature sprawl.
- Gacha-like monetization patterns.
- Lore additions that redefine the Void, humanity, or the final path.
- Compressing multiple books into one roadmap slot for implementation convenience.

## Development Sequence Aligned to Canon
Recommended shipping order:

1. Base game / Expansion 1 support for Book 1.
2. Expansion 2 support for Book 2.
3. Expansion 3 support for Book 3.
4. Expansion 4 support for Book 4.
5. Expansion 5 support for Book 5.
6. Expansion 6 support for Book 6.
7. Expansion 7 support for Book 7.

## Release Criteria for Each Expansion Rung
Each expansion rung should be considered ready only when it has:

- A clearly identified canonical book source.
- Progression gates that do not bypass earlier books.
- UI and navigation exposure that reflects unlocked state.
- Mission and content hooks tied to the correct book rung.
- Save-state compatibility for players moving from one rung to the next.

## Decision Filter
Before approving a future feature, ask:

1. Does it support the core loop?
2. Does it preserve locked canon?
3. Does it stay inside the seven-book expansion order?
4. Does it avoid menu and currency sprawl?
5. Does it strengthen war-scarred survival and ascension-through-consequence?
6. Can it ship without redesigning the game?
