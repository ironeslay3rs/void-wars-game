/**
 * Pantheon reward layer — first concrete pantheon mechanic.
 *
 * Visiting your aligned pantheon's HQ in Blackcity grants a one-shot
 * blessing token (`PlayerState.pantheonBlessingPending`). The token is
 * consumed by the next mission settlement and grants a flat reward
 * bonus (`PANTHEON_BLESSING_REWARD_BONUS_PCT`).
 *
 * Foundation slice — single bonus, single consumer. Future work can
 * differentiate per pantheon (Norse pantheon → +damage, Hindu pantheon
 * → +loot, etc.) when canon spec on pantheon mechanics matures.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import { getPantheonForSchool } from "@/features/pantheons/pantheonSelectors";
import type { PantheonId } from "@/features/pantheons/pantheonTypes";
import type { SchoolId } from "@/features/schools/schoolTypes";

/** Flat reward bonus on the next mission settle when the blessing fires. */
export const PANTHEON_BLESSING_REWARD_BONUS_PCT = 10;

/**
 * Resolve which pantheon the player is currently aligned with via their
 * affinity school. Returns null when the player has no affinity (legacy
 * saves or unbound).
 */
export function getPlayerAlignedPantheonId(
  player: Pick<PlayerState, "affinitySchoolId">,
): PantheonId | null {
  if (!player.affinitySchoolId) return null;
  const pantheon = getPantheonForSchool(player.affinitySchoolId as SchoolId);
  return pantheon ? pantheon.id : null;
}

export function isPlayerAlignedPantheon(
  player: Pick<PlayerState, "affinitySchoolId">,
  pantheonId: PantheonId,
): boolean {
  return getPlayerAlignedPantheonId(player) === pantheonId;
}

/**
 * Reward bonus multiplier to apply on mission settlement when the
 * blessing is pending. Returns 1 when no blessing is pending.
 */
export function getPantheonBlessingRewardMultiplier(
  player: Pick<PlayerState, "pantheonBlessingPending">,
): number {
  return player.pantheonBlessingPending
    ? 1 + PANTHEON_BLESSING_REWARD_BONUS_PCT / 100
    : 1;
}
