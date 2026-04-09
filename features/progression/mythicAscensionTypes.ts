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
   * Phase 9 — Rune Knight prestige ledger (ranked/tournament SR wins while converged).
   * Display-only ladder fuel until full Knighthood mechanics ship.
   */
  runeKnightValor: number;
  /** Arena ranked Season 1 skill rating (display + future matchmaking). */
  arenaRankedSeason1Rating: number;
  /** Consumable prestige charge: one ranked/tournament edge for the next match. */
  arenaEdgeSigils: number;
};
