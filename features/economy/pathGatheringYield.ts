import type { FactionAlignment } from "@/features/game/gameTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";
import { lootThemeToRuneSchool } from "@/features/mastery/masteryGameplayEffects";

/** Shell field pickup mult when path matches zone loot theme (stacks with mastery + career). */
export const PATH_ALIGNED_FIELD_LOOT_MULT = 1.08;

/** Phase 9 — Convergence filing nudge on field pickups (stacks multiplicatively). */
export const CONVERGENCE_PRIMED_FIELD_LOOT_MULT = 1.02;

export function getConvergencePrimedFieldLootMultiplier(
  convergencePrimed: boolean,
): number {
  return convergencePrimed ? CONVERGENCE_PRIMED_FIELD_LOOT_MULT : 1;
}

/** Realtime hunt contract resource bonus line — slightly tighter than shell pickups. */
export const PATH_ALIGNED_CONTRACT_RESOURCE_MULT = 1.06;

export function themeMatchesFactionPath(
  theme: VoidZoneLootTheme,
  alignment: FactionAlignment,
): boolean {
  if (alignment === "unbound") {
    return false;
  }
  return lootThemeToRuneSchool(theme) === alignment;
}

export function getPathAlignedFieldLootMultiplier(
  alignment: FactionAlignment,
  theme: VoidZoneLootTheme,
): number {
  return themeMatchesFactionPath(theme, alignment)
    ? PATH_ALIGNED_FIELD_LOOT_MULT
    : 1;
}

export function getPathAlignedContractResourceMultiplier(
  alignment: FactionAlignment,
  theme: VoidZoneLootTheme,
): number {
  return themeMatchesFactionPath(theme, alignment)
    ? PATH_ALIGNED_CONTRACT_RESOURCE_MULT
    : 1;
}
