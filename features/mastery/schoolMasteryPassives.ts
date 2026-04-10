/**
 * Per-school passive mastery effects — differentiate the three schools
 * beyond the existing yield multiplier by granting a unique always-on
 * passive when the player has 3+ depth in their primary school.
 *
 * Passives fire once per mission settlement (same pipeline as pantheon
 * perks and institutional pressures).
 *
 *   Bio (3+ depth)   → +3 condition on settle (regenerative biology)
 *   Mecha (3+ depth) → -2 void instability on settle (mechanical stabilization)
 *   Pure (3+ depth)  → +3 mana on settle (memory reservoir retention)
 *
 * All deltas are small and targeted — they reward depth investment
 * without creating must-pick imbalances.
 */

import type { PlayerState, PathType } from "@/features/game/gameTypes";
import { clamp } from "@/features/game/gameMissionUtils";

export const SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD = 3;

export type SchoolMasteryPassiveEffect = {
  school: PathType;
  stat: "condition" | "voidInstability" | "mana";
  delta: number;
  label: string;
};

export const SCHOOL_MASTERY_PASSIVES: Record<
  PathType,
  SchoolMasteryPassiveEffect
> = {
  bio: {
    school: "bio",
    stat: "condition",
    delta: 3,
    label: "+3 condition (regenerative biology)",
  },
  mecha: {
    school: "mecha",
    stat: "voidInstability",
    delta: -2,
    label: "-2 void instability (mechanical stabilization)",
  },
  pure: {
    school: "pure",
    stat: "mana",
    delta: 3,
    label: "+3 mana (memory reservoir retention)",
  },
};

/**
 * Returns the active school mastery passive for the player, or null
 * if they don't qualify (unbound, or primary school depth < threshold).
 */
export function getActiveSchoolMasteryPassive(
  player: Pick<PlayerState, "factionAlignment" | "runeMastery">,
): SchoolMasteryPassiveEffect | null {
  if (player.factionAlignment === "unbound") return null;
  const school = player.factionAlignment;
  const depth = player.runeMastery.depthBySchool[school] ?? 0;
  if (depth < SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD) return null;
  return SCHOOL_MASTERY_PASSIVES[school];
}

/**
 * Apply the school mastery passive to the player state. Returns the
 * same reference when no passive qualifies.
 */
export function applySchoolMasteryPassive(player: PlayerState): PlayerState {
  const passive = getActiveSchoolMasteryPassive(player);
  if (!passive) return player;

  switch (passive.stat) {
    case "condition":
      return {
        ...player,
        condition: clamp(player.condition + passive.delta, 0, 100),
      };
    case "voidInstability":
      return {
        ...player,
        voidInstability: clamp(
          player.voidInstability + passive.delta,
          0,
          100,
        ),
      };
    case "mana":
      return {
        ...player,
        mana: clamp(player.mana + passive.delta, 0, player.manaMax),
      };
    default:
      return player;
  }
}
