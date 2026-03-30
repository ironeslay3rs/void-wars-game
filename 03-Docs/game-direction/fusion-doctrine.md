# Void Wars: Oblivion — Fusion Doctrine

## Purpose

Lock one implementation doctrine for the official product merge so borrowed patterns improve readability, retention, and structure **without replacing** Void Wars identity.

This file governs:

- identity law,
- allowed borrowing,
- naming rules,
- merge guardrails,
- execution order.

For milestone sequencing, ownership, and file-gate detail, see `03-Docs/game-direction/codex-master-execution-brief.md`.

---

## 1. Locked Source-of-Truth Order

1. **Book / Void Wars canon = identity**
2. **Overmortal = progression spine**
3. **AFK Journey = readability / presentation layer**
4. **Vampire Wars = conflict / faction pressure reference**
5. **Darkest Dungeon = consequence / expedition weight reference**

If any borrowed pattern conflicts with canon truth, canon wins.

---

## 2. Identity Law (Must Stay Void Wars)

These anchors are non-negotiable for launch-facing work:

- Void = 3D prison
- Fusion is the long truth: body + mind + soul
- Bio / Mecha / Pure are the macro paths
- Puppy start remains fragile
- Black Market remains a neutral survivor citadel
- Marks -> Main Rune -> hybrid / convergence remains core fantasy
- danger, consequence, corruption, overload, and fracture stay visible
- the world must feel lived-in, not menu-only
- player-driven economy and role value must remain real

### Naming guardrail

Launch-facing strings must use:

- Bio
- Mecha
- Pure

Do not reintroduce `Spirit` in player-facing wording unless compatibility work explicitly requires it.

---

## 3. Allowed Borrowing

### Book / Void Wars canon

Keep from canon:

- world, lore, factions, terminology
- school identity
- Black Market worldview
- risk systems
- profession depth
- convergence fantasy

This is the part that makes the game `Void Wars`, not a clone.

### Overmortal (allowed scope)

Use for:

- daily return cadence
- chapter-based advancement
- breakthroughs
- rank progression
- long-arc ascent feeling

Do **not** borrow:

- faction identity
- world identity
- lore replacement
- cosmology replacement

### AFK Journey (allowed scope)

Use for:

- cleaner overworld / zone readability
- hero-first screen composition
- smoother AFK reward delivery
- better encounter readability
- better home -> field -> reward -> upgrade -> repeat flow

Do **not** borrow:

- cozy fantasy softness
- replacement tone
- generic polished blandness

### Vampire Wars / Darkest Dungeon (reference only)

Use as references for:

- faction conflict pressure
- war stakes
- expedition dread
- consequence weight
- costly forward motion

Do **not** copy:

- their worlds
- their factions
- their identity structure
- their UI wholesale

---

## 4. Official Fusion Formula

### Keep from Void Wars

- world, lore, and tone
- school identity and truth
- danger and survival pressure
- market and resource logic
- profession depth
- convergence fantasy

### Borrow from Overmortal

- progression structure
- breakthrough pacing
- chapter flow
- long-arc rank cadence
- daily advancement rhythm

### Borrow from AFK Journey

- map flow
- field readability
- idle clarity
- squad / reward presentation polish
- clearer route and reward comprehension

### Borrow in tone only from Vampire Wars / Darkest Dungeon

- faction tension
- war pressure
- expedition consequence
- costly atmosphere

---

## 5. What You Must Not Do

- Do not merge identities into “Overmortal but darker” or “AFK Journey but cyberpunk.”
- Do not flatten Bio, Mecha, and Pure into palette swaps.
- Do not jump to giant war-map complexity before the core loop is fun.
- Do not turn the lived world into a menu stack.
- Do not let borrowed systems overwrite canon labels, factions, or cosmology.
- Do not make the merge more generic.

The merge should make the game:

- clearer
- more readable
- more addictive
- more professional

But never less Void Wars.

---

## 6. Best Merged Product Shape

### Genre position

A dark cultivation war RPG with:

- AFK-friendly return loops
- chapter progression
- field readability
- player-driven economy
- consequence-forward growth

### Core loop

Log in -> collect AFK output -> choose a pressure lane -> resolve field / hunt / arena -> gain materials / reputation / story progress -> upgrade mark / mastery / profession / loadout -> queue next cycle

### Emotional loop

survive -> stabilize -> specialize -> become valuable -> become dangerous -> hybridize -> converge

### Social loop

Guilds should naturally need:

- fighters
- gatherers
- crafters
- brokers
- specialists
- hybrid experts

Not just the strongest combat players.

---

## 7. Path Law

The three paths must solve similar problems through different truths:

- **Bio** = instinct, adaptation, body pressure
- **Mecha** = structure, precision, engineered scaling
- **Pure** = soul, memory, meaning, highest long-term ceiling

They must not collapse into cosmetic variants of the same lane.

---

## 8. Execution Order

### Phase A — Lock merge doctrine

This file is the rule-set all teams follow before more merge work.

### Phase B — Rebuild the first 30 minutes

Target opening loop:

1. arrive as Puppy
2. first rumor / bad deal
3. first field deployment
4. first resource recovery
5. first school-shaped choice
6. first broker / Black Market interaction
7. first Mark eligibility

### Phase C — Refactor shell after the loop feels good

Architecture rules:

- `app/` thin route wrappers
- screen composition in `components/`
- reusable UI in shared components
- values and rules in `features/`
- art via `lib/assets.ts`

### Phase D — Add AFK clarity layer after loop quality is proven

Add:

- clearer idle reward panels
- expedition timers
- passive production / upkeep
- resumable field state cues
- smoother travel clarity

### Phase E — Add war layer later

Add:

- contested zones
- faction pressure
- guild contribution
- arena prestige
- Rune Crafter / Rune Knight economy depth

---

## 9. Merge Acceptance Checks

Every merge task should pass all of these:

1. Does it preserve Void Wars canon language and tone?
2. Is it borrowing structure/readability rather than identity?
3. Does it improve “what changed / what next” clarity?
4. Does it keep survival pressure visible?
5. Does it avoid genericization?

If any check fails, revise before merge.

---

## 10. Single Most Important Guardrail

Do not let the merge make the game more generic.

The merge must make the game:

- clearer
- more readable
- more compelling
- more professional

But never less Void Wars.

---

## 11. One-Line Team Direction

**Use Overmortal to structure growth, AFK Journey to structure readability, Vampire Wars and Darkest Dungeon to sharpen stakes, and the book canon to define truth.**
