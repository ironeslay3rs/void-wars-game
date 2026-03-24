# AGENTS.md

## Scope
These instructions apply to the entire repository.

---

## Canon-first workflow

Future Codex tasks must treat the following docs as required inputs before making narrative, faction, UI-theme, worldbuilding, progression-copy, or Black Market changes:

- `docs/game-canon-registry.md`
- `docs/black-market-law.md`
- `docs/expansion-roadmap.md`
- `docs/faction-visual-law.md`

---

## Required behavior

- Treat every section explicitly labeled `Locked Canon` or `Locked Canon Anchors` as non-negotiable unless the user explicitly changes canon.
- Separate locked canon from flexible implementation details in any proposal, spec, task output, or code/content change.
- Do not invent new lore, nations, sins, macro schools, cosmology, or character backstory unless the user explicitly supplies it.
- Do not redesign the game when working from these docs; prefer tight, incremental changes that support the current direction.
- Prefer documentation and canon infrastructure before proposing large gameplay or system changes.
- If existing repo content appears to conflict with canon docs, flag the conflict and keep scope tight unless the user asks for a broader rewrite.

---

## Delivery rules

- For canon-affecting tasks, cite the relevant docs in the final response.
- Keep repo-facing documentation concise, practical, and implementation-safe.
- Do not change gameplay code for documentation-only canon tasks unless the user explicitly asks.

---

## Project state and priorities

We are currently in:
- M1 = Closed Internal Test

Primary goal:
- reach a playable version that real users can log into and understand without confusion

M1 priorities:
- loop readability
- gameplay clarity
- survival pressure visibility
- state understanding (what changed, what to do next)
- canon-consistent naming (Bio / Mecha / Pure)

Avoid in M1 unless explicitly requested:
- large new systems
- economy expansion
- crafting redesign
- narrative-heavy implementation
- multi-loop expansion
- premature live-service complexity

---

## Architecture rules

- Prefer extending existing systems over creating new ones
- Do not create parallel subsystems if the current loop/state can support the feature
- Keep changes localized and minimal
- Respect separation between:
  - app routes
  - components
  - feature data
  - game state / types / storage
- Do not restructure the project unless explicitly requested

---

## Scope control

Before implementing:
- define exact scope
- list files that will change
- state what is intentionally NOT included

Guidelines:
- prefer small diffs
- avoid touching unrelated files
- do not bundle multiple features in one task

---

## Implementation output format

For build tasks, return:

1. Role Summary
2. Exact Files Changed
3. Scope Decision (included / not included)
4. What Changed
5. Validation (commands run and results)
6. Full updated contents for every changed file

---

## Validation rules

- run targeted validation first
- avoid full repo checks unless needed

Examples:
- npx eslint <edited files>
- npx tsc --noEmit
- git diff --check

Always report what was run.

---

## Canon and thematic rules

Core canon language:
- Bio
- Mecha
- Pure

Do not reintroduce "Spirit" in player-facing canon wording unless explicitly required for save migration or legacy compatibility.

World tone:
- survival-first
- war-scarred
- diegetic
- not overly gamey
- readable without losing atmosphere

Project canon anchors:
- Bio / Mecha / Pure are the macro paths
- Ember Vault is Pure-aligned
- Black Market is a lived-in survival hub, not a generic fantasy town
- progression should feel earned, pressured, and costly
- early play should feel fragile and understandable

---

## Multi-agent system

### Orchestrator (default entrypoint)

Purpose:
- read user task
- classify it
- route to correct agents
- enforce M1 scope

Must:
- keep scope tight
- avoid overbuilding
- prevent duplicate work

---

### Builder
- implements code
- follows exact scope
- keeps changes minimal
- validates work
- does not expand scope

---

### Reviewer
- checks scope size
- ensures architecture quality
- detects overreach
- ensures M1 alignment
- does not write code

---

### Canon-UX Auditor
- enforces Bio / Mecha / Pure consistency
- protects Black Market tone
- improves clarity
- removes gamey wording
- does not add systems

---

### PNG Graphic Coordinator

Purpose:
- handle all PNG assets
- organize, split, name, and integrate them
- maintain visual consistency

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

The PNG Graphic Coordinator must:

### 1. Split multi-item PNGs (CRITICAL RULE)

If a PNG contains multiple elements:
- split it into individual assets
- each element must become its own file

Example:
- input: creatures-pack.png (4 creatures)
- output:
  - creature-wolf.png
  - creature-serpent.png
  - creature-golem.png
  - creature-hawk.png

Rules:
- each asset must be cleanly cropped
- preserve transparency (alpha)
- avoid cutting important edges

---

### 2. Naming convention

- lowercase
- hyphen-separated
- descriptive

Examples:
- bio-icon.png
- feast-hall-bg.png
- creature-void-wolf.png

---

### 3. Asset classification

Every asset must be categorized:
- icon
- background
- UI
- faction
- creature
- boss

---

### 4. File placement

Place assets in correct folder:
- icons → /icons/
- backgrounds → /backgrounds/
- etc.

---

### 5. Asset registry (lib/assets.ts)

All assets must be registered:

```ts
export const assets = {
  icons: {
    bio: "/assets/icons/bio-icon.png",
  },
  backgrounds: {
    home: "/assets/backgrounds/home-bg.png",
  },
};