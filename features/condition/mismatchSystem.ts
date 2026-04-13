/**
 * Mismatch System — Bio / Mecha / Pure incompatibility penalties.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Runes/Rune System.md — "Capacity matters.
 *     Compatibility matters." Cross-school installs are more expensive
 *     AND erode the vessel.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — mana pool sizing
 *     per school; mismatched draws tax every pool.
 *   - lore-canon/CLAUDE.md — Three Capacities: Blood (Bio / Verdant Coil),
 *     Frame (Mecha / Chrome Synod), Resonance (Pure / Ember Vault). UI
 *     strings use empire names; the `"bio"|"mecha"|"pure"` union stays
 *     as the code-facing label.
 *
 * This file is the pure selectors layer. `capacityCosts.isHybridInstall`
 * already flags hybrid installs; we layer the CONSEQUENCE of being a
 * hybrid shell (mismatched loadout, mismatched install volley) so
 * combat/crafting selectors in `consequenceTable.ts` can compose.
 */

import type { FactionAlignment, PathType, PlayerState } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { isHybridInstall } from "@/features/mastery/capacityCosts";

// ────────────────────────────────────────────────────────────────────
// Canonical empire labels for UI-facing strings.
// ────────────────────────────────────────────────────────────────────

export const EMPIRE_NAME: Record<PathType, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

/** Turn a code-side school code into the empire display label. */
export function empireLabel(school: PathType | RuneSchool): string {
  return EMPIRE_NAME[school as PathType] ?? school;
}

// ────────────────────────────────────────────────────────────────────
// Mismatch classification
// ────────────────────────────────────────────────────────────────────

export type MismatchSeverity = "none" | "minor" | "major";

/**
 * Classify a proposed rune install against the player's alignment.
 *   - Unbound player → always "none" (no allegiance, no penalty).
 *   - Primary school install → "none".
 *   - Off-school install → "minor" (light tax).
 *   - Opposing-school install (see OPPOSED_PAIRS) → "major".
 */
export function classifyInstallMismatch(
  alignment: FactionAlignment,
  school: RuneSchool,
): MismatchSeverity {
  if (alignment === "unbound") return "none";
  if (!isHybridInstall(alignment, school)) return "none";
  const opposed = OPPOSED_PAIRS[alignment as PathType];
  if (opposed && opposed === (school as PathType)) return "major";
  return "minor";
}

/**
 * Opposed-pair map — Bio ↔ Mecha are the polar opposition (instinct vs.
 * comprehension). Pure sits adjacent to both; its opposite is itself
 * shadowed, so we treat Pure as always "minor" when mismatched.
 *
 * Canon: Verdant Coil and Chrome Synod are the framing rivalry; Ember
 * Vault is the witness-school between them.
 */
const OPPOSED_PAIRS: Record<PathType, PathType | null> = {
  bio: "mecha",
  mecha: "bio",
  pure: null,
};

// ────────────────────────────────────────────────────────────────────
// Mismatch penalties — composable with consequenceTable combat debuffs.
// ────────────────────────────────────────────────────────────────────

export type MismatchPenalty = {
  /** Multiplier on outgoing damage when operating a mismatched shell. */
  dmgMult: number;
  /** Multiplier on crafting success — reflects cross-school install rejection. */
  craftSuccessMult: number;
  /** Additional corruption gained per mismatched install event. */
  corruptionPerInstall: number;
  /** Human label for UI badges and tooltips (uses empire names). */
  label: string;
  severity: MismatchSeverity;
};

const NONE_PENALTY: MismatchPenalty = {
  dmgMult: 1,
  craftSuccessMult: 1,
  corruptionPerInstall: 0,
  label: "Aligned",
  severity: "none",
};

/** Resolve the numeric penalty for an install mismatch. */
export function getInstallMismatchPenalty(
  alignment: FactionAlignment,
  school: RuneSchool,
): MismatchPenalty {
  const severity = classifyInstallMismatch(alignment, school);
  if (severity === "none") return NONE_PENALTY;
  const empire = empireLabel(school);
  if (severity === "minor") {
    return {
      dmgMult: 0.95,
      craftSuccessMult: 0.95,
      corruptionPerInstall: 2,
      label: `Hybrid strain (${empire})`,
      severity,
    };
  }
  return {
    dmgMult: 0.85,
    craftSuccessMult: 0.85,
    corruptionPerInstall: 5,
    label: `Opposed-school rejection (${empire})`,
    severity,
  };
}

// ────────────────────────────────────────────────────────────────────
// Loadout-level mismatch — looks at which schools are currently installed.
// ────────────────────────────────────────────────────────────────────

export type LoadoutMismatchReport = {
  /** Count of installed rune depths that are off-school. */
  hybridDepth: number;
  /** Count of installed rune depths that are opposed-school. */
  opposedDepth: number;
  /** Aggregate penalty applied to combat/crafting while loadout persists. */
  penalty: MismatchPenalty;
};

const SCHOOLS: readonly RuneSchool[] = ["bio", "mecha", "pure"] as const;

/**
 * Walk the player's installed rune depths and summarise mismatch pressure.
 * Depth-weighted: each level of a mismatched school contributes.
 */
export function getLoadoutMismatchReport(
  player: Pick<PlayerState, "factionAlignment" | "runeMastery">,
): LoadoutMismatchReport {
  const alignment = player.factionAlignment;
  const mastery = player.runeMastery;
  let hybridDepth = 0;
  let opposedDepth = 0;

  for (const school of SCHOOLS) {
    const depth = mastery.depthBySchool?.[school] ?? 0;
    if (depth <= 0) continue;
    const sev = classifyInstallMismatch(alignment, school);
    if (sev === "major") opposedDepth += depth;
    else if (sev === "minor") hybridDepth += depth;
  }

  // Build an aggregate penalty. Opposed depth is weighted 2× hybrid.
  const pressure = hybridDepth + opposedDepth * 2;
  if (pressure === 0) {
    return { hybridDepth, opposedDepth, penalty: NONE_PENALTY };
  }
  const clamped = Math.min(pressure, 10);
  const dmgMult = Math.max(0.7, 1 - clamped * 0.02);
  const craftMult = Math.max(0.7, 1 - clamped * 0.02);
  const severity: MismatchSeverity = opposedDepth > 0 ? "major" : "minor";
  const label =
    severity === "major"
      ? `Opposed loadout (${opposedDepth} opposed, ${hybridDepth} hybrid)`
      : `Hybrid loadout (${hybridDepth} off-school)`;
  return {
    hybridDepth,
    opposedDepth,
    penalty: {
      dmgMult,
      craftSuccessMult: craftMult,
      corruptionPerInstall: severity === "major" ? 3 : 1,
      label,
      severity,
    },
  };
}

/**
 * Pure selector for combat consumers — returns the loadout-level damage
 * multiplier in isolation so `combatResolver` can fold it alongside the
 * `getCombatDebuffsFromCondition` multiplier without re-reading masterly.
 */
export function getLoadoutMismatchDmgMult(
  player: Pick<PlayerState, "factionAlignment" | "runeMastery">,
): number {
  return getLoadoutMismatchReport(player).penalty.dmgMult;
}
