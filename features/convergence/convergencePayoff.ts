/**
 * Convergence payoff — the benefits that unlock after the Book 6
 * reveal fires (`convergenceRevealed === true`).
 *
 * Foundation slice of M5. Three benefits:
 *
 *   1. **Mana max boost** (+20, one-time) — applied by the reveal
 *      reducer when `TRIGGER_CONVERGENCE_REVEAL` fires. Already wired
 *      into `convergenceReveal.ts:applyConvergenceReveal`.
 *
 *   2. **Mission reward bonus** (+5%, always-on) — converged operatives
 *      earn more from every settled mission. Selector consumed by the
 *      mission settle pipeline.
 *
 *   3. **Free hybrid drain soak** — mana-funded rune installs cost
 *      zero mana when converged (the convergence subsidizes
 *      cross-school exploration). Selector consumed by the MANA_
 *      INSTALL_MINOR_RUNE reducer.
 *
 * Canon grounding: the convergence is the fusion of Body + Mind + Soul,
 * the forbidden truth of the Sevenfold Rune universe. A player who
 * reaches this state has walked enough of every school to transcend the
 * empire boundary. The benefits reflect that transcendence: more energy
 * (mana), more efficient work (rewards), and free passage across
 * school lines (hybrid drain).
 */

import type { PlayerState } from "@/features/game/gameTypes";

export const CONVERGENCE_MANA_MAX_BONUS = 20;
export const CONVERGENCE_REWARD_BONUS_PCT = 5;

export function isConverged(
  player: Pick<PlayerState, "mythicAscension">,
): boolean {
  return player.mythicAscension.convergenceRevealed === true;
}

/**
 * Mission reward multiplier for converged operatives. Returns 1 when
 * not converged.
 */
export function getConvergenceRewardMultiplier(
  player: Pick<PlayerState, "mythicAscension">,
): number {
  return isConverged(player) ? 1 + CONVERGENCE_REWARD_BONUS_PCT / 100 : 1;
}

/**
 * True when the converged player should pay zero mana for hybrid drain
 * soak on MANA_INSTALL_MINOR_RUNE. The convergence subsidizes
 * cross-school rune exploration.
 */
export function isConvergenceHybridDrainFree(
  player: Pick<PlayerState, "mythicAscension">,
): boolean {
  return isConverged(player);
}
