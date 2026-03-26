# AGENTS.md

# Required Project References

Before planning, implementing, or refactoring anything, read the relevant files under:

- /project-docs/canon/
- /project-docs/visuals/
- /project-docs/gameplay/
- /project-docs/architecture/
- /project-docs/workflow/

Minimum required reads for all tasks:

- /project-docs/workflow/VOID_WARS_DIRECTOR.md
- /project-docs/workflow/VOID_WARS_TASK_QUEUE.md
- /project-docs/architecture/ARCHITECTURE_RULES.md

If the task affects visuals, also read:

- /project-docs/visuals/VISUAL_DIRECTION.md

If the task affects canon wording or tone, also read:

- /project-docs/canon/LOCKED_CANON.md
- /project-docs/canon/FACTION_LANGUAGE.md

If the task affects assets, also read:

- /project-docs/architecture/ASSET_PIPELINE.md

Do not proceed based on assumptions if a relevant reference file exists.## Scope
These instructions apply to the entire repository.

---

## Mission

Build _Void Wars: Oblivion_ as a professional, layered, modular game project.

Treat this repository like a _4-person production codebase_, not a one-off prototype dump.

The _book canon is the source of truth_.
The game must translate canon into a practical, playable vertical slice without bloating scope.

---

## Canon-first workflow

Before making any narrative, faction, UI-theme, worldbuilding, progression-copy, Black Market, or canon-adjacent change, Codex must read these docs first:

- docs/game-canon-registry.md
- docs/black-market-law.md
- docs/expansion-roadmap.md
- docs/faction-visual-law.md

These are required inputs for canon-affecting work.

---

## Required canon behavior

- Treat every section labeled _Locked Canon_ or _Locked Canon Anchors_ as non-negotiable unless the user explicitly changes canon.
- Separate _locked canon_ from _flexible implementation details_ in any proposal, task output, design note, or code/content change.
- Do not invent new lore, nations, sins, macro schools, cosmology, factions, or character backstory unless the user explicitly provides it.
- Do not redesign the whole game while working from canon docs.
- Prefer _tight, incremental changes_ that support the current direction.
- Prefer _documentation and canon infrastructure_ before proposing large gameplay or systems changes.
- If repo content conflicts with canon docs, flag the conflict and keep scope tight unless the user asks for a broader rewrite.

---

## Core canon anchors

### Canon truths

- _Void = 3D prison_
- _Fusion = body + mind + soul_
- _Bio = Verdant Coil_
- _Mecha = Chrome Synod_
- _Pure = Ember Vault_
- _Black Market = neutral survivor citadel_
- _Book 1 = current game scope_

### Core canon language

Use:

- _Bio_
- _Mecha_
- _Pure_

Do _not_ reintroduce _Spirit_ in player-facing canon wording unless explicitly required for save migration, compatibility, or legacy cleanup.

### Project canon anchors

- Bio / Mecha / Pure are the macro paths
- Ember Vault is Pure-aligned
- Black Market is a lived-in survival hub, not a generic fantasy town
- Progression should feel earned, pressured, and costly
- Early play should feel fragile and understandable

### Black Market sin lanes

- Wrath = _Arena of Blood_
- Gluttony = _Feast Hall_
- Envy = _Mirror House_
- Lust = _Velvet Den_
- Greed = _Golden Bazaar_
- Pride = _Ivory Tower_
- Sloth = _Silent Garden_

---

## Project state and priorities

We are currently in:

- _M1 = Closed Internal Test_

Primary goal:

- reach a playable version that real users can log into and understand without confusion

### M1 priorities

- loop readability
- gameplay clarity
- survival pressure visibility
- state understanding
- what changed / what to do next clarity
- canon-consistent naming
- route clarity
- practical vertical slice progress

### Avoid in M1 unless explicitly requested

- large new systems
- economy expansion
- crafting redesign
- narrative-heavy implementation
- multi-loop expansion
- premature live-service complexity
- broad world expansion
- speculative Book 2+ implementation

---

## Product direction

Void Wars: Oblivion should feel like:

- survival-first
- war-scarred
- pressured
- diegetic
- costly
- readable without losing atmosphere

Prefer:

- survival
- preparation
- extraction
- crafting utility
- state clarity
- role identity
- vertical slice completion
- practical city services
- costly progression

Avoid:

- generic tavern fluff
- cozy RPG tone
- overly gamey wording
- fake complexity
- lore-only expansion with no gameplay value
- menu bloat without player understanding

---

## Architecture rules

Always preserve clean layered architecture.

### Separation of concerns

Respect separation between:

- app routes
- components
- feature data
- game state / types / storage

### Directory intent

- app/ = thin route wrappers only
- components/ = screen composition, shells, page-level presentation
- features/ = domain logic, state, gameplay rules, data, helpers

### Required standards

