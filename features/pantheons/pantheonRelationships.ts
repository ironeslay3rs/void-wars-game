/**
 * Inter-pantheon relationships + rite costs — deepens the pantheon
 * mechanic beyond the flat visit-blessing and match-bonus.
 *
 * Each pantheon has:
 *   - An allied pantheon (within the same empire, same cultural basin)
 *   - An opposed pantheon (opposite empire, contrasting domain)
 *
 * Effects:
 *   - Allied: visiting the allied pantheon's HQ grants +3 mana (a
 *     "resonance echo" — the disciplines are close enough to share
 *     power).
 *   - Opposed: visiting the opposed pantheon's HQ still works for the
 *     blessing but costs +5 extra mana on activation (the friction
 *     of conflicting disciplines).
 *
 * Rite costs:
 *   - Base blessing cost: 0 mana (free, as shipped in T1 #2).
 *   - Opposed blessing cost: 5 mana surcharge (paid on
 *     GRANT_PANTHEON_BLESSING when the target pantheon is opposed).
 *   - This is the first "pantheon rite cost" — future work can add
 *     deeper rites with higher costs + bigger payoffs.
 *
 * Relationship assignments (canon-respectful, based on empire +
 * cultural proximity):
 *
 *   norse     allied: greek      opposed: hindu
 *     (Bio NW ↔ Bio Aegean; opposed = Pure subcontinent hoarders)
 *   greek     allied: norse      opposed: chinese
 *     (Bio Aegean ↔ Bio NW; opposed = Mecha patience clocks)
 *   canaanite allied: norse      opposed: egyptian
 *     (Bio Levant ↔ Bio NW; opposed = Mecha Nile visibility)
 *   inca      allied: hindu      opposed: norse
 *     (Pure Andes ↔ Pure subcontinent; opposed = Bio NW predators)
 *   hindu     allied: inca       opposed: norse
 *     (Pure subcontinent ↔ Pure Andes; opposed = Bio NW predators)
 *   egyptian  allied: chinese    opposed: canaanite
 *     (Mecha Nile ↔ Mecha East; opposed = Bio Levant desire)
 *   chinese   allied: egyptian   opposed: greek
 *     (Mecha East ↔ Mecha Nile; opposed = Bio Aegean comparison)
 */

import type { PantheonId } from "@/features/pantheons/pantheonTypes";
import type { PlayerState } from "@/features/game/gameTypes";
import { getPlayerAlignedPantheonId } from "@/features/pantheons/pantheonReward";

export type PantheonRelationship = {
  allied: PantheonId;
  opposed: PantheonId;
};

export const PANTHEON_RELATIONSHIPS: Record<PantheonId, PantheonRelationship> =
  {
    norse: { allied: "greek", opposed: "hindu" },
    greek: { allied: "norse", opposed: "chinese" },
    canaanite: { allied: "norse", opposed: "egyptian" },
    inca: { allied: "hindu", opposed: "norse" },
    hindu: { allied: "inca", opposed: "norse" },
    egyptian: { allied: "chinese", opposed: "canaanite" },
    chinese: { allied: "egyptian", opposed: "greek" },
  };

/** Mana cost surcharge when taking a blessing from an opposed pantheon. */
export const OPPOSED_BLESSING_MANA_COST = 5;

/** Mana bonus granted when visiting the allied pantheon's HQ. */
export const ALLIED_PANTHEON_VISIT_MANA_BONUS = 3;

export type PantheonRelationshipKind = "self" | "allied" | "opposed" | "neutral";

/**
 * Determine the relationship between the player's aligned pantheon and
 * a target pantheon.
 */
export function getPantheonRelationship(
  player: Pick<PlayerState, "affinitySchoolId">,
  targetPantheonId: PantheonId,
): PantheonRelationshipKind {
  const myPantheonId = getPlayerAlignedPantheonId(player);
  if (!myPantheonId) return "neutral";
  if (myPantheonId === targetPantheonId) return "self";
  const rel = PANTHEON_RELATIONSHIPS[myPantheonId];
  if (!rel) return "neutral";
  if (rel.allied === targetPantheonId) return "allied";
  if (rel.opposed === targetPantheonId) return "opposed";
  return "neutral";
}

/**
 * Extra mana cost to pay when activating the visit blessing on a
 * target pantheon. 0 for self/allied/neutral, OPPOSED_BLESSING_MANA_COST
 * for opposed.
 */
export function getBlessingManaSurcharge(
  player: Pick<PlayerState, "affinitySchoolId">,
  targetPantheonId: PantheonId,
): number {
  return getPantheonRelationship(player, targetPantheonId) === "opposed"
    ? OPPOSED_BLESSING_MANA_COST
    : 0;
}
