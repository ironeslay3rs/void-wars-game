/**
 * Block 4 Task 4.2 — Monster Hunter Trophy & Harvest System.
 *
 * Shared types for the harvest slice. Pure data only.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Schools/The Three Evolution Schools.md
 *     (Bio / Mecha / Pure identities)
 *   - lore-canon/01 Master Canon/Empires/The Three Empires.md
 *     (Verdant Coil / Chrome Synod / Ember Vault flavor)
 *   - lore-canon/CLAUDE.md — "Pure" never "Spirit"; Black City neutral.
 *   - lore-canon/01 Master Canon/Creatures/ (folder exists; Hollowfang is
 *     a design inference, see features/hollowfang/hollowfangProfile.ts).
 */

import type { PathType } from "@/features/game/gameTypes";

/** Which anatomical region the harvester targeted. */
export type BodyRegion = "head" | "torso" | "limbs" | "organs";

/** How the creature died — gates rare drops. */
export type KillMethod = "clean" | "brutal" | "finisher" | "environmental";

/** Broad classification of the harvested part. */
export type CreaturePartKind =
  | "organ"
  | "bone"
  | "hide"
  | "gland"
  | "fang"
  | "blood"
  | "circuit"
  | "core"
  | "plate"
  | "shard"
  | "fragment"
  | "crystal"
  | "pearl"
  | "dust"
  | "essence";

export type CreaturePartRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

/**
 * Creature identifier. Strings (not an enum) so the slice can be extended
 * without cross-module churn. Canon names kept verbatim.
 */
export type CreatureId =
  | "verdant-stalker"
  | "coil-broodling"
  | "blood-tithe-boar"
  | "synod-sentry"
  | "chrome-scuttler"
  | "synod-archon"
  | "ashveil-echo"
  | "ember-oracle"
  | "vault-wisp"
  | "hollowfang";

/** A single harvestable part definition. */
export type CreaturePart = {
  id: string;
  displayName: string;
  /** School identity — drives crafting tab routing and flavor. */
  school: PathType;
  kind: CreaturePartKind;
  rarity: CreaturePartRarity;
  sourceCreature: CreatureId;
  /** Region that can yield this part. */
  bodyRegion: BodyRegion;
  /** Short in-world flavor line. */
  flavor: string;
  /**
   * If set, harvesting this part requires at least this kill method.
   * (e.g. "finisher" — rewards disciplined combat).
   */
  requiredKillMethod?: KillMethod;
  /** Minimum profession rank to ever roll this part. */
  minProfessionRank?: number;
  /** True for unique boss trophies (single-copy style flavor). */
  uniqueTrophy?: boolean;
};

/** Input to a harvest attempt. */
export type HarvestAttempt = {
  creatureId: CreatureId;
  bodyRegion: BodyRegion;
  killMethod: KillMethod;
  /** 0..10 harvester profession rank. */
  professionRank: number;
  /** Deterministic seed (see mulberry32 pattern in arena/combatResolver). */
  seed: number;
};

/** A harvested part with the roll context it came from. */
export type HarvestedPart = {
  partId: string;
  displayName: string;
  rarity: CreaturePartRarity;
  school: PathType;
  sourceCreature: CreatureId;
  /** Region that actually produced the drop. */
  bodyRegion: BodyRegion;
};

export type HarvestOutcome = {
  attempt: HarvestAttempt;
  parts: HarvestedPart[];
  /** Short battle-log/breadcrumb lines for UI. */
  notes: string[];
  /** True if no parts rolled (still valid, not an error). */
  empty: boolean;
};
