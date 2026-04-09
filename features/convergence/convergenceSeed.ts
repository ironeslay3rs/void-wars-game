import type {
  CrossSchoolExposure,
  GameState,
  PathType,
} from "@/features/game/gameTypes";

/**
 * Convergence seed tracker — a pure utility function.
 *
 * NOT wired into any reducer yet. This exists so the data architecture
 * supports late-game convergence discovery without refactoring.
 *
 * Call this when a player interacts with off-path materials (craft, loot,
 * rune install, etc.) to update their hidden cross-school exposure.
 *
 * The returned partial can be spread into crossSchoolExposure.
 */

const MISMATCH_THRESHOLD_ENCOUNTERS = 5;
const MISMATCH_THRESHOLD_SCHOOLS = 2;

export function trackCrossSchoolExposure(
  state: GameState,
  action: { school: PathType },
): Partial<CrossSchoolExposure> | null {
  const player = state.player;
  const alignment = player.factionAlignment;

  // If unbound, everything is "on path" (no off-path concept yet)
  if (alignment === "unbound") return null;

  // If the action's school matches the player's alignment, no cross-school event
  if (action.school === alignment) return null;

  const current = player.crossSchoolExposure;
  const nextEncountered = current.offPathMaterialsEncountered + 1;

  const nextSchoolsExposed = {
    ...current.schoolsExposed,
    [action.school]: true,
  };

  // Count how many schools the player has been exposed to (including their own)
  const exposedCount = (
    [nextSchoolsExposed.bio, nextSchoolsExposed.mecha, nextSchoolsExposed.pure] as boolean[]
  ).filter(Boolean).length;

  const nextMismatch =
    current.mismatchEncountered ||
    (exposedCount >= MISMATCH_THRESHOLD_SCHOOLS &&
      nextEncountered >= MISMATCH_THRESHOLD_ENCOUNTERS);

  const nextAnomalyScore = current.anomalyScore + 1;

  return {
    offPathMaterialsEncountered: nextEncountered,
    schoolsExposed: nextSchoolsExposed,
    mismatchEncountered: nextMismatch,
    anomalyScore: nextAnomalyScore,
  };
}

/**
 * Check if a player has reached the hidden mismatch threshold.
 * Useful for future NPC hint logic, lore fragment spawning, etc.
 */
export function hasMismatchPotential(state: GameState): boolean {
  return state.player.crossSchoolExposure.mismatchEncountered;
}

/**
 * Count of schools the player has been exposed to (0-3).
 */
export function getExposedSchoolCount(state: GameState): number {
  const e = state.player.crossSchoolExposure.schoolsExposed;
  return [e.bio, e.mecha, e.pure].filter(Boolean).length;
}
