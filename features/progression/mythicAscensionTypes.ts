/**
 * M6 high-end ladder (Book 1 vertical slice — no Book 2 Saint implementation).
 */
export type MythicAscensionState = {
  /** Rare Rune Set L3 unlock — gates deeper forge actions. */
  l3RareRuneSetUnlocked: boolean;
  /** Rune Crafter profession recognition. */
  runeCrafterLicense: boolean;
  /** Phase 9 bookmark — hybrid ladder primed for Rune Knight / Convergence arc staging. */
  convergencePrimed: boolean;
  /**
   * T5 #19 / Convergence reveal: true when all three conditions fire
   * (convergencePrimed + mismatchEncountered + 3 schools exposed). Once
   * set, the narrative reveal has occurred and the player enters the
   * convergence endgame. The actual payoff mechanics are M5 work; this
   * flag is the trigger foundation.
   */
  convergenceRevealed: boolean;
  /**
   * Phase 9 — Rune Knight prestige ledger (ranked/tournament SR wins while converged).
   * Display-only ladder fuel until full Knighthood mechanics ship.
   */
  runeKnightValor: number;
  /** Arena ranked Season 1 skill rating (display + future matchmaking). */
  arenaRankedSeason1Rating: number;
  /** Consumable prestige charge: one ranked/tournament edge for the next match. */
  arenaEdgeSigils: number;
};
