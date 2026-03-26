import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  getExecutionalTier,
  hasExecutionalSet,
} from "@/features/mastery/runeMasteryLogic";

/** Zone loot theme → school runway for mastery alignment. */
export function lootThemeToRuneSchool(theme: VoidZoneLootTheme): RuneSchool {
  if (theme === "bio_rot") return "bio";
  if (theme === "ash_mecha") return "mecha";
  return "pure";
}

/** Cap for theme-aligned field pickup stacking (L2 + depth + L3 tier). */
export const MAX_ALIGNED_PICKUP_YIELD_MULT = 1.22;

/**
 * Extra yield when your rune investment matches this zone's theme (field pickups).
 * Stacks: Executional L2+, depth 5+, tier L3 — capped.
 */
export function getMasteryAlignedPickupYieldMultiplier(
  mastery: PlayerRuneMasteryState,
  theme: VoidZoneLootTheme,
): number {
  const school = lootThemeToRuneSchool(theme);
  let m = 1;
  if (hasExecutionalSet(mastery, school)) m *= 1.1;
  if (mastery.depthBySchool[school] >= 5) m *= 1.04;
  if (getExecutionalTier(mastery, school) >= 2) m *= 1.03;
  return Math.min(m, MAX_ALIGNED_PICKUP_YIELD_MULT);
}

/** Hunt settlement resource bonus (same alignment math, slightly tighter cap). */
export function getMasteryAlignedContractResourceMultiplier(
  mastery: PlayerRuneMasteryState,
  theme: VoidZoneLootTheme,
): number {
  const m = getMasteryAlignedPickupYieldMultiplier(mastery, theme);
  return 1 + (m - 1) * 0.85;
}
