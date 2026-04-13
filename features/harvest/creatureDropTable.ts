/**
 * Block 4 Task 4.2 — per-creature drop table (pure).
 *
 * Given (creatureId, bodyRegion) returns candidate parts with rarity
 * weights. Kill method + profession rank gating happens in harvestAction,
 * not here — this file only exposes the region-sliced candidate pool.
 */

import type {
  BodyRegion,
  CreaturePart,
  CreaturePartRarity,
  CreatureId,
} from "@/features/harvest/trophyTypes";
import { CREATURE_PARTS } from "@/features/harvest/creaturePartRegistry";

/** Weight by rarity — higher = more likely to roll. */
const RARITY_WEIGHT: Record<CreaturePartRarity, number> = {
  common: 60,
  uncommon: 30,
  rare: 10,
  epic: 4,
  legendary: 1,
};

export type DropCandidate = {
  part: CreaturePart;
  /** Pre-profession weight contribution. */
  weight: number;
};

/**
 * Pure function: candidate parts for a creature + body region.
 * Does NOT apply kill-method or profession-rank gates — the caller
 * (harvestAction) filters by those.
 */
export function getDropCandidates(
  creatureId: CreatureId,
  bodyRegion: BodyRegion,
): DropCandidate[] {
  return CREATURE_PARTS.filter(
    (p) => p.sourceCreature === creatureId && p.bodyRegion === bodyRegion,
  ).map((part) => ({ part, weight: RARITY_WEIGHT[part.rarity] }));
}

/** All regions this creature has any part for — UI hint. */
export function getRegionsForCreature(
  creatureId: CreatureId,
): BodyRegion[] {
  const regions = new Set<BodyRegion>();
  for (const p of CREATURE_PARTS) {
    if (p.sourceCreature === creatureId) regions.add(p.bodyRegion);
  }
  return [...regions];
}

/** Exposed for tests / tuning. */
export function getRarityWeight(rarity: CreaturePartRarity): number {
  return RARITY_WEIGHT[rarity];
}
