/**
 * School types — the regional doctrine layer.
 *
 * Canon: docs/7-school-gameplay-spine.md + lore-canon/01 Master Canon/Sins/.
 *
 * Each school is the public-face institution of one capital sin, anchored in
 * one nation/pantheon, and parented by one of the three empires. Each school
 * also pairs with a black market lane (its shadow face inside Blackcity).
 *
 * Total: 7 schools (one per capital sin).
 */

import type { EmpireId } from "@/features/empires/empireTypes";
import type { MissionOriginTagId } from "@/features/game/gameTypes";

/** Canonical 7 schools — IDs use kebab-case for URL slugs. */
export type SchoolId =
  | "bonehowl-of-fenrir"
  | "mouth-of-inti"
  | "flesh-thrones-of-olympus"
  | "crimson-altars-of-astarte"
  | "thousand-hands-of-vishrava"
  | "divine-pharos-of-ra"
  | "clockwork-mandate-of-heaven";

/** Capital sins — canonical seven. */
export type SinId =
  | "wrath"
  | "gluttony"
  | "envy"
  | "lust"
  | "greed"
  | "pride"
  | "sloth";

/** Black market lane ids — paired one-to-one with sins. */
export type BlackMarketLaneId =
  | "arena-of-blood"
  | "feast-hall"
  | "mirror-house"
  | "velvet-den"
  | "golden-bazaar"
  | "ivory-tower"
  | "silent-garden";

/** Region pressure identity per docs/7-school-gameplay-spine.md. */
export type PressureIdentity =
  | "escalation"
  | "consumption"
  | "comparison"
  | "temptation"
  | "hoarding"
  | "exposure"
  | "delay";

/** Crafting countermeasure style per docs/7-school-gameplay-spine.md. */
export type CountermeasureStyle =
  | "burst-sustain-disengage"
  | "efficiency-conversion"
  | "modular-swap"
  | "cleansing-boon"
  | "compression-protect"
  | "shielding-anti-mark"
  | "tempo-restoration";

export type School = {
  id: SchoolId;
  /** Display name (full canonical title). */
  name: string;
  /** Short name (without "of X" suffix) for tight UI. */
  shortName: string;
  /** The capital sin this school is the public face of. */
  sin: SinId;
  /** Display name for the sin. */
  sinDisplay: string;
  /** Anchor nation (modern country). */
  nation: string;
  /** Pantheon family (mythological tradition). */
  pantheon: string;
  /** Parent empire. */
  empireId: EmpireId;
  /** Paired black market lane (shadow face). */
  laneId: BlackMarketLaneId;
  /** Lane display name (denormalized for convenience). */
  laneDisplay: string;
  /** Lane route (denormalized for convenience). */
  laneRoute: string;
  /** Region pressure identity (felt gameplay pressure type). */
  pressure: PressureIdentity;
  /** Crafting countermeasure style players want before entering. */
  countermeasure: CountermeasureStyle;
  /** Mission origin tag ids that resolve to this school. */
  originTagIds: MissionOriginTagId[];
  /** One-sentence school identity / what they teach. */
  tagline: string;
  /** Long-form lore for the HQ page. */
  longForm: string;
  /** Doctrine breakthrough condition (how the player wins against this region's boss). */
  breakthrough: string;
  /** Accent color for school theming. */
  accentHex: string;
};
