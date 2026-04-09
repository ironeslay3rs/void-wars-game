import type { PathType } from "@/features/game/gameTypes";

/**
 * The seven nations of the Sevenfold Rune universe.
 * Each nation embodies a deadly sin and aligns with a school.
 * Their wars are distant, but their scraps — failed experiments,
 * smuggled tech, broken relics — wash into the Black Market.
 *
 * CANON STATUS: GAME-SPECIFIC DESIGN
 * The vault (01 Master Canon) lists 7 pantheons (Norse, Greek, Canaanite, Inca,
 * Hindu, Egyptian, Chinese) but the specific nation-to-sin-to-school assignments
 * are NOT finalized in the vault — they are "awaiting assignment." Our mappings
 * below are game-specific design choices made for Void Wars: Oblivion.
 * The sin names and school names are confirmed canonical.
 * The "seat title" names (Bonehowl of Fenrir, etc.) are NON-CANON PLACEHOLDER.
 */

export type NationSin =
  | "wrath"
  | "envy"
  | "lust"
  | "gluttony"
  | "greed"
  | "pride"
  | "sloth";

export type NationId =
  | "norway"
  | "greece"
  | "lebanon"
  | "peru"
  | "india"
  | "egypt"
  | "china";

export type NationEntry = {
  id: NationId;
  name: string;
  sin: NationSin;
  school: PathType;
  seatTitle: string;
  /** What kind of material scraps leak from this nation into the Black Market. */
  materialFlavor: string;
  /** One-line description of what reaches the market from this war. */
  marketLeak: string;
  /** Capacity pool this nation's materials lean toward. */
  capacityLean: "blood" | "frame" | "resonance";
};

export const nations: NationEntry[] = [
  {
    id: "norway",
    name: "Norway",
    sin: "wrath",
    school: "bio",
    seatTitle: "The Bonehowl of Fenrir",
    materialFlavor: "Cold iron, wet fur, beast marrow that your blood already wants.",
    marketLeak: "Wrath-fueled beast war remnants — predator marrow, Fenrir blood vials, and hunting trophies from operatives who didn't come back.",
    capacityLean: "blood",
  },
  {
    id: "greece",
    name: "Greece",
    sin: "envy",
    school: "bio",
    seatTitle: "The Flesh Thrones of Olympus",
    materialFlavor: "Muscle-sculpted tissue, mirror-perfect grafts, jealousy given form.",
    marketLeak: "Failed flesh throne experiments — tissue grafts, DNA mirrors, and castoff mutations from Olympus's beauty-obsessed bio-architects.",
    capacityLean: "blood",
  },
  {
    id: "lebanon",
    name: "Lebanon",
    sin: "lust",
    school: "bio",
    seatTitle: "The Crimson Altars of Astarte",
    materialFlavor: "Desire-tech pheromone arrays, forbidden bio-bonds, pleasure-pain neural bridges.",
    marketLeak: "Crimson Altar contraband — pheromone catalysts, neural-bond tissue, and bio-weapons designed to seduce before they kill.",
    capacityLean: "blood",
  },
  {
    id: "egypt",
    name: "Egypt",
    sin: "pride",
    school: "mecha",
    seatTitle: "The Divine Pharos of Ra",
    materialFlavor: "Sun-forged alloy, divine-grade servomotors, soulless perfection.",
    marketLeak: "Pharos surplus — pristine but soulless Mecha components from Egypt's divine engineers. Every piece works perfectly. None of them feel alive.",
    capacityLean: "frame",
  },
  {
    id: "china",
    name: "China",
    sin: "sloth",
    school: "mecha",
    seatTitle: "The Clockwork Mandate of Heaven",
    materialFlavor: "Patient automation, mandate-grade processors, bureaucratic precision parts.",
    marketLeak: "Mandate salvage — patient, methodical tech from China's clockwork bureaucracy. Slow to arrive, impossible to break.",
    capacityLean: "frame",
  },
  {
    id: "peru",
    name: "Peru",
    sin: "gluttony",
    school: "pure",
    seatTitle: "The Mouth of Inti",
    materialFlavor: "Memory ash, fire-touched relics, soul residue that whispers when you hold it.",
    marketLeak: "Mouth of Inti relics — soul-forged memories and fire-touched artifacts from Peru's Pure tradition. They consume what they touch.",
    capacityLean: "resonance",
  },
  {
    id: "india",
    name: "India",
    sin: "greed",
    school: "pure",
    seatTitle: "The Thousand Hands of Vishrava",
    materialFlavor: "Greed-hoarded spiritual fragments, metaphysical vault shards, accumulated soul weight.",
    marketLeak: "Thousand Hands fragments — greed-hoarded spiritual artifacts from India's metaphysical vaults. Every piece was stolen from someone who needed it more.",
    capacityLean: "resonance",
  },
];

export function getNationById(id: NationId): NationEntry | undefined {
  return nations.find((n) => n.id === id);
}

export function getNationsBySchool(school: PathType): NationEntry[] {
  return nations.filter((n) => n.school === school);
}

export function getNationBySin(sin: NationSin): NationEntry | undefined {
  return nations.find((n) => n.sin === sin);
}

/**
 * Sin lane labels — how each sin manifests as a Black Market district lane.
 * Used by the Black Market map and district flavor.
 */
export const sinLaneLabels: Record<NationSin, { lane: string; verb: string }> = {
  wrath: { lane: "Arena of Blood", verb: "Violent momentum, feral pressure" },
  envy: { lane: "Mirror House", verb: "Rival intel, imitation, comparison" },
  lust: { lane: "Velvet Den", verb: "Allure, temptation, influence" },
  gluttony: { lane: "Feast Hall", verb: "Supply, ration politics, consumption" },
  greed: { lane: "Golden Bazaar", verb: "Trade, pricing, rare procurement" },
  pride: { lane: "Ivory Tower", verb: "Authority, elite negotiation, prestige" },
  sloth: { lane: "Silent Garden", verb: "Patience, hidden observation, slow power" },
};
