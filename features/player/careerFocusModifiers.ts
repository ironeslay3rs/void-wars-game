import type { CareerFocus, ResourceKey } from "@/features/game/gameTypes";
import { PATH_ALIGNED_FIELD_LOOT_MULT } from "@/features/economy/pathGatheringYield";

/** Shell-only practice damage on the void field (local drills). */
export const CAREER_COMBAT_SHELL_DAMAGE_BONUS_PCT = 12;

/** Multiplier applied to picked-up void field loot amounts (rounded, min 1). */
export const CAREER_GATHERING_FIELD_LOOT_MULT = 1.12;

/** Resource costs for district crafts when career focus is Crafting (each key ≥1 when original ≥1). */
export const CAREER_CRAFTING_COST_MULT = 0.85;

export function getCareerFocusShellDamageBonusPct(
  focus: CareerFocus | null,
): number {
  return focus === "combat" ? CAREER_COMBAT_SHELL_DAMAGE_BONUS_PCT : 0;
}

export function getCareerFocusFieldLootAmountMultiplier(
  focus: CareerFocus | null,
): number {
  return focus === "gathering" ? CAREER_GATHERING_FIELD_LOOT_MULT : 1;
}

/**
 * Crafting-focus discount on resource costs (Moss Ration, kits, sigil, boss refines).
 * Integer amounts; each discounted line is at least 1 when the base was ≥ 1.
 */
export function getCraftingCostForCareerFocus(
  focus: CareerFocus | null,
  cost: Partial<Record<ResourceKey, number>>,
): Partial<Record<ResourceKey, number>> {
  if (focus !== "crafting") {
    return { ...cost };
  }
  const next: Partial<Record<ResourceKey, number>> = {};
  for (const [k, v] of Object.entries(cost)) {
    if (typeof v === "number" && v > 0) {
      const key = k as ResourceKey;
      next[key] = Math.max(1, Math.floor(v * CAREER_CRAFTING_COST_MULT));
    }
  }
  return next;
}

export function formatCareerFocusCraftingHint(focus: CareerFocus | null): string {
  if (focus !== "crafting") return "";
  return `Crafting focus: −${Math.round((1 - CAREER_CRAFTING_COST_MULT) * 100)}% material costs on district recipes below.`;
}

/** One-line summary for Home / identity panels (matches constants above). */
export function getCareerFocusHomeEffectLine(focus: CareerFocus | null): string {
  if (focus === "combat") {
    return `Combat focus: +${CAREER_COMBAT_SHELL_DAMAGE_BONUS_PCT}% shell drill damage on the void field.`;
  }
  if (focus === "gathering") {
    return `Gathering focus: +${Math.round((CAREER_GATHERING_FIELD_LOOT_MULT - 1) * 100)}% void field pickups; +${Math.round((PATH_ALIGNED_FIELD_LOOT_MULT - 1) * 100)}% more when your path matches the zone loot theme.`;
  }
  if (focus === "crafting") {
    return `Crafting focus: −${Math.round((1 - CAREER_CRAFTING_COST_MULT) * 100)}% resource costs on eligible district recipes; Refining tab adds path staple on success.`;
  }
  return "Career focus applies after New Game — combat, gathering, or crafting.";
}
