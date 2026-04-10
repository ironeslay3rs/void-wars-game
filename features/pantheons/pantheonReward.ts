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

import type {
  MissionOriginTagId,
  PlayerState,
} from "@/features/game/gameTypes";
import { getPantheonForSchool } from "@/features/pantheons/pantheonSelectors";
import type { PantheonId } from "@/features/pantheons/pantheonTypes";
import { getSchoolForOriginTag } from "@/features/schools/schoolSelectors";
import type { SchoolId } from "@/features/schools/schoolTypes";

/** Flat reward bonus on the next mission settle when the blessing fires. */
export const PANTHEON_BLESSING_REWARD_BONUS_PCT = 10;

/**
 * Flat reward bonus when a mission's origin tag resolves to the player's
 * aligned pantheon. Smaller than the visit blessing because it fires on
 * every matching mission rather than once per visit.
 */
export const PANTHEON_MATCH_REWARD_BONUS_PCT = 5;

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

/**
 * Reward bonus multiplier when a mission's origin tag resolves to the
 * same school (and therefore pantheon, since the join is 1:1) as the
 * player's affinity. Returns 1 when there's no match.
 */
export function getPantheonMatchRewardMultiplier(
  player: Pick<PlayerState, "affinitySchoolId">,
  originTagId: MissionOriginTagId | undefined,
): number {
  if (!originTagId) return 1;
  if (!player.affinitySchoolId) return 1;
  const originSchool = getSchoolForOriginTag(originTagId);
  if (!originSchool) return 1;
  return originSchool.id === player.affinitySchoolId
    ? 1 + PANTHEON_MATCH_REWARD_BONUS_PCT / 100
    : 1;
}

/**
 * True iff the mission's origin tag resolves to the player's aligned
 * pantheon. UI helper for surfacing the bonus on mission cards.
 */
export function isMissionPantheonMatch(
  player: Pick<PlayerState, "affinitySchoolId">,
  originTagId: MissionOriginTagId | undefined,
): boolean {
  return getPantheonMatchRewardMultiplier(player, originTagId) > 1;
}
