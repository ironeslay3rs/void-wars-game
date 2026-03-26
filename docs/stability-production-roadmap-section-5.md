\\# Stability + Production Roadmap — Section 5 (MEDIUM, M3: 3+ sessions)

Source: internal roadmap screenshot (Section 5).

Goal: economy model is designed; now make it work with real transactions and real data flow.

> Economy Core Law: Players create value. Market distributes value. The game taxes the flow.

## Deliverables checklist

### 1) Black Market buy/sell
- **Requirement**: Full transaction flow:
  - browse listings
  - buy with credits
  - sell from inventory
  - player resources update in real time (UI reflects state immediately)
- **Acceptance**:
  - At least one purchase flow that results in a persisted “owned” item (not just a resource delta).
  - At least one sell flow that consumes an owned item and pays credits.
- **Likely files**:
  - `app/bazaar/black-market/*`
  - `components/black-market/*`
  - `features/game/gameTypes.ts` (inventory model if missing)
  - `features/game/gameActions.ts` (buy/sell actions)
  - `app/inventory/page.tsx` + `components/inventory/*`

### 2) Crafting recipes wired
- **Requirement**: At least 3 recipes using existing resource keys (example calls out Organic Matter, Scrap Metal, Bone, etc). Crafting UI from design artifact is target.
- **Acceptance**:
  - Player can craft at least three items with explicit costs and results.
  - UI shows requirements clearly and updates counts on craft.
- **Likely files**:
  - `app/bazaar/crafting-district/page.tsx`
  - `features/status/survival.ts` (ration recipe already exists)
  - `features/crafting-district/*`
  - `features/game/gameActions.ts`

### 3) Boss-named materials in recipes
- **Requirement**: Hollowfang drops (Core Tissue, Ash Pelt Strip, Howl Gland, Fen-Scar Marrow) and named materials like `coilboundLattice` feed into crafting recipes.
- **Acceptance**:
  - At least one recipe uses a boss-named material / named drop.
  - Those drops have a visible source and visible sink.
- **Likely files**:
  - Loot: `features/void-maps/rollVoidFieldLoot.ts`
  - Resources: `features/game/gameTypes.ts` + UI display
  - Crafting: `app/bazaar/crafting-district/page.tsx`

### 4) Inventory resource display
- **Requirement**: Grouped resources with counts, quality tiers, and tooltips. Matches the inventory UI concept from the visual archive.
- **Acceptance**:
  - Inventory screen groups resources, not a flat dump.
  - Tooltips explain what each resource is used for.
- **Likely files**:
  - `app/inventory/page.tsx`
  - `components/inventory/*`
  - `features/inventory/*`

### 5) Market fees active
- **Requirement**:
  - Listing fee on sell orders
  - Transaction tax on completed trades
  - Revenue sink prevents inflation
- **Acceptance**:
  - Fees are visible in UI (quoted before confirming).
  - Fees are applied in reducer state changes.
- **Likely files**:
  - `features/bazaar/*` economy logic
  - `features/game/gameActions.ts`
  - Market UI components

## Resource families to wire (from roadmap)
- **Survival**: Organic Matter, Water / Purified Fluid, Rest Supplies
- **Bio Evolution**: Blood Shards, Predator Marrow, Mutagenic Tissue
- **Mecha Evolution**: Core Fragments, Alloy Plates, Energy Cells
- **Spirit Evolution**: Soul Embers, Memory Ash, Sigil Dust *(note: canon language prefers Bio/Mecha/Pure; “Spirit” likely legacy)*
- **Shared Crafting**: Bone, Scrap Metal, Relic Shards, Fiber/Hide/Weave

