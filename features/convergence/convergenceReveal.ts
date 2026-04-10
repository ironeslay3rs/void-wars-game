/**
 * Convergence reveal — trigger conditions + narrative payoff for the
 * late-game convergence arc (Book 6).
 *
 * The reveal fires exactly once when ALL three conditions hold:
 *   1. convergencePrimed === true (mythic gate cleared earlier)
 *   2. mismatchEncountered === true (cross-school seed threshold)
 *   3. All 3 schools exposed (crossSchoolExposure.schoolsExposed)
 *
 * After the reveal:
 *   - convergenceRevealed is set to true on MythicAscensionState
 *   - lastConvergenceReveal ephemeral toast fires for the UI
 *   - No gameplay mechanic changes yet (M5 payoff work)
 *
 * Foundation slice — ships the trigger mechanism and state transition.
 * The full convergence payoff (what happens AFTER the reveal) is M5 work.
 */

import type { GameState, PlayerState } from "@/features/game/gameTypes";

export const CONVERGENCE_REVEAL_HEADLINE =
  "The three paths are one. The separation was a lie.";

export const CONVERGENCE_REVEAL_DETAIL =
  "You have walked enough of every school to see what they all see: " +
  "Body, Mind, and Soul were never three things. The Sevenfold Rune " +
  "structure encoded a single truth across seven sins, and the convergence " +
  "you just triggered is the first evidence that truth can be held by " +
  "a living operative. What this means for the war — and for you — is " +
  "the question the next arc answers.";

/**
 * True iff the player has met all three convergence-reveal conditions
 * AND the reveal has not yet fired.
 */
export function canTriggerConvergenceReveal(
  player: Pick<
    PlayerState,
    "mythicAscension" | "crossSchoolExposure"
  >,
): boolean {
  if (player.mythicAscension.convergenceRevealed) return false;
  if (!player.mythicAscension.convergencePrimed) return false;
  if (!player.crossSchoolExposure.mismatchEncountered) return false;
  const s = player.crossSchoolExposure.schoolsExposed;
  return s.bio && s.mecha && s.pure;
}

export type ConvergenceRevealToast = {
  headline: string;
  detail: string;
  at: number;
};

/**
 * Apply the convergence reveal to the player state. Returns the same
 * player reference if conditions aren't met (no-op).
 */
export function applyConvergenceReveal(
  state: GameState,
  nowMs?: number,
): GameState["player"] {
  const player = state.player;
  if (!canTriggerConvergenceReveal(player)) return player;

  return {
    ...player,
    mythicAscension: {
      ...player.mythicAscension,
      convergenceRevealed: true,
    },
    lastAnomalyToast: {
      text: CONVERGENCE_REVEAL_HEADLINE,
      school: player.factionAlignment === "unbound" ? "bio" : player.factionAlignment,
      at: nowMs ?? Date.now(),
    },
  };
}
