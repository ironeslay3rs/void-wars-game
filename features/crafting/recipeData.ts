import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export type CraftingCategory = "organic" | "structural" | "arcane" | "hybrid";

export type CraftedItem = {
  id: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Rare";
  kind: "weapon" | "armor" | "rune-core" | "consumable";
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
      item: { id: "scrap-blade", name: "Scrap Blade", rarity: "Common", kind: "weapon" },
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
      item: { id: "bone-plating", name: "Bone Plating", rarity: "Common", kind: "armor" },
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
      item: { id: "rune-sigil", name: "Rune Sigil", rarity: "Uncommon", kind: "rune-core" },
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
      item: { id: "bio-serum", name: "Bio Serum", rarity: "Uncommon", kind: "consumable" },
    },
  },
];

export const craftingCategoryLabels: Record<CraftingCategory, string> = {
  organic: "Organic",
  structural: "Structural",
  arcane: "Arcane",
  hybrid: "Hybrid",
};

