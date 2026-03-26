import type { PlayerState } from "@/features/game/gameTypes";
import { RUNE_CRAFTER_STABILIZATION_SIGIL } from "@/features/status/statusRecovery";
import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";

/** Crafting next-run Void Extract — gated by depth (not stored in knownRecipes). */
export const CRAFT_GATE_VOID_EXTRACT = "craft-next-run:void-extract";

/** Recipe id → minimum deepest-school rune depth (Sevenfold ladder). */
export const RECIPE_MIN_RUNE_DEPTH: Partial<Record<string, number>> = {
  [RUNE_CRAFTER_STABILIZATION_SIGIL]: 2,
  [CRAFT_GATE_VOID_EXTRACT]: 3,
};

export function meetsRecipeRuneDepth(player: PlayerState, recipeId: string) {
  const minDepth = RECIPE_MIN_RUNE_DEPTH[recipeId];
  if (minDepth === undefined) return true;
  return maxRuneDepthAcrossSchools(player.runeMastery) >= minDepth;
}

export function getRecipeRuneRequirementHint(recipeId: string): string | null {
  const minDepth = RECIPE_MIN_RUNE_DEPTH[recipeId];
  if (minDepth === undefined) return null;
  return `Requires rune depth ${minDepth}+ (career / mastery).`;
}
