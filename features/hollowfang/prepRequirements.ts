/**
 * Hollowfang prep-requirements — readiness check.
 *
 * Darkest-Dungeon prep-tension: the boss should be UN-ATTEMPTABLE when
 * the player hasn't earned the right to attempt. Pure selector.
 *
 * Canon anchors:
 *   - `lore-canon/CLAUDE.md` Currency Hierarchy — apex materials
 *     (Bloodvein / Ashveil) gate prestige content.
 *   - `features/condition/consequenceTable.ts` — tier semantics we mirror.
 */

import type { PlayerState, ResourceKey } from "@/features/game/gameTypes";
import { conditionTier, corruptionTier } from "@/features/condition/consequenceTable";
import { getCorruptionPct } from "@/features/condition/corruptionEngine";
import { HOLLOWFANG_PROFILE } from "@/features/hollowfang/hollowfangProfile";

// ────────────────────────────────────────────────────────────────────
// Requirements (tunable data)
// ────────────────────────────────────────────────────────────────────

export type MaterialRequirement = {
  key: ResourceKey;
  amount: number;
  /**
   * Flavor string for the UI — e.g. "Verdant Coil marrow-charm".
   * Not required; the card/modal may synth from the key.
   */
  flavor?: string;
};

export type HollowfangPrepRequirements = {
  minRankLevel: number;
  minCondition: number;
  /** Corruption load MUST be at or below this (high = bad). */
  maxCorruption: number;
  /** At least one of each entry must be present in the stockpile. */
  materials: readonly MaterialRequirement[];
};

export const HOLLOWFANG_PREP: HollowfangPrepRequirements = {
  minRankLevel: HOLLOWFANG_PROFILE.recommendedRankLevel,
  minCondition: 55,
  maxCorruption: 60,
  materials: [
    { key: "bloodvein", amount: 1, flavor: "Verdant Coil apex — steady the body." },
    { key: "ashveil", amount: 1, flavor: "Ember Vault apex — steady the soul." },
    { key: "runeDust", amount: 20, flavor: "Rune-dust to re-read every tell." },
    { key: "emberCore", amount: 3, flavor: "Ember cores for burst windows." },
  ],
};

// ────────────────────────────────────────────────────────────────────
// Blocker taxonomy
// ────────────────────────────────────────────────────────────────────

export type PrepBlocker =
  | { kind: "rank"; required: number; actual: number }
  | { kind: "condition"; required: number; actual: number; tier: ReturnType<typeof conditionTier> }
  | { kind: "corruption"; required: number; actual: number; tier: ReturnType<typeof corruptionTier> }
  | { kind: "material"; key: ResourceKey; required: number; actual: number; flavor?: string };

export type PrepCheck = {
  ok: boolean;
  blockers: PrepBlocker[];
  /** Echo the requirements snapshot so UI can render a ready-card without re-importing. */
  requirements: HollowfangPrepRequirements;
};

// ────────────────────────────────────────────────────────────────────
// Pure check
// ────────────────────────────────────────────────────────────────────

type PrepPlayer = Pick<
  PlayerState,
  "rankLevel" | "condition" | "voidInstability" | "resources"
>;

export function checkPrep(
  player: PrepPlayer,
  req: HollowfangPrepRequirements = HOLLOWFANG_PREP,
): PrepCheck {
  const blockers: PrepBlocker[] = [];

  if (player.rankLevel < req.minRankLevel) {
    blockers.push({ kind: "rank", required: req.minRankLevel, actual: player.rankLevel });
  }

  if (player.condition < req.minCondition) {
    blockers.push({
      kind: "condition",
      required: req.minCondition,
      actual: player.condition,
      tier: conditionTier(player.condition),
    });
  }

  const corrPct = getCorruptionPct(player);
  if (corrPct > req.maxCorruption) {
    blockers.push({
      kind: "corruption",
      required: req.maxCorruption,
      actual: corrPct,
      tier: corruptionTier(corrPct),
    });
  }

  for (const m of req.materials) {
    const have = player.resources[m.key] ?? 0;
    if (have < m.amount) {
      blockers.push({
        kind: "material",
        key: m.key,
        required: m.amount,
        actual: have,
        flavor: m.flavor,
      });
    }
  }

  return { ok: blockers.length === 0, blockers, requirements: req };
}

/**
 * Readiness score 0..1 — convenience for UI bars. 1.0 = fully prepped.
 * Partial credit for partial materials so the meter doesn't feel binary.
 */
export function readinessScore(
  player: PrepPlayer,
  req: HollowfangPrepRequirements = HOLLOWFANG_PREP,
): number {
  const rankOk = Math.min(1, player.rankLevel / req.minRankLevel);
  const condOk = Math.min(1, player.condition / req.minCondition);
  const corrOk =
    getCorruptionPct(player) <= req.maxCorruption
      ? 1
      : Math.max(0, 1 - (getCorruptionPct(player) - req.maxCorruption) / 40);

  let matSum = 0;
  for (const m of req.materials) {
    const have = player.resources[m.key] ?? 0;
    matSum += Math.min(1, have / m.amount);
  }
  const matOk = req.materials.length === 0 ? 1 : matSum / req.materials.length;

  // Weighted — materials matter most (Darkest Dungeon prep pillar).
  const score = 0.4 * matOk + 0.25 * condOk + 0.2 * corrOk + 0.15 * rankOk;
  return Math.max(0, Math.min(1, score));
}
