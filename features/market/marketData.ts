import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export type MarketCategory = "weapons" | "armor" | "consumables" | "materials";

export type MarketListing = {
  id: string;
  name: string;
  category: MarketCategory;
  rarity: "Common" | "Uncommon" | "Rare";
  priceCredits: number;
  stock: number;
  grant: Partial<ResourcesState>;
};

export const MARKET_LISTINGS: MarketListing[] = [
  {
    id: "field-med-patch",
    name: "Field Med Patch",
    category: "consumables",
    rarity: "Common",
    priceCredits: 80,
    stock: 12,
    // Represented as a ration-like consumable in current resource model.
    grant: { mossRations: 1 },
  },
  {
    id: "moss-ration-pack",
    name: "Moss Ration (sealed)",
    category: "consumables",
    rarity: "Uncommon",
    priceCredits: 120,
    stock: 8,
    grant: { mossRations: 2 },
  },
  {
    id: "iron-ore-sack",
    name: "Iron Ore Sack",
    category: "materials",
    rarity: "Common",
    priceCredits: 40,
    stock: 30,
    grant: { ironOre: 5 },
  },
  {
    id: "scrap-alloy-crate",
    name: "Scrap Alloy Crate",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 95,
    stock: 18,
    grant: { scrapAlloy: 4 },
  },
  {
    id: "rune-dust-vial",
    name: "Rune Dust Vial",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 90,
    stock: 16,
    grant: { runeDust: 4 },
  },
  {
    id: "ember-core-pair",
    name: "Ember Core Pair",
    category: "materials",
    rarity: "Rare",
    priceCredits: 210,
    stock: 8,
    grant: { emberCore: 2 },
  },
  {
    id: "bio-sample-bundle",
    name: "Bio Sample Bundle",
    category: "materials",
    rarity: "Common",
    priceCredits: 55,
    stock: 22,
    grant: { bioSamples: 5 },
  },
  {
    id: "starter-sidearm-parts",
    name: "Sidearm Parts Lot",
    category: "weapons",
    rarity: "Common",
    priceCredits: 140,
    stock: 10,
    grant: { scrapAlloy: 2, ironOre: 2 },
  },
  {
    id: "armor-weave-stock",
    name: "Armor Weave Stock",
    category: "armor",
    rarity: "Uncommon",
    priceCredits: 160,
    stock: 10,
    grant: { scrapAlloy: 3, emberCore: 1 },
  },
  {
    id: "district-salvage-mix",
    name: "District Salvage Mix",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 175,
    stock: 10,
    grant: { ironOre: 4, scrapAlloy: 3, runeDust: 2 },
  },
];

export const SELLABLE_RESOURCE_KEYS: ResourceKey[] = [
  "ironOre",
  "scrapAlloy",
  "runeDust",
  "emberCore",
  "bioSamples",
  "mossRations",
];

export const RESOURCE_BASE_PRICES: Partial<Record<ResourceKey, number>> = {
  ironOre: 6,
  scrapAlloy: 18,
  runeDust: 16,
  emberCore: 55,
  bioSamples: 9,
  mossRations: 60,
};