- prefer extending existing systems over creating new ones
- do not create parallel subsystems if the current loop/state can support the feature
- keep changes localized and minimal
- prefer small diffs
- avoid unrelated files
- prefer reusable pieces
- avoid giant God files
- do not duplicate logic across screens
- do not casually mix layout, logic, and data
- do not restructure the repo unless explicitly requested

### When changing code

- return _full updated file contents_
- do not return partial snippets unless explicitly asked
- do not bundle multiple features into one task
- if a task can be solved in 1–3 files, keep it there

---

## Scope control

Before implementing, always:

1. define exact scope
2. list files that will change
3. state what is intentionally _not_ included

### Scope guidelines

- prefer small diffs
- avoid touching unrelated files
- do not bundle multiple features in one task
- keep work narrow, reviewable, and M1-safe

---

## Delivery rules

### For canon-affecting tasks

- cite the relevant docs in the final response
- keep repo-facing documentation concise, practical, and implementation-safe
- do not change gameplay code for documentation-only canon tasks unless explicitly asked

### For build tasks

Return:

1. Role Summary
2. Exact Files Changed
3. Scope Decision (included / not included)
4. What Changed
5. Validation (commands run and results)
6. Full updated contents for every changed file

### For review tasks

Return:

1. Keep / Revise / Reject
2. Scope check
3. Architecture check
4. Canon / naming / tone check
5. Risks or overreach
6. Smallest correction needed

### For asset-ingestion tasks

When work selects raw visuals from **`/incoming`** (`public/assets/incoming/`, same rules for legacy `public/assets/_incoming/`) and promotes them to production, return:

1. Role Summary
2. Asset Classification
3. Source File(s) in `/incoming`
4. Renamed Production File(s)
5. Split Outputs (if any)
6. Exact Destination Paths
7. Asset Registry Changes
8. Exact Files Changed
9. Validation (commands run and results)
10. Full Updated File Contents (every changed file)

If the task also edits gameplay or UI wiring, include those files under items 8 and 10 and keep registry paths consistent with `lib/assets.ts`.

---

## Validation rules

- run targeted validation first
- avoid full repo checks unless needed

### Preferred examples

- npx eslint <edited files>
- npx tsc --noEmit
- git diff --check

Always report:

- what was run
- why it was run
- result

Do not claim validation was performed if it was not.

---

## Multi-agent system

### Orchestrator (default entrypoint)

Purpose:

- read user task
- classify it
- route to correct agents
- enforce M1 scope
- prevent duplicate or conflicting work

Must:

- keep scope tight
- avoid overbuilding
- prevent duplicate work
- prefer verification-first routing
- route any task that introduces **new visuals** through **Incoming / asset ingestion**; never approve production UI that references `/incoming` or `_incoming` paths

---

### Builder

Purpose:

- implement code
- follow exact scope
- keep changes minimal
- validate work
- avoid scope creep

Must:

- reuse existing systems first
- avoid broad rewrites
- keep diffs reviewable
- not expand scope beyond the assigned slice

---

### Reviewer

Purpose:

- check scope size
- ensure architecture quality
- detect overreach
- ensure M1 alignment
- protect repo quality

Must:

- review, not redesign
- reject speculative expansion
- avoid writing new code unless a tiny correction is absolutely necessary

---

### Canon-UX Auditor

Purpose:

- enforce Bio / Mecha / Pure consistency
- protect Black Market tone
- improve clarity
- reduce gamey wording
- keep naming canon-safe

Must:

- not add systems
- not invent lore
- focus on wording, framing, readability, tone, and canon consistency

---

### Repo Auditor

Purpose:

- inspect current repo structure
- inventory routes / screens / features
- find duplicate, stale, or risky areas
- identify exact files for the next slice

Must:

- verify before proposing edits
- preserve working systems
- flag conflicts instead of casually rewriting

---

### Planner

Purpose:

- define roadmap slices
- sequence work
- identify dependencies
- define what should _not_ be built yet

Must:

- prefer vertical slice completion over broad expansion
- keep recommendations implementation-safe
- respect Book 1 / M1 priorities

---

### PNG Graphic Coordinator

Purpose:

- handle all PNG assets
- organize, split, name, classify, and integrate them
- maintain visual consistency

Must:

- preserve alpha transparency
- keep asset organization clean
- update the asset registry when needed
- execute the full **Incoming / asset ingestion** pipeline (below); never ship URLs pointing at `incoming` or `_incoming`

---

## Incoming / asset ingestion (permanent — standing rule)

**Canonical raw drop:** `public/assets/incoming/` (shorthand: **`/incoming`**). Legacy **`public/assets/_incoming/`** follows the **same** rules until retired.

### Mandatory rules

1. **Never** use `/incoming` or `_incoming` directly in **production UI code**, content JSON, or **shipped** registry string values.
2. For every raw file that becomes part of the product, create a **clean renamed production** version.
3. **Copy** production files into the correct destination under `/public/assets/...` (the game ships from these paths, not from incoming).
4. **Register** all production assets in the project asset system (`lib/assets.ts` is the current registry).
5. If a raw file is a **sheet / atlas / pack** (icons, skills, UI pieces, etc.) and cells are **clearly separable**, **split** into individual production assets.
6. Keep naming **consistent, descriptive, and project-safe** (lowercase, hyphen-separated; no vague `img1`, no unsafe characters).
7. **Do not** leave hardcoded temporary paths in components (no incoming paths, no one-off raw URLs).

