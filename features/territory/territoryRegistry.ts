/**
 * Territory Registry — seeded canonical territories.
 *
 * Canon anchors (every name below cited in-line):
 * - lore-canon/CLAUDE.md — "The Four Territories: Verdant Coil, Chrome Synod,
 *   Ember Vault, Black City (neutral)"
 * - lore-canon/01 Master Canon/Empires/The Three Empires.md
 * - lore-canon/01 Master Canon/Locations/Black City.md (via CLAUDE.md reference)
 * - lore-canon/01 Master Canon/Locations/Black Market.md
 * - lore-canon/01 Master Canon/Locations/Black Market Lanes.md
 *     Seven lanes: Arena of Blood (Wrath), Feast Hall (Gluttony),
 *     Mirror House (Envy), Velvet Den (Lust), Golden Bazaar (Greed),
 *     Ivory Tower (Pride), Silent Garden (Sloth).
 *
 * This file only exports canonical starter territories. Invention is
 * forbidden; each name is traceable to the source above.
 */

import type { Territory } from "./territoryTypes";

const EMPIRE_SRC =
  "lore-canon/01 Master Canon/Empires/The Three Empires.md";
const BLACK_CITY_SRC = "lore-canon/CLAUDE.md (Four Territories)";
const LANES_SRC =
  "lore-canon/01 Master Canon/Locations/Black Market Lanes.md";
const MARKET_SRC = "lore-canon/01 Master Canon/Locations/Black Market.md";

/** Canonical starter set — three empire seats + Black City + four Black Market lanes. */
export const CANONICAL_TERRITORIES: readonly Territory[] = [
  {
    id: "verdant-coil",
    name: "Verdant Coil",
    owner: { kind: "empire", id: "verdant-coil" },
    anchorEmpire: "verdant-coil",
    schoolTheme: "bio",
    stability: 0.72,
    garrison: 120,
    tributeRate: { bioSamples: 6, bloodvein: 1, credits: 40 },
    flavor:
      "The Verdant Coil feeds on instinct and mutation; its borders pulse with living thorn-walls.",
    canonSource: EMPIRE_SRC,
  },
  {
    id: "chrome-synod",
    name: "Chrome Synod",
    owner: { kind: "empire", id: "chrome-synod" },
    anchorEmpire: "chrome-synod",
    schoolTheme: "mecha",
    stability: 0.78,
    garrison: 140,
    tributeRate: { scrapAlloy: 5, ironHeart: 1, credits: 45 },
    flavor:
      "The Chrome Synod answers every question with analysis; its walls are measured in tolerances.",
    canonSource: EMPIRE_SRC,
  },
  {
    id: "ember-vault",
    name: "Ember Vault",
    owner: { kind: "empire", id: "ember-vault" },
    anchorEmpire: "ember-vault",
    schoolTheme: "pure",
    stability: 0.7,
    garrison: 110,
    tributeRate: { emberCore: 4, ashveil: 1, credits: 42 },
    flavor:
      "The Ember Vault keeps the flames of inherited memory; its law-stone remembers every trespass.",
    canonSource: EMPIRE_SRC,
  },
  {
    id: "black-city",
    name: "Black City",
    owner: { kind: "empire", id: "black-city" },
    anchorEmpire: "black-city",
    schoolTheme: "neutral",
    stability: 0.5,
    garrison: 80,
    tributeRate: { credits: 60, meldshard: 1 },
    flavor:
      "Black City belongs to no empire — only to the survivors who keep its lanes moving.",
    canonSource: BLACK_CITY_SRC,
  },
  // Black Market Lanes — canonical sin-lanes. Anchor empire is Black City.
  {
    id: "arena-of-blood",
    name: "Arena of Blood",
    owner: { kind: "empire", id: "black-city" },
    anchorEmpire: "black-city",
    schoolTheme: "bio",
    stability: 0.45,
    garrison: 60,
    tributeRate: { credits: 30, bioSamples: 2 },
    flavor:
      "The Wrath lane — blood-sand and broker-posted bounties; the Verdant Coil recruits here in the dark.",
    canonSource: LANES_SRC,
  },
  {
    id: "golden-bazaar",
    name: "Golden Bazaar",
    owner: { kind: "empire", id: "black-city" },
    anchorEmpire: "black-city",
    schoolTheme: "neutral",
    stability: 0.55,
    garrison: 55,
    tributeRate: { credits: 70 },
    flavor:
      "The Greed lane — every empire's coin changes hands here, and none of it stays clean.",
    canonSource: LANES_SRC,
  },
  {
    id: "ivory-tower",
    name: "Ivory Tower",
    owner: { kind: "empire", id: "black-city" },
    anchorEmpire: "black-city",
    schoolTheme: "pure",
    stability: 0.6,
    garrison: 65,
    tributeRate: { credits: 35, veilAsh: 1 },
    flavor:
      "The Pride lane — Ember Vault dissenters and Chrome Synod exiles trade certainties like contraband.",
    canonSource: LANES_SRC,
  },
  {
    id: "silent-garden",
    name: "Silent Garden",
    owner: { kind: "empire", id: "black-city" },
    anchorEmpire: "black-city",
    schoolTheme: "neutral",
    stability: 0.65,
    garrison: 50,
    tributeRate: { credits: 25, mossRations: 3 },
    flavor:
      "The Sloth lane — the Black Market's quietest corner, where nothing moves and everything listens.",
    canonSource: MARKET_SRC,
  },
];

/** Lookup by id. Returns a frozen snapshot clone so callers can mutate safely. */
export function getTerritoryById(id: string): Territory | null {
  const hit = CANONICAL_TERRITORIES.find((t) => t.id === id);
  return hit ? cloneTerritory(hit) : null;
}

/** Full cloned registry — use as the initial state for a new run. */
export function makeTerritoryRegistry(): Territory[] {
  return CANONICAL_TERRITORIES.map(cloneTerritory);
}

function cloneTerritory(t: Territory): Territory {
  return {
    ...t,
    tributeRate: { ...t.tributeRate },
    owner: { ...t.owner },
  };
}
