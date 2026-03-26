import type { ResourcesState } from "@/features/game/gameTypes";

export type BossLootRarity = "uncommon" | "rare" | "epic" | "legendary";

export type BossLootEntry = {
  id: string;
  name: string;
  rarity: BossLootRarity;
  chance: number;
  resourceGrants?: Partial<ResourcesState>;
};

export type BossDefinition = {
  id: "hollowfang";
  name: string;
  hp: number;
  attack: number;
  defense: number;
  howlCooldownMs: number;
  frenzyThresholdPct: number;
  lootTable: BossLootEntry[];
};

export const hollowfangBoss: BossDefinition = {
  id: "hollowfang",
  name: "Hollowfang",
  hp: 500,
  attack: 25,
  defense: 15,
  howlCooldownMs: 6000,
  frenzyThresholdPct: 0.3,
  lootTable: [
    {
      id: "hollowfang-core-tissue",
      name: "Hollowfang Core Tissue",
      rarity: "rare",
      chance: 0.4,
      resourceGrants: { bioSamples: 8, coilboundLattice: 1 },
    },
    {
      id: "ash-pelt-strip",
      name: "Ash Pelt Strip",
      rarity: "uncommon",
      chance: 0.6,
      resourceGrants: { scrapAlloy: 10, ironOre: 6 },
    },
    {
      id: "howl-gland",
      name: "Howl Gland",
      rarity: "rare",
      chance: 0.3,
      resourceGrants: { bioSamples: 10 },
    },
    {
      id: "fen-scar-marrow",
      name: "Fen-Scar Marrow",
      rarity: "epic",
      chance: 0.15,
      resourceGrants: { emberCore: 2, runeDust: 8 },
    },
    {
      id: "resonance-alpha-fang",
      name: "Resonance Alpha Fang",
      rarity: "legendary",
      chance: 0.05,
      resourceGrants: { vaultLatticeShard: 1, runeDust: 12 },
    },
  ],
};

