import type { FactionAlignment } from "@/features/game/gameTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  computeInstallCost,
  getExecutionalTier,
  hasExecutionalSet,
} from "@/features/mastery/runeMasteryLogic";
import { getPrimaryRuneSchool } from "@/features/mastery/runeMasteryTypes";

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

/**
 * Set detection (Executional L2/L3) + next install Blood/Frame/Resonance cost + hybrid-lane warning.
 */
export function getSchoolMasterySystemsReadout(
  mastery: PlayerRuneMasteryState,
  school: RuneSchool,
  alignment: FactionAlignment,
): string[] {
  const tier = getExecutionalTier(mastery, school);
  const primary = getPrimaryRuneSchool(alignment);
  const offPrimary = primary !== null && school !== primary;
  const cost = computeInstallCost({ alignment, school });

  const setLine =
    tier >= 2
      ? "Systems · Executional L3 detected (5–6 minors) — apex identity."
      : tier >= 1
        ? "Systems · Executional L2 detected (3–4 minors) — set bonuses active."
        : "Systems · L1 runway — three minors here unlock L2 set detection.";

  const costLine = `Next minor capacity cost · Blood ${cost.blood} · Frame ${cost.frame} · Resonance ${cost.resonance}.`;

  const hybridLine = offPrimary
    ? "Hybrid lane · off-primary school: each install adds a hybrid drain stack (ceilings tighten; Crafter / Convergence may forgive)."
    : null;

  return hybridLine ? [setLine, costLine, hybridLine] : [setLine, costLine];
}
