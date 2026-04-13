/**
 * Canonical rune-set levels.
 *
 * Canon source: `lore-canon/01 Master Canon/Runes/Rune System.md`
 *   "Level 1 rune sets are standard for war.
 *    Level 2 rune sets are Executional Rune Sets.
 *    Level 3 rune sets are rare.
 *    Level 4 rune sets are nearly impossible to acquire.
 *    Level 5 rune sets are mythical.
 *    Level 6 and above are beyond normal creation inside the Void."
 *
 * The existing `runeSetDetection` tracked sets by DEPTH (how many minors
 * in one school). Canon tracks sets by LEVEL (rarity). This module maps
 * current detection to the canon level scale and adds the first new
 * level — L3 Rare — which requires hybrid progression across all three
 * schools. That's a real gameplay incentive for balanced builds the
 * earlier tier system didn't reward.
 *
 * Level 4+ are future work — canon says L4 is "nearly impossible" and
 * L5 is "mythical," which warrants dedicated quest-style unlocks, not
 * passive detection.
 */

import type { PlayerRuneMasteryState, RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import { detectRuneSets } from "@/features/mastery/runeSetDetection";

export type RuneSetLevel = 1 | 2 | 3;

export const RUNE_SET_LEVEL_LABEL: Record<RuneSetLevel, string> = {
  1: "Standard War",
  2: "Executional",
  3: "Rare",
};

/** Player must have ≥ this many minors in EVERY school to qualify for L3. */
export const RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL = 2;

/** L3 Rare reward bonus — added on top of existing tier bonuses. */
export const RUNE_SET_LEVEL_3_BONUS_PCT = 6;

export type RuneSetLevelActivation = {
  level: RuneSetLevel;
  label: string;
  /** Per-school rollup for L1 and L2; null for L3 (multi-school). */
  school: RuneSchool | null;
  /** Additional reward bonus for this level. */
  bonusPct: number;
};

/**
 * Returns the canonical level classification of the player's active
 * rune builds. L1 and L2 come from the existing tier detection; L3
 * fires independently when hybrid progression lands.
 *
 * A single school at 3-minor depth contributes one L2 activation.
 * Holding 2+ minors in ALL three schools additionally contributes one
 * L3 activation — the canonical "rare" tier.
 */
export function detectRuneSetLevels(
  mastery: PlayerRuneMasteryState,
): RuneSetLevelActivation[] {
  const out: RuneSetLevelActivation[] = [];

  // Map existing tier 2/3 detection to canon levels L1/L2.
  const activeSets = detectRuneSets(mastery);
  for (const set of activeSets) {
    if (set.tier === 2) {
      out.push({
        level: 1,
        label: RUNE_SET_LEVEL_LABEL[1],
        school: set.school,
        bonusPct: 0, // Level 1 bonus already counted via tier detection.
      });
    } else if (set.tier === 3) {
      out.push({
        level: 2,
        label: RUNE_SET_LEVEL_LABEL[2],
        school: set.school,
        bonusPct: 0, // Level 2 bonus already counted via tier detection.
      });
    }
  }

  // L3 Rare — balanced hybrid progression across all 3 schools.
  const allSchoolsQualified = RUNE_SCHOOLS.every(
    (s) =>
      (mastery.minorCountBySchool[s] ?? 0) >=
      RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
  );
  if (allSchoolsQualified) {
    out.push({
      level: 3,
      label: RUNE_SET_LEVEL_LABEL[3],
      school: null,
      bonusPct: RUNE_SET_LEVEL_3_BONUS_PCT,
    });
  }

  return out;
}

/**
 * Additional reward multiplier contributed by canon rune set levels
 * beyond what tier detection already provides. Currently only L3
 * contributes — L1 and L2 are canon labels for the existing tier
 * detection, not new bonuses on top of it.
 */
export function getRuneSetLevelRewardMultiplier(
  mastery: PlayerRuneMasteryState,
): number {
  const levels = detectRuneSetLevels(mastery);
  const totalPct = levels.reduce((acc, l) => acc + l.bonusPct, 0);
  return 1 + totalPct / 100;
}

/** Convenience selector — does the player currently hold the Rare tier? */
export function isRareRuneSetActive(
  mastery: PlayerRuneMasteryState,
): boolean {
  return detectRuneSetLevels(mastery).some((l) => l.level === 3);
}
