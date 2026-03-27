import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import type { ItemRankTier } from "@/features/inventory/itemRanks";

export type CraftingCategory = "organic" | "structural" | "arcane" | "hybrid";

export type CraftedItem = {
  id: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Rare";
  kind: "weapon" | "armor" | "rune-core" | "consumable";
  rankTier: ItemRankTier;
};

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
];

export const craftingCategoryLabels: Record<CraftingCategory, string> = {
  organic: "Organic",
  structural: "Structural",
  arcane: "Arcane",
  hybrid: "Hybrid",
};

