/**
 * Rune set detection — first explicit "you assembled a coherent rune
 * loadout" payoff. Sits on top of the existing per-school minor counts
 * (`PlayerRuneMasteryState.minorCountBySchool`).
 *
 * - 2-set: any school with >=2 minors installed → small reward bonus
 * - 3-set: any school with >=3 minors installed → larger reward bonus
 *   (NOTE: 3-set detection subsumes 2-set; a school with 4 minors
 *   counts as ONE active set at the highest tier it qualifies for, not
 *   both. Each school contributes at most one active set bonus.)
 *
 * The bonus is applied as a flat reward multiplier in the mission
 * settle pipeline alongside the pantheon + institutional pressures.
 * Set bonuses are deliberately small (2-4%) so they compose with the
 * existing modifiers without dominating them.
 *
 * Closes the §3 gap "Mastery functional layer — set tiers" by giving
 * the rune mastery slice a directly-felt economic verb. Foundation
 * slice — only one bonus type wired (mission rewards). Combat /
 * crafting set bonuses are M3+ work.
 */

import type { PlayerRuneMasteryState, RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";

export const RUNE_SET_TIER_2_THRESHOLD = 2;
export const RUNE_SET_TIER_3_THRESHOLD = 3;

export const RUNE_SET_TIER_2_REWARD_BONUS_PCT = 2;
export const RUNE_SET_TIER_3_REWARD_BONUS_PCT = 4;

export type RuneSetActivation = {
  school: RuneSchool;
  /** 2 or 3 — the highest tier this school qualifies for. */
  tier: 2 | 3;
  /** Flat percentage bonus this set contributes to mission rewards. */
  rewardBonusPct: number;
};

/**
 * Returns the active rune sets across all 3 schools. Each school
 * contributes at most one entry — the highest tier it qualifies for.
 * Schools with fewer than 2 minors are skipped entirely.
 */
export function detectRuneSets(
  mastery: PlayerRuneMasteryState,
): RuneSetActivation[] {
  const out: RuneSetActivation[] = [];
  for (const school of RUNE_SCHOOLS) {
    const minors = mastery.minorCountBySchool[school] ?? 0;
    if (minors >= RUNE_SET_TIER_3_THRESHOLD) {
      out.push({
        school,
        tier: 3,
        rewardBonusPct: RUNE_SET_TIER_3_REWARD_BONUS_PCT,
      });
    } else if (minors >= RUNE_SET_TIER_2_THRESHOLD) {
      out.push({
        school,
        tier: 2,
        rewardBonusPct: RUNE_SET_TIER_2_REWARD_BONUS_PCT,
      });
    }
  }
  return out;
}

/**
 * Composite reward multiplier from all active rune sets. Sums the
 * percentage bonuses from every active set, capped at 12% to keep the
 * combined effect inside the small nudge band even if all 3 schools
 * are at 3-set tier (3 × 4% = 12%, exactly the cap).
 */
export const RUNE_SET_REWARD_BONUS_MAX_PCT = 12;

export function getRuneSetRewardMultiplier(
  mastery: PlayerRuneMasteryState,
): number {
  const sets = detectRuneSets(mastery);
  if (sets.length === 0) return 1;
  const totalPct = sets.reduce((acc, set) => acc + set.rewardBonusPct, 0);
  const cappedPct = Math.min(RUNE_SET_REWARD_BONUS_MAX_PCT, totalPct);
  return 1 + cappedPct / 100;
}

/**
 * Convenience: count active sets at each tier separately. Used by UI
 * for chip labels and tooltips.
 */
export function countActiveRuneSets(mastery: PlayerRuneMasteryState): {
  twoSets: number;
  threeSets: number;
  total: number;
} {
  const sets = detectRuneSets(mastery);
  const twoSets = sets.filter((s) => s.tier === 2).length;
  const threeSets = sets.filter((s) => s.tier === 3).length;
  return { twoSets, threeSets, total: sets.length };
}
