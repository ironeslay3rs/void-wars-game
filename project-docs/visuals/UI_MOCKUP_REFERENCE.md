# UI mockup reference pack — Void Wars: Oblivion

## Purpose

Use this pack as the **general reference** for:

- layout density and information hierarchy (systems-heavy, readable),
- dark industrial / grimdark tone (Darkest Dungeon–weight, not cozy RPG),
- tri-path identity (Bio / Mecha / Pure) and **convergence / hybrid** staging,
- hub navigation patterns (bazaar map, districts, sidebars),
- presentation-layer goals (AFK Journey–style clarity on dense screens).

These images are **composition references**, not automatic production assets.

## Canon and naming (non-negotiable for shipped UI)

Mockups may label the third pillar **“Spirit”** or show **Spirit** icons. In **player-facing** implementation, use **Pure** and **Ember Vault** language per `docs/game-canon-registry.md` and `project-docs/canon/FACTION_LANGUAGE.md`. Internal filenames or legacy modules may still say `spirit`; new UI copy should not.

## Pipeline rule

- **Do not** point production code at Cursor cache paths or arbitrary folders.
- To ship a crop or panel as real UI chrome, follow `project-docs/architecture/ASSET_PIPELINE.md`: rename → `public/assets/...` → `lib/assets.ts`.

## Where files live

1. **In-repo (preferred):** copy PNGs into `project-docs/visuals/mockups/` using the suggested filenames below.
2. **Cursor workspace storage (original drop):** filenames may match the long paths under `.cursor/projects/.../assets/` — copy into `mockups/` when you want them versioned with the game repo.

## Screen index (use when building routes)

| Suggested filename | What it shows | Primary map → repo routes / systems |
| --- | --- | --- |
| `reference-rune-stats-wheel.png` | Circular rune / stat wheel with central STATS | Loadout / mastery adjunct, prep-driven bonuses |
| `reference-black-market-auctions.png` | Black Market auctions, bids, tax, hidden offers | `app/bazaar/black-market`, War Exchange, future listings |
| `reference-mastery-triptych-bio-mecha-pure.png` | Three vertical mastery trees (mock: “Spirit”) | `app/mastery`, `features/mastery/*` — label **Pure** in UI |
| `reference-arena-pvp-ruleset.png` | Arena modes, ruleset, queue, rewards | `app/bazaar/arena`, `features/arena/*` |
| `reference-hunt-rewards-harvest.png` | Hunt rewards grid, zone, resonance | Hunt result / void field haul UI |
| `reference-character-status-elaborate.png` | Wide status sheet (vitals, attributes) | `app/status`, Status hero / systems cards |
| `reference-professions-grid.png` | Six profession cards + Bio/Mecha/Pure mastery bars | Future `app/.../professions`, career loop |
| `reference-nexus-bazaar-hub-map.png` | Painted hub with district callouts | `app/bazaar/*`, `bazaarDistrictData` (Pure enclave id: `pure-enclave`) |
| `reference-mastery-corruption-upkeep.png` | Tri-rail mastery, hybrids, corruption %, upkeep | Mastery + Phase 3+ consequence / economy hooks |
| `reference-crafting-workbench.png` | Structural / organic / arcane / hybrid crafting tabs | `app/bazaar/crafting-district`, recipes |
| `reference-inventory-materials-grid.png` | Materials tab, capacity, dual tags | `app/inventory`, `features/resources/*` |
| `reference-class-hybrid-picker.png` | Bio / Mecha / Pure columns + hybrid row | Future class prestige — **Pure** column label |
| `reference-career-focus-tri-panel.png` | Combat / Gathering / Crafting focus | `app/new-game`, `careerFocus`, Home rails |
| `reference-mastery-tree-wide.png` | Alternate wide mastery layout (hybrid legend) | Same as mastery targets above |
| `reference-inventory-character-raven.png` | Character + equipment strip + resources | `app/inventory`, `app/character`, loadout |

## Cross-doc links

- **Field vs UI layering:** `project-docs/visuals/VISUAL_DIRECTION.md`
- **Black Market tone:** `docs/black-market-law.md`
- **Hub districts (data):** `features/bazaar/bazaarDistrictData.ts`
- **Execution order:** `03-Docs/game-direction/codex-master-execution-brief.md` (screen pillars §6)

## When agents implement features

1. Open the matching row in the table above for layout intent.
2. Keep **routes thin**, **components** composable, **numbers and rules** in `features/`.
3. If the mockup adds a new currency or stat, add it through existing resource / state patterns — do not hardcode mock numbers as permanent canon.
