import type { MissionReward, ResourceKey } from "@/features/game/gameTypes";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";

/**
 * Exploration reward variance. The base table `phase1ExplorationReward`
 * is flat — every claim grants the same credits/ironOre bundle. This
 * helper rolls a per-claim variance on resource amounts only; rank XP,
 * mastery progress, and influence stay deterministic so progression
 * pacing remains predictable.
 *
 * Variance: ±40% on each resource, floor 1, seeded from the claim
 * timestamp so the outcome is reproducible per-claim (testable) and
 * not twitchy under rerenders.
 *
 * Closes the last 🟡 row on the GSD audit matrix (Exploration /
 * biotech) by giving the loop its missing "why did I get that number"
 * beat without requiring a full random-table system.
 */

export const EXPLORATION_VARIANCE_MIN_PCT = 0.6;
export const EXPLORATION_VARIANCE_MAX_PCT = 1.4;

function seededRoll01(seed: string, salt: string): number {
  const h = voidFieldHashStringToInt(`${seed}-${salt}`);
  return (h % 10_000) / 10_000;
}

function variedAmount(base: number, seed: string, salt: string): number {
  if (base <= 0) return 0;
  const roll = seededRoll01(seed, salt);
  const factor =
    EXPLORATION_VARIANCE_MIN_PCT +
    (EXPLORATION_VARIANCE_MAX_PCT - EXPLORATION_VARIANCE_MIN_PCT) * roll;
  return Math.max(1, Math.round(base * factor));
}

export function rollExplorationReward(
  base: MissionReward,
  seed: string,
): MissionReward {
  const baseResources = base.resources ?? {};
  const nextResources: Partial<Record<ResourceKey, number>> = {};

  for (const [key, amount] of Object.entries(baseResources)) {
    if (typeof amount !== "number") continue;
    nextResources[key as ResourceKey] = variedAmount(amount, seed, key);
  }

  return {
    ...base,
    resources: nextResources as MissionReward["resources"],
  };
}
