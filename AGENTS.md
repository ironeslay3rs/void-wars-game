# AGENTS.md

## Scope
These instructions apply to the entire repository.

---

## Mission

Build *Void Wars: Oblivion* as a professional, layered, modular game project.

Treat this repository like a *4-person production codebase*, not a one-off prototype dump.

The *book canon is the source of truth*.
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

- Treat every section labeled *Locked Canon* or *Locked Canon Anchors* as non-negotiable unless the user explicitly changes canon.
- Separate *locked canon* from *flexible implementation details* in any proposal, task output, design note, or code/content change.
- Do not invent new lore, nations, sins, macro schools, cosmology, factions, or character backstory unless the user explicitly provides it.
- Do not redesign the whole game while working from canon docs.
- Prefer *tight, incremental changes* that support the current direction.
- Prefer *documentation and canon infrastructure* before proposing large gameplay or systems changes.
- If repo content conflicts with canon docs, flag the conflict and keep scope tight unless the user asks for a broader rewrite.

---

## Core canon anchors

### Canon truths
- *Void = 3D prison*
- *Fusion = body + mind + soul*
- *Bio = Verdant Coil*
- *Mecha = Chrome Synod*
- *Pure = Ember Vault*
- *Black Market = neutral survivor citadel*
- *Book 1 = current game scope*

### Core canon language
Use:
- *Bio*
- *Mecha*
- *Pure*

Do *not* reintroduce *Spirit* in player-facing canon wording unless explicitly required for save migration, compatibility, or legacy cleanup.

### Project canon anchors
- Bio / Mecha / Pure are the macro paths
- Ember Vault is Pure-aligned
- Black Market is a lived-in survival hub, not a generic fantasy town
- Progression should feel earned, pressured, and costly
- Early play should feel fragile and understandable

### Black Market sin lanes
- Wrath = *Arena of Blood*
- Gluttony = *Feast Hall*
- Envy = *Mirror House*
- Lust = *Velvet Den*
- Greed = *Golden Bazaar*
- Pride = *Ivory Tower*
- Sloth = *Silent Garden*

---

## Project state and priorities

We are currently in:

- *M1 = Closed Internal Test*

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
- return *full updated file contents*
- do not return partial snippets unless explicitly asked
- do not bundle multiple features into one task
- if a task can be solved in 1–3 files, keep it there

---

## Scope control

Before implementing, always:

1. define exact scope
2. list files that will change
3. state what is intentionally *not* included

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
- define what should *not* be built yet

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

---

## Asset structure

Root:
- /public/assets/

Subfolders:
- /public/assets/icons/
- /public/assets/backgrounds/
- /public/assets/ui/
- /public/assets/factions/
- /public/assets/creatures/
- /public/assets/bosses/

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
- icon
- background
- ui
- faction
- creature
- boss

### 4. File placement
Place assets in the correct folder:
- icons → /public/assets/icons/
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