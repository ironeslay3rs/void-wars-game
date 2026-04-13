/**
 * Task 3.3 — Crafting Core Loop: single-recipe craft action (pure).
 *
 * Thin layer on top of the existing `craftItem()` in `craftActions.ts` that:
 *   1. Re-exports the proven consume/roll/produce pipeline (no duplication).
 *   2. Adds a profession-rank-aware success-chance modifier (careerFocus =
 *      "crafting" + rankLevel boost the base recipe.successChance).
 *   3. Attaches a derived QualityTier to the outcome so UI can display it.
 *
 * Pure functions only. No side effects. Pure-Empire naming (no "Spirit").
 */

import type { PlayerState } from "@/features/game/gameTypes";
import { craftItem, type CraftResult } from "@/features/crafting/craftActions";
import type { CraftRecipe } from "@/features/crafting/recipeRegistry";
import {
  deriveOutputQuality,
  type QualityTier,
} from "@/features/crafting/qualitySystem";

export type { CraftResult } from "@/features/crafting/craftActions";

/**
 * Profession success-chance bonus, additive to recipe.successChance.
 * - careerFocus "crafting": +0.03 per rankLevel, capped at +0.15
 * - other careers: 0
 */
export function computeCraftingSuccessBonus(player: PlayerState): number {
  if (player.careerFocus !== "crafting") return 0;
  const rank = Math.max(0, player.rankLevel ?? 0);
  return Math.min(0.15, rank * 0.03);
}

/**
 * Profession quality bonus fed into `deriveOutputQuality`.
 *   - non-crafters: 0
 *   - crafters rank 1–4: +1 (one tier lift)
 *   - crafters rank 5+:  +2 (two tier lift)
 */
export function computeCraftingQualityBonus(player: PlayerState): number {
  if (player.careerFocus !== "crafting") return 0;
  const rank = Math.max(0, player.rankLevel ?? 0);
  if (rank >= 5) return 2;
  if (rank >= 1) return 1;
  return 0;
}

export type CraftOutcome = {
  player: PlayerState;
  result: CraftResult;
  /** Output quality tier (only meaningful on success). */
  quality: QualityTier;
};

/**
 * Execute one craft attempt. Pure. Consumes materials, rolls success with the
 * profession-adjusted chance, produces item/resources, attaches quality.
 *
 * @param materialQualities — optional per-material quality samples. If absent,
 *   defaults to all "standard" so callers without quality-tracked inventories
 *   still get a valid outcome.
 */
export function performCraft(params: {
  player: PlayerState;
  recipe: CraftRecipe;
  materialQualities?: QualityTier[];
  rng?: () => number;
}): CraftOutcome {
  const { player, recipe, materialQualities = [], rng } = params;

  const bonus = computeCraftingSuccessBonus(player);
  const adjustedRecipe: CraftRecipe = bonus > 0
    ? { ...recipe, successChance: Math.min(1, recipe.successChance + bonus) }
    : recipe;

  const { player: nextPlayer, result } = craftItem({
    player,
    recipe: adjustedRecipe,
    rng,
  });

  const quality = deriveOutputQuality(
    materialQualities,
    computeCraftingQualityBonus(player),
  );

  return { player: nextPlayer, result, quality };
}
