import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export type MarketCategory = "weapons" | "armor" | "consumables" | "materials";

export type MarketListing = {
  id: string;
  name: string;
  category: MarketCategory;
  rarity: "Common" | "Uncommon" | "Rare";
  priceCredits: number;
  stock: number;
  description: string;
  grant: Partial<ResourcesState>;
};

export const MARKET_LISTINGS: MarketListing[] = [
  {
    id: "rustfang-cleaver",
    name: "Rustfang Cleaver",
    category: "weapons",
    rarity: "Uncommon",
    priceCredits: 350,
    stock: 5,
    description: "Heavy scavenged blade kit traded as salvage components.",
    grant: { scrapAlloy: 4, ironOre: 3 },
  },
  {
    id: "voidtooth-knife",
    name: "Voidtooth Knife",
    category: "weapons",
    rarity: "Rare",
    priceCredits: 420,
    stock: 4,
    description: "High-edge extraction blade with rune-dust temper.",
    grant: { scrapAlloy: 3, runeDust: 3 },
  },
  {
    id: "patrol-shell",
    name: "Patrol Shell",
    category: "armor",
    rarity: "Common",
    priceCredits: 210,
    stock: 8,
    description: "Standard field shell plates from old convoy stock.",
    grant: { scrapAlloy: 3, ironOre: 1 },
  },
  {
    id: "scrap-vest",
    name: "Scrap Vest",
    category: "armor",
    rarity: "Uncommon",
    priceCredits: 270,
    stock: 7,
    description: "Layered scrap weave used in short-range breach runs.",
    grant: { scrapAlloy: 4, emberCore: 1 },
  },
  {
    id: "field-med-patch",
    name: "Field Med Patch",
    category: "consumables",
    rarity: "Common",
    priceCredits: 80,
    stock: 12,
    description: "Quick stabilization patch packed for field deployment.",
    grant: { mossRations: 1 },
  },
  {
    id: "signal-flare",
    name: "Signal Flare",
    category: "consumables",
    rarity: "Uncommon",
    priceCredits: 140,
    stock: 10,
    description: "Emergency flare canister traded as mission utility stock.",
    grant: { emberCore: 1, runeDust: 1 },
  },
  {
    id: "moss-ration-pack",
    name: "Moss Ration Pack",
    category: "consumables",
    rarity: "Uncommon",
    priceCredits: 120,
    stock: 8,
    description: "Sealed ration stack for long sortie windows.",
    grant: { mossRations: 2 },
  },
  {
    id: "iron-ore-bulk",
    name: "Iron Ore Bulk",
    category: "materials",
    rarity: "Common",
    priceCredits: 40,
    stock: 30,
    description: "Bulk ore sacks from relay dismantle teams.",
    grant: { ironOre: 5 },
  },
  {
    id: "scrap-alloy-pack",
    name: "Scrap Alloy Pack",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 95,
    stock: 18,
    description: "Compressed alloy packs for repairs and fabrication.",
    grant: { scrapAlloy: 4 },
  },
  {
    id: "rune-dust-vial",
    name: "Rune Dust Vial",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 90,
    stock: 16,
    description: "Fine dust lot used for low-tier rune applications.",
    grant: { runeDust: 4 },
  },
  {
    id: "ember-core-pair",
    name: "Ember Core Pair",
    category: "materials",
    rarity: "Rare",
    priceCredits: 210,
    stock: 8,
    description: "Double-core crate reserved for high-demand buyers.",
    grant: { emberCore: 2 },
  },
  {
    id: "bio-sample-bundle",
    name: "Bio Sample Bundle",
    category: "materials",
    rarity: "Common",
    priceCredits: 55,
    stock: 22,
    description: "Sealed bio pods gathered from unstable field zones.",
    grant: { bioSamples: 5 },
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

