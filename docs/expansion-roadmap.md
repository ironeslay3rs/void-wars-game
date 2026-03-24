# Void Wars Expansion Roadmap

## Purpose

This document exists to keep project planning practical for game development **without drifting from locked canon**.

The repository may not contain the full lore manuscripts, but that does **not** authorize a rewrite of series structure. For planning purposes, the game must follow the canon seven-book spine.

---

## 1. Locked Canon Expansion Order

The expansion ladder is fixed to the **seven-book** series order.

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

- Do **not** collapse the franchise into a five-book arc.
- Do **not** promote later-series material ahead of earlier books for roadmap convenience.
- Do **not** invent substitute lore to fill gaps caused by missing repo manuscripts.
- If detailed lore references are unavailable, keep plans abstract at the **Book 1 / Book 2 / ... / Book 7** level rather than fabricating specifics.

---

## 2. Current Repo Implementation State

The current repository is best understood as a **systems-first prototype** with broad UI coverage and partial gameplay scaffolding.

### What is already implemented at a practical level

- app routes and screen shells for home, missions, status, career, factions, professions, mastery, guild, inventory, arena, and bazaar districts
- shared layout components for HUD framing, menus, bars, and screen panels
- game state scaffolding for player resources, progression, persistence, feedback, and mission handling
- supporting feature data for navigation, characters, factions, exploration, combat, inventory, and district screens

### What the repo does **not** currently prove

- full canon-story implementation for any complete book
- authoritative lore sequencing derived from manuscripts
- a validated content-to-book tagging system across all features
- end-to-end expansion gating tied to the seven-book canon ladder

### Planning implication

The repo is strong enough to support expansion preparation, but it should not be mistaken for a canon-complete content map. Development plans must therefore distinguish between:

- **implemented systems**
- **placeholder content or UI coverage**
- **canon-locked expansion sequencing**

---

## 3. Recommended Development Order

To keep delivery practical **and** canon-safe, use the following order.

### Phase A — Canon-safe foundation hardening

Before adding new expansion claims, stabilize the reusable systems already in the repo:

- progression gates
- route unlock logic
- mission/reward loops
- inventory and resource rules
- combat and exploration scaffolding
- save/load and persistence behaviors

This work is canon-neutral and lowers risk for all seven books.

### Phase B — Book-by-book content tagging

Introduce a lightweight planning layer that labels game content by canon source:

- `Book 1`
- `Book 2`
- `Book 3`
- `Book 4`
- `Book 5`
- `Book 6`
- `Book 7`
- `Unassigned / system-only`

This lets the team organize implementation without inventing missing lore.

### Phase C — Development sequence aligned to canon

Recommended shipping order:

1. **Base game / Expansion 1 support for Book 1**
2. **Expansion 2 support for Book 2**
3. **Expansion 3 support for Book 3**
4. **Expansion 4 support for Book 4**
5. **Expansion 5 support for Book 5**
6. **Expansion 6 support for Book 6**
7. **Expansion 7 support for Book 7**

### Phase D — Practical release criteria for each rung

Each expansion rung should be considered ready only when it has:

- a clearly identified canonical book source
- progression gates that do not bypass earlier books
- UI/navigation exposure that reflects unlocked state
- mission/content hooks tied to the correct book rung
- save-state compatibility for players moving from one rung to the next

---

## 4. Scope Decision for Repo Planning

This repo should plan expansions at the **structure level**, not at the speculative lore level.

That means repo-facing planning should focus on:

- which systems are ready
- which screens or loops need hardening
- how content will be tagged to Books 1-7
- what dependencies must be finished before the next canon rung opens

It should **not** focus on:

- invented plot summaries
- inferred replacement canon
- compressing multiple books into one roadmap slot
- reordering books because implementation assets are incomplete

---

## 5. Working Rule for Future Planning Docs

Any future roadmap, README, milestone doc, or implementation brief should use this template logic:

1. state the canon book rung being discussed
2. state the current codebase support level
3. state the recommended implementation milestone
4. avoid adding lore detail that is not already canon-confirmed

This keeps production planning useful to developers while respecting the locked seven-book series spine.