### Asset pipeline (each raw file selected from `/incoming`)

**Step 1 — Inspect / classify:** world map, field map, icon pack, skill sheet, UI sheet, background, faction / creature / boss art, or other.

**Step 2 — Rename** by function, for example:

- `void-expedition-world-map.png`
- `howling-scar-field.png`, `ash-relay-field.png`
- `bio-skill-sheet.png`, `mecha-skill-sheet.png`
- `void-ui-icon-pack.png`

**Step 3 — Copy** into the correct destination:

- `/public/assets/maps/` — realm / navigation / world-style maps
- `/public/assets/maps/void-fields/` — per-zone void field art
- `/public/assets/icons/skills/` — skill icons
- `/public/assets/icons/items/` — item icons
- `/public/assets/icons/` — general icons when not skill/item-specific
- `/public/assets/ui/` — HUD chrome, frames, packs of UI pieces
- `/public/assets/backgrounds/` — full backgrounds
- `/public/assets/factions/`, `/creatures/`, `/bosses/` — as today when applicable

**Step 4 — Split (when practical):** if the pack is meant to be used **per icon / per piece** and separation is clear, export individual files with names such as `bio-claw-strike.png`, `mecha-target-lock.png`, `pure-ember-wave.png`, `void-hud-frame-top.png`, and place each in the correct folder.

**Step 5 — Register** using the existing project pattern in `lib/assets.ts`. Prefer nested keys that match usage, for example:

- `assets.maps.voidExpedition`
- `assets.maps.voidFields.howlingScar`
- `assets.skills.bio.clawStrike`
- `assets.ui.frames.voidTop`
- `assets.icons.items.scrapAlloy`

Extend the existing `assets` object consistently—**do not** introduce a second parallel registry unless the repo explicitly moves to one.

### Implementation rules

- Do **not** overbuild extraction tooling if a sheet is **not** actually separable without guesswork.
- If splitting is **ambiguous**, keep **one** renamed production **full sheet** in the right category, **register** it, and **note** (short comment by the registry entry or TODO) that it remains a **source sheet for manual slicing**.
- Prefer clean architecture over clever hacks; keep routes thin, components readable, and **feature data / asset URLs** centralized via the registry.

### Before wiring any new visual into UI

1. Rename → 2. Copy to production folder → 3. Split if necessary → 4. Register → 5. **Then** use the **registered** reference in code.

---

## Asset structure

Root:

- /public/assets/

Subfolders:

- /public/assets/incoming/ _(raw drops only — never imported by the app)_
- /public/assets/maps/
- /public/assets/maps/void-fields/
- /public/assets/icons/
- /public/assets/icons/skills/
- /public/assets/icons/items/
- /public/assets/backgrounds/
- /public/assets/ui/
- /public/assets/factions/
- /public/assets/creatures/
- /public/assets/bosses/

Legacy (same rules as `incoming/`, migrate out over time):

- /public/assets/\_incoming/

---

## PNG handling rules

### 1. Split multi-item PNGs (critical)

If a PNG contains multiple elements:

- split it into individual assets
- each element must become its own file

Example:

- input: creatures-pack.png
- output:
  - creature-wolf.png
  - creature-serpent.png
  - creature-golem.png
  - creature-hawk.png

Rules:

- crop cleanly
- preserve transparency
- avoid cutting important edges
- keep exported assets production-usable

### 2. Naming convention

Use:

- lowercase
- hyphen-separated
- descriptive names

Examples:

- bio-icon.png
- feast-hall-bg.png
- creature-void-wolf.png

### 3. Asset classification

Every asset must be categorized as one of:

- map (realm / world / navigation)
- field map (zone / void field — prefer `maps/void-fields/`)
- icon (general — `icons/`; skill → `icons/skills/`; item → `icons/items/`)
- background
- ui
- faction
- creature
- boss

### 4. File placement

Place assets in the correct folder:

- maps → /public/assets/maps/
- void field maps → /public/assets/maps/void-fields/
- icons (general) → /public/assets/icons/
- skill icons → /public/assets/icons/skills/
- item icons → /public/assets/icons/items/
- backgrounds → /public/assets/backgrounds/
- ui → /public/assets/ui/
- factions → /public/assets/factions/
- creatures → /public/assets/creatures/
- bosses → /public/assets/bosses/

### 5. Asset registry

All integrated assets must be registered in the asset registry file.

Preferred pattern:

```ts
export const assets = {
  icons: {
    bio: "/assets/icons/bio-icon.png",
  },
  backgrounds: {
    home: "/assets/backgrounds/home-bg.png",
  },
};
```
