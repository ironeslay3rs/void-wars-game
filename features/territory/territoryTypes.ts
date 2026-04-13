/**
 * Territory War System — shared types.
 *
 * Fusion pillar: Vampire Wars-style war pressure — territorial friction,
 * economic pressure, siege. Void Wars canon first.
 *
 * Canon anchors:
 * - lore-canon/CLAUDE.md
 *     "The Four Territories: Verdant Coil, Chrome Synod, Ember Vault,
 *      Black City (neutral)"
 * - lore-canon/01 Master Canon/Empires/The Three Empires.md
 *     "The war between them never fully ends."
 * - lore-canon/01 Master Canon/Locations/Black Market Lanes.md
 *     Seven sin-themed lanes — social/economic/political zones.
 * - lore-canon/01 Master Canon/Locations/Black Market.md
 *     Neutral meeting ground, survivor city.
 *
 * All types are pure data. No runtime coupling to reducers or networking.
 */

import type { ResourceKey } from "@/features/game/gameTypes";

/** Canonical school theme for a territory. */
export type TerritorySchoolTheme = "bio" | "mecha" | "pure" | "neutral";

/** Canonical empire identity used in UI-facing flavor. */
export type EmpireId =
  | "verdant-coil"
  | "chrome-synod"
  | "ember-vault"
  /** Black City is canonically neutral — no empire owns it. */
  | "black-city";

/** Owner of a territory: an empire or a player/NPC guild. */
export type TerritoryOwner =
  | { kind: "empire"; id: EmpireId }
  | { kind: "guild"; id: string };

/**
 * A Territory — political/economic zone that can be contested.
 * Canon names only. Do not invent. See territoryRegistry.ts.
 */
export type Territory = {
  id: string;
  /** Canonical display name sourced from lore-canon. */
  name: string;
  /** Current controller. May flip on siege outcome. */
  owner: TerritoryOwner;
  /** Empire the territory is culturally anchored to (may differ from owner). */
  anchorEmpire: EmpireId;
  /** School theme flavor for loot / pressure routing. */
  schoolTheme: TerritorySchoolTheme;
  /** 0..1 — how stable control is. Low stability raises raid risk. */
  stability: number;
  /** Defenders on hand. Scales siege damage absorption. */
  garrison: number;
  /** Per-tick tribute the controller banks while stable. Keyed to resources. */
  tributeRate: Partial<Record<ResourceKey, number>>;
  /** Canon flavor blurb — short UI string. Uses empire names, not "Bio/Mecha/Pure". */
  flavor: string;
  /** Canon source path for citation. */
  canonSource: string;
};

/** Phases a war progresses through. Pure state machine. */
export type WarPhase = "skirmish" | "siege" | "assault" | "resolved";

/** A war between two parties contesting a territory. */
export type War = {
  id: string;
  territoryId: string;
  attacker: TerritoryOwner;
  defender: TerritoryOwner;
  phase: WarPhase;
  /** Ticks elapsed since war started. */
  ticks: number;
  /** -1..+1 — negative favors defender, positive favors attacker. */
  momentum: number;
};

/** Outcome of a single seeded siege tick. */
export type SiegeOutcome = {
  /** Who won this tick's exchange. Null on stalemate. */
  winner: TerritoryOwner | null;
  /** Damage dealt to the defender garrison this tick. */
  damage: number;
  /** Delta applied to territory stability (-1..+1 range). */
  stabilityDelta: number;
  /** Tribute-rate swing toward the winner (fraction of one tick). */
  tributeSwing: number;
  /** Updated momentum after this tick. */
  momentum: number;
  /** Whether the siege resolved this tick (territory flips or attacker routed). */
  resolved: boolean;
  /** New owner if resolved with a flip; else null. */
  newOwner: TerritoryOwner | null;
  /** Short flavor string for logs. Uses canon empire names. */
  flavor: string;
};

/** Economic pressure on the player derived from world war-state. */
export type EconomyPressure = {
  /** Multiplier on income sources. 1 = neutral. <1 = squeezed. */
  incomeMult: number;
  /** Multiplier on market prices. >1 = inflated wartime prices. */
  priceMult: number;
  /** 0..1 — chance a raid tick triggers this cycle. */
  raidRisk: number;
  /** Count of active wars contributing to pressure. */
  activeWars: number;
  /** Average stability across the tracked territories. 0..1. */
  avgStability: number;
};

/** Outcome of a single seeded raid tick. */
export type RaidOutcome = {
  /** Which territory was raided. */
  territoryId: string;
  /** Whether the raid landed (seeded vs. raidRisk). */
  landed: boolean;
  /** Resources drained from defender tribute this tick. */
  loot: Partial<Record<ResourceKey, number>>;
  /** Stability loss inflicted on the defender (0..1). */
  stabilityLoss: number;
  /** Short flavor string for logs. */
  flavor: string;
};
