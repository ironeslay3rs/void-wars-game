/**
 * Pantheon perks — persistent passive bonuses tied to the player's
 * aligned pantheon. Applied once per mission settlement.
 *
 * Each of the 7 pantheons grants a small, distinct passive bonus that
 * matches the cultural domain of its surviving tradition. Foundation
 * slice: one effect per pantheon, applied in the mission settle
 * pipeline, no UI surface beyond the existing pantheon HQ.
 *
 * Design rationale per pantheon:
 *
 *   norse     → +1 condition   (wolves heal mid-stride)
 *   inca      → +3 credits     (tribute economy flows back to its own)
 *   greek     → +1 mastery     (learning through comparison)
 *   canaanite → +2 mana        (boon retained from the last contract)
 *   hindu     → +5 credits     (hoard interest compounds)
 *   egyptian  → +1 influence   (visibility = ownership)
 *   chinese   → -1 void instab (patience = durability under void strain)
 */

import type { PantheonId } from "@/features/pantheons/pantheonTypes";
import type { PlayerState } from "@/features/game/gameTypes";
import { getPlayerAlignedPantheonId } from "@/features/pantheons/pantheonReward";

export type PantheonPerkEffect =
  | { stat: "condition"; delta: number }
  | { stat: "credits"; delta: number }
  | { stat: "masteryProgress"; delta: number }
  | { stat: "mana"; delta: number }
  | { stat: "influence"; delta: number }
  | { stat: "voidInstability"; delta: number };

export const PANTHEON_PERKS: Record<PantheonId, PantheonPerkEffect> = {
  norse: { stat: "condition", delta: 1 },
  inca: { stat: "credits", delta: 3 },
  greek: { stat: "masteryProgress", delta: 1 },
  canaanite: { stat: "mana", delta: 2 },
  hindu: { stat: "credits", delta: 5 },
  egyptian: { stat: "influence", delta: 1 },
  chinese: { stat: "voidInstability", delta: -1 },
};

/**
 * Returns the passive perk effect for the player's aligned pantheon,
 * or null if the player has no affinity (unbound / legacy saves).
 */
export function getPlayerPantheonPerk(
  player: Pick<PlayerState, "affinitySchoolId">,
): PantheonPerkEffect | null {
  const pantheonId = getPlayerAlignedPantheonId(player);
  if (!pantheonId) return null;
  return PANTHEON_PERKS[pantheonId] ?? null;
}

/**
 * Apply the perk to a mutable-ish player slice. Returns the same player
 * ref if no perk fires (no affinity, or the perk has zero delta).
 */
export function applyPantheonPerkToPlayer(
  player: PlayerState,
): PlayerState {
  const perk = getPlayerPantheonPerk(player);
  if (!perk || perk.delta === 0) return player;

  switch (perk.stat) {
    case "condition":
      return {
        ...player,
        condition: Math.min(100, Math.max(0, player.condition + perk.delta)),
      };
    case "credits":
      return {
        ...player,
        resources: {
          ...player.resources,
          credits: Math.max(0, player.resources.credits + perk.delta),
        },
      };
    case "masteryProgress":
      return {
        ...player,
        masteryProgress: Math.min(
          100,
          Math.max(0, player.masteryProgress + perk.delta),
        ),
      };
    case "mana":
      return {
        ...player,
        mana: Math.min(player.manaMax, Math.max(0, player.mana + perk.delta)),
      };
    case "influence":
      return {
        ...player,
        influence: Math.max(0, player.influence + perk.delta),
      };
    case "voidInstability":
      return {
        ...player,
        voidInstability: Math.min(
          100,
          Math.max(0, player.voidInstability + perk.delta),
        ),
      };
    default:
      return player;
  }
}
