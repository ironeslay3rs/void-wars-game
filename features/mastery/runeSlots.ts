/**
 * Rune slot unlock logic — ties minor-rune slot availability to player
 * progression (rank level) and the existing rune depth model.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Runes/Rune System.md
 *       "Stronger individuals can usually hold more and better runes."
 *       Capacity and compatibility are gating laws; the Sevenfold set
 *       levels (L1 standard → L5 mythical) gate how many & which.
 *   - lore-canon/CLAUDE.md — Three Capacities (Blood/Frame/Resonance) are
 *       the three pools that back rune installs.
 *
 * Game adaptation:
 *   - Each school exposes up to MAX_MINORS_PER_SCHOOL (6) minor slots.
 *   - Slots unlock in lockstep with the player's rank ladder so early
 *     players cannot stack a full set before they have the capacity to
 *     back it (the "stronger individuals hold more" canon clause).
 *   - A slot is "unlocked" once rank gate met. It is "filled" once a
 *     minor of that school has been installed into it. It is
 *     "available" when unlocked and not yet filled.
 *
 * Pure functions only. No side effects. No component imports.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import { MAX_MINORS_PER_SCHOOL } from "@/features/mastery/runeMasteryLogic";

/**
 * Rank-level threshold for each minor slot index (0-based).
 * slot 0 is free at rank 1 (canon: L1 standard sets are baseline for war),
 * then each further slot opens two rank-levels later. Last slot (index 5)
 * opens at rank 11 — roughly the Executional-L3 band.
 */
export const SLOT_UNLOCK_RANK_BY_INDEX: readonly number[] = [
  1, 3, 5, 7, 9, 11,
];

export type RuneSlotStatus = "locked" | "available" | "filled";

export type RuneSlotInfo = {
  school: RuneSchool;
  /** 0-based slot index within the school (0..MAX_MINORS_PER_SCHOOL-1). */
  index: number;
  status: RuneSlotStatus;
  /** Rank level required for this slot to unlock. */
  unlocksAtRank: number;
};

/** Total unlocked slots for a school given the player's rank. Capped at the school minor cap. */
export function getUnlockedSlotCount(
  school: RuneSchool,
  rankLevel: number,
): number {
  let unlocked = 0;
  for (let i = 0; i < MAX_MINORS_PER_SCHOOL; i++) {
    const gate = SLOT_UNLOCK_RANK_BY_INDEX[i] ?? Number.POSITIVE_INFINITY;
    if (rankLevel >= gate) unlocked += 1;
  }
  return unlocked;
}

/**
 * Enumerate every minor slot of a school with its current status. Useful for
 * UI rendering and test assertions.
 */
export function getRuneSlotsForSchool(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
  rankLevel: number,
): RuneSlotInfo[] {
  const filled = mastery.minorCountBySchool[school] ?? 0;
  const unlocked = getUnlockedSlotCount(school, rankLevel);
  const out: RuneSlotInfo[] = [];
  for (let i = 0; i < MAX_MINORS_PER_SCHOOL; i++) {
    const unlocksAtRank =
      SLOT_UNLOCK_RANK_BY_INDEX[i] ?? Number.POSITIVE_INFINITY;
    let status: RuneSlotStatus;
    if (i < filled) status = "filled";
    else if (i < unlocked) status = "available";
    else status = "locked";
    out.push({ school, index: i, status, unlocksAtRank });
  }
  return out;
}

/**
 * True if the school has at least one available (unlocked + empty) minor slot.
 * Gates the "install minor rune" action alongside capacity/cost checks.
 */
export function hasAvailableSlot(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
  rankLevel: number,
): boolean {
  const unlocked = getUnlockedSlotCount(school, rankLevel);
  const filled = mastery.minorCountBySchool[school] ?? 0;
  return filled < unlocked;
}

/**
 * Reason a slot install would be refused, or null if a slot is open. Lets
 * callers surface canon-flavored reasons ("rank too low") separately from
 * capacity-cost failures.
 */
export function getSlotUnlockBlocker(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
  rankLevel: number,
): string | null {
  const filled = mastery.minorCountBySchool[school] ?? 0;
  if (filled >= MAX_MINORS_PER_SCHOOL) {
    return "School minor cap reached for this path.";
  }
  const unlocked = getUnlockedSlotCount(school, rankLevel);
  if (filled >= unlocked) {
    const nextGate = SLOT_UNLOCK_RANK_BY_INDEX[filled];
    if (nextGate !== undefined) {
      return `Next ${school} slot unlocks at rank ${nextGate}.`;
    }
    return `No more ${school} slots available.`;
  }
  return null;
}

/**
 * Total slots unlocked across all three schools for a given rank. Used by
 * UI banners + tests.
 */
export function getTotalUnlockedSlots(rankLevel: number): number {
  return RUNE_SCHOOLS.reduce(
    (acc, school) => acc + getUnlockedSlotCount(school, rankLevel),
    0,
  );
}

/**
 * Player-level convenience: enumerate ALL slots across every school.
 */
export function getAllRuneSlots(player: PlayerState): RuneSlotInfo[] {
  const out: RuneSlotInfo[] = [];
  for (const school of RUNE_SCHOOLS) {
    out.push(
      ...getRuneSlotsForSchool(player.runeMastery, school, player.rankLevel),
    );
  }
  return out;
}
