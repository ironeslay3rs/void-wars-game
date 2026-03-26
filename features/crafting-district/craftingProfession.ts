import type { PlayerState } from "@/features/game/gameTypes";
import type { ResourceKey } from "@/features/game/gameTypes";
import { getCraftingCostForCareerFocus } from "@/features/player/careerFocusModifiers";
import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";
import { hasStabilizationSigil } from "@/features/status/statusRecovery";

/** Extra material discount per tier when Crafting focus (after the 15% focus discount). */
export const CRAFTING_PROFESSION_DISCOUNT_PER_TIER = 0.02;

/**
 * Functional “profession tree” tier derived from mastery depth + a signature district
 * recipe — no extra save fields (M3 slice).
 */
export function getCraftingProfessionTier(player: PlayerState): 0 | 1 | 2 | 3 {
  const depth = maxRuneDepthAcrossSchools(player.runeMastery);
  const sigil = hasStabilizationSigil(player.knownRecipes);
  let score = 0;
  if (depth >= 2) score += 1;
  if (depth >= 4) score += 1;
  if (sigil) score += 1;
  return Math.min(3, score) as 0 | 1 | 2 | 3;
}

export function formatCraftingProfessionHint(player: PlayerState): string {
  const tier = getCraftingProfessionTier(player);
  if (tier === 0) {
    return "District profession tier 0 · deepen rune mastery or inscribe the Stabilization Sigil to unlock tier discounts.";
  }
  const pct = Math.round(CRAFTING_PROFESSION_DISCOUNT_PER_TIER * tier * 100);
  return `District profession tier ${tier} · Crafting focus stacks −${pct}% extra on district recipe material lines (after focus discount).`;
}

/** Effective costs for Crafting District UI + reducers (focus + profession). */
export function getDistrictCraftingCost(
  player: PlayerState,
  cost: Partial<Record<ResourceKey, number>>,
): Partial<Record<ResourceKey, number>> {
  const afterFocus = getCraftingCostForCareerFocus(player.careerFocus, cost);
  if (player.careerFocus !== "crafting") {
    return afterFocus;
  }
  const tier = getCraftingProfessionTier(player);
  if (tier === 0) {
    return afterFocus;
  }
  const mult = 1 - CRAFTING_PROFESSION_DISCOUNT_PER_TIER * tier;
  const next: Partial<Record<ResourceKey, number>> = {};
  for (const [k, v] of Object.entries(afterFocus)) {
    if (typeof v === "number" && v > 0) {
      const key = k as ResourceKey;
      next[key] = Math.max(1, Math.floor(v * mult));
    }
  }
  return next;
}
