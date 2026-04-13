import type { PathType, ResourceKey } from "@/features/game/gameTypes";

/**
 * CANON CURRENCY HIERARCHY (from the novels):
 *   Book canon:    Sinful Coin (market), Ichor (Bio), Soul Crystals (Pure), Ironheart (Mecha)
 *   Street slang:  "credits" (informal Sinful Coin, used in Puppy Vol.1)
 *   Session layer: Black Marks, Bloodvein/Veinshards, Ashveil/Veil Ash, Heart-Iron
 *                  (March 17 game design session — adaptation names, NOT book canon)
 *   Premium:       Market Sigils (game-specific, USD purchase)
 *
 * CANON SOURCE: Evolution_VoidWars_Book4_FINAL.docx — "Ironheart. Ichor. Soul Crystals. Sinful Coin."
 */

export type ResourceFlavor = {
  displayName: string;
  flavorLine: string;
  originHint: string;
  school: PathType | "neutral";
};

const resourceFlavors: Record<ResourceKey, ResourceFlavor> = {
  // CANON SOURCE: Book 4 line 28 — "Ironheart. Ichor. Soul Crystals. Sinful Coin."
  // NOTE: "credits" is the street-level informal term (see Puppy Vol.1 — "thousand credits")
  credits: {
    displayName: "Sinful Coin",
    flavorLine: "Blackcity money does not pretend to be clean. It pretends to be necessary.",
    originHint: "Black Market / Blackcity",
    school: "neutral",
  },
  // Canon (vault CLAUDE.md): "Black Marks = daily city trade".
  // Session-layer currency — distinct from Sinful Coin. Earned + spent
  // at broker stalls; never at the War Exchange or faction HQs.
  blackMarks: {
    displayName: "Black Marks",
    flavorLine: "Paper chits with no seal — the daily currency of stall commerce. Everyone takes them. Nobody owes on them.",
    originHint: "Broker stalls / daily trade",
    school: "neutral",
  },
  ironOre: {
    // NON-CANON PLACEHOLDER — no book source for this resource name
    displayName: "Iron Ore",
    flavorLine: "Raw metal pulled from the void's edge. Every forge in the district needs it.",
    originHint: "Common salvage",
    school: "neutral",
  },
  scrapAlloy: {
    // NON-CANON PLACEHOLDER — game-specific adaptation name
    displayName: "Pharos Scrap",
    flavorLine: "Frame-grade alloy, serial numbers filed off. The Foundry knows what to do with it.",
    originHint: "Mecha / Chrome Synod",
    school: "mecha",
  },
  // CANON SOURCE: Books 4-6 — "no bigger than molars, clouded at the edges"
  runeDust: {
    displayName: "Soul Crystals",
    flavorLine: "Fragments of divine law-memory. Clouded at the edges where someone held them for too long.",
    originHint: "Pure / Ember Vault",
    school: "pure",
  },
  emberCore: {
    // NON-CANON PLACEHOLDER — game-specific adaptation name
    displayName: "Ember Core",
    flavorLine: "Concentrated soul-fire from deep resonance forging. The candle row dealers pay premium.",
    originHint: "Pure / Ember Vault",
    school: "pure",
  },
  // CANON SOURCE: Books 4-6 — Bio empire currency, tied to biological harvest and mutation
  bioSamples: {
    displayName: "Ichor",
    flavorLine: "Biological harvest from the hunting grounds. Your blood knows what this is.",
    originHint: "Bio / Verdant Coil",
    school: "bio",
  },
  mossRations: {
    // NON-CANON PLACEHOLDER — game-specific adaptation name
    displayName: "Void Moss Rations",
    flavorLine: "The Black Market's staple food. Tastes like nothing. Keeps you alive.",
    originHint: "Blackcity local",
    school: "neutral",
  },
  coilboundLattice: {
    // NON-CANON PLACEHOLDER — game-specific boss drop
    displayName: "Coilbound Lattice",
    flavorLine: "Living metal woven with Verdant Coil growth patterns. It pulses when you hold it.",
    originHint: "Boss drop / Bio elite",
    school: "bio",
  },
  ashSynodRelic: {
    // NON-CANON PLACEHOLDER — game-specific boss drop
    displayName: "Ash Synod Relic",
    flavorLine: "A Chrome Synod artifact fused with Ember Vault fire. Both schools claim ownership.",
    originHint: "Boss drop / Hybrid",
    school: "mecha",
  },
  vaultLatticeShard: {
    // NON-CANON PLACEHOLDER — game-specific boss drop
    displayName: "Vault Lattice Shard",
    flavorLine: "A fragment of the Ember Vault's inner architecture. It remembers the forge that shaped it.",
    originHint: "Boss drop / Pure elite",
    school: "pure",
  },
  // CANON SOURCE: Book 2 — "Ironheart is not a metal. It is called a metal."
  ironHeart: {
    displayName: "Ironheart",
    flavorLine: "Not a metal. It is called a metal. But Ironheart remembers being something else.",
    originHint: "Mecha / Chrome Synod",
    school: "neutral",
  },
};

export function getResourceFlavor(key: ResourceKey): ResourceFlavor {
  return resourceFlavors[key];
}

export function getResourceDisplayName(key: ResourceKey): string {
  return resourceFlavors[key].displayName;
}
