import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import type { ItemRankTier } from "@/features/inventory/itemRanks";

export type CraftingCategory =
  | "organic"
  | "structural"
  | "arcane"
  | "hybrid"
  /** Phase 4 — bulk sinks + intermediate mats (War Exchange–adjacent stock flow). */
  | "refining";

export type CraftedItem = {
  id: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Rare";
  kind: "weapon" | "armor" | "rune-core" | "consumable";
  rankTier: ItemRankTier;
};

/** Phase 7 — recipe visible only after mythic ladder unlocks (Mastery screen). */
export type MythicRecipeGate = "l3RareRuneSet" | "runeCrafterLicense";

export type CraftRecipe = {
  id: string;
  name: string;
  category: CraftingCategory;
  craftTimeSeconds: number;
  successChance: number; // 0..1
  materials: Partial<Record<ResourceKey, number>>;
  output:
    | { kind: "resources"; grant: Partial<ResourcesState> }
    | { kind: "item"; item: CraftedItem };
  mythicGate?: MythicRecipeGate;
};

export const craftRecipes: CraftRecipe[] = [
  {
    id: "moss-ration",
    name: "Moss Ration",
    category: "organic",
    craftTimeSeconds: 3,
    successChance: 0.95,
    materials: { bioSamples: 10, ironOre: 5 },
    output: { kind: "resources", grant: { mossRations: 1 } },
  },
  {
    id: "scrap-blade",
    name: "Scrap Blade",
    category: "structural",
    craftTimeSeconds: 6,
    successChance: 0.8,
    materials: { scrapAlloy: 15, ironOre: 3 },
    output: {
      kind: "item",
      item: {
        id: "scrap-blade-t1",
        name: "Scrap Blade",
        rarity: "Common",
        kind: "weapon",
        rankTier: "T1",
      },
    },
  },
  {
    id: "scrap-blade-upgrade",
    name: "Scrap Blade Upgrade",
    category: "structural",
    craftTimeSeconds: 10,
    successChance: 0.65,
    materials: { scrapAlloy: 30, emberCore: 1, runeDust: 2 },
    output: {
      kind: "item",
      item: {
        id: "scrap-blade-t2",
        name: "Scrap Blade Mk-II",
        rarity: "Uncommon",
        kind: "weapon",
        rankTier: "T2",
      },
    },
  },
  {
    id: "bone-plating",
    name: "Bone Plating",
    category: "structural",
    craftTimeSeconds: 6,
    successChance: 0.8,
    materials: { ironOre: 20, scrapAlloy: 10 },
    output: {
      kind: "item",
      item: {
        id: "bone-plating-t1",
        name: "Bone Plating",
        rarity: "Common",
        kind: "armor",
        rankTier: "T1",
      },
    },
  },
  {
    id: "bone-plating-upgrade",
    name: "Bone Plating Upgrade",
    category: "structural",
    craftTimeSeconds: 11,
    successChance: 0.62,
    materials: { scrapAlloy: 28, ironOre: 20, emberCore: 1 },
    output: {
      kind: "item",
      item: {
        id: "bone-plating-t2",
        name: "Bone Plating Mk-II",
        rarity: "Uncommon",
        kind: "armor",
        rankTier: "T2",
      },
    },
  },
  {
    id: "rune-sigil",
    name: "Rune Sigil",
    category: "arcane",
    craftTimeSeconds: 8,
    successChance: 0.7,
    materials: { runeDust: 3, emberCore: 1 },
    output: {
      kind: "item",
      item: {
        id: "rune-sigil-t2",
        name: "Rune Sigil",
        rarity: "Uncommon",
        kind: "rune-core",
        rankTier: "T2",
      },
    },
  },
  {
    id: "rune-sigil-ascendant",
    name: "Rune Sigil Ascendant",
    category: "arcane",
    craftTimeSeconds: 15,
    successChance: 0.52,
    materials: { runeDust: 8, emberCore: 2, vaultLatticeShard: 1 },
    output: {
      kind: "item",
      item: {
        id: "rune-sigil-t3",
        name: "Rune Sigil Ascendant",
        rarity: "Rare",
        kind: "rune-core",
        rankTier: "T3",
      },
    },
  },
  {
    id: "obsidian-cycle-core",
    name: "Obsidian Cycle Core",
    category: "arcane",
    craftTimeSeconds: 22,
    successChance: 0.5,
    mythicGate: "l3RareRuneSet",
    materials: { ironHeart: 1, runeDust: 14, emberCore: 2 },
    output: {
      kind: "item",
      item: {
        id: "obsidian-cycle-core-t4",
        name: "Obsidian Cycle Core",
        rarity: "Rare",
        kind: "rune-core",
        rankTier: "T4",
      },
    },
  },
  {
    id: "crafter-lattice-channel",
    name: "Crafter Lattice Channel",
    category: "arcane",
    craftTimeSeconds: 18,
    successChance: 0.58,
    mythicGate: "runeCrafterLicense",
    materials: { runeDust: 22, credits: 15 },
    output: {
      kind: "resources",
      grant: { emberCore: 2, runeDust: 4 },
    },
  },
  {
    id: "bio-serum",
    name: "Bio Serum",
    category: "hybrid",
    craftTimeSeconds: 5,
    successChance: 0.85,
    materials: { bioSamples: 15, emberCore: 1 },
    output: {
      kind: "item",
      item: {
        id: "bio-serum-t1",
        name: "Bio Serum",
        rarity: "Uncommon",
        kind: "consumable",
        rankTier: "T1",
      },
    },
  },
  {
    id: "refine-ore-granulate",
    name: "Ore Granulate Wash",
    category: "refining",
    craftTimeSeconds: 4,
    successChance: 0.88,
    materials: { ironOre: 24, credits: 10 },
    output: {
      kind: "resources",
      grant: { scrapAlloy: 9 },
    },
  },
  {
    id: "refine-scrap-ember-channel",
    name: "Scrap Ember Channel",
    category: "refining",
    craftTimeSeconds: 7,
    successChance: 0.7,
    materials: { scrapAlloy: 18, runeDust: 3 },
    output: {
      kind: "resources",
      grant: { emberCore: 1, scrapAlloy: 6 },
    },
  },
  {
    id: "refine-bio-slurry-rift",
    name: "Biomass Slurry Rift",
    category: "refining",
    craftTimeSeconds: 5,
    successChance: 0.82,
    materials: { bioSamples: 16, ironOre: 6 },
    output: {
      kind: "resources",
      grant: { runeDust: 4, bioSamples: 6 },
    },
  },
];

export const craftingCategoryLabels: Record<CraftingCategory, string> = {
  organic: "Organic",
  structural: "Structural",
  arcane: "Arcane",
  hybrid: "Hybrid",
  refining: "Refining",
};

