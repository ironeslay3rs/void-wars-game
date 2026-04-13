/**
 * Rune set detection — public facade.
 *
 * The detection math lives in `runeSetDetection.ts` (kept there because
 * several existing call sites already import from that path). This module
 * is the canonical name per Active-Sprint §3.2 deliverables, and
 * re-exports the set-detection API plus a couple of player-level helpers
 * that compose set activations with progression context.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Runes/Rune System.md
 *       "Rune sets unlock extra effects when completed." Sevenfold
 *       ladder: L1 standard → L5 mythical. This slice covers the
 *       L2 Executional (2-set) and L3 Rare (3-set) bands.
 *
 * Pure re-export module — no side effects.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  countActiveRuneSets,
  detectRuneSets,
  getRuneSetRewardMultiplier,
  RUNE_SET_REWARD_BONUS_MAX_PCT,
  RUNE_SET_TIER_2_REWARD_BONUS_PCT,
  RUNE_SET_TIER_2_THRESHOLD,
  RUNE_SET_TIER_3_REWARD_BONUS_PCT,
  RUNE_SET_TIER_3_THRESHOLD,
  type RuneSetActivation,
} from "@/features/mastery/runeSetDetection";

export {
  countActiveRuneSets,
  detectRuneSets,
  getRuneSetRewardMultiplier,
  RUNE_SET_REWARD_BONUS_MAX_PCT,
  RUNE_SET_TIER_2_REWARD_BONUS_PCT,
  RUNE_SET_TIER_2_THRESHOLD,
  RUNE_SET_TIER_3_REWARD_BONUS_PCT,
  RUNE_SET_TIER_3_THRESHOLD,
  type RuneSetActivation,
};

/** Convenience: detect set activations directly from a PlayerState. */
export function detectPlayerRuneSets(player: PlayerState): RuneSetActivation[] {
  return detectRuneSets(player.runeMastery);
}

/**
 * Does the given school currently have an active set bonus (tier 2 or 3)?
 * Used by UI chips and combat effect hooks.
 */
export function hasActiveSetFor(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
): boolean {
  return detectRuneSets(mastery).some((s) => s.school === school);
}

/**
 * Return the active set activation for a school, or null if none.
 */
export function getActiveSetFor(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
): RuneSetActivation | null {
  return detectRuneSets(mastery).find((s) => s.school === school) ?? null;
}
