/**
 * Dormancy Recovery — projection helper.
 *
 * Canon anchors:
 *   - lore-canon/CLAUDE.md → Offline Lifecycle (Stable → Strained →
 *     Dormant → Displaced).
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — absence
 *     degrades body and soul; returning is never free.
 *
 * What this is:
 *   Pure projection. Given a player's condition/corruption state and the
 *   elapsed offline hours since they were last seen, return the tier they
 *   would land in, the deltas they would absorb, and the pending recovery
 *   cost a reducer would charge on return.
 *
 * What this is NOT:
 *   This does not mutate state. No reducer wiring here. The caller (next
 *   task) folds `conditionDelta`, `corruptionDelta`, and `pendingRecoveryCost`
 *   into whatever game-state pipeline is appropriate. Clamps guarantee no
 *   projection moves condition below 0 or corruption above 100 / below 0.
 *
 * Inputs:
 *   - `player`: any object exposing `condition` and `voidInstability`. We
 *     accept `Pick<PlayerState, ...>` so tests don't need to build a full
 *     PlayerState.
 *   - `elapsedHours`: plain number. The caller (or future reducer wiring)
 *     computes this from a `lastSeenAt` / `lastActiveAt` timestamp when
 *     that field lands on PlayerState. Non-finite / negative input is
 *     treated as zero (no-op projection).
 */

import type { PlayerState } from "@/features/game/gameTypes";
import {
  classifyDormancy,
  type DormancyTier,
} from "@/features/dormancy/dormancyTiers";
import {
  computeRecoveryCost,
  getDormancyEffects,
} from "@/features/dormancy/dormancyEffects";
import {
  clampCorruption,
  getCorruptionPct,
} from "@/features/condition/corruptionEngine";

// ────────────────────────────────────────────────────────────────────
// Local clamps — condition mirrors the 0–100 scale used by
// features/condition. Kept local so this module doesn't depend on
// condition reducer internals.
// ────────────────────────────────────────────────────────────────────

const MIN_CONDITION = 0;
const MAX_CONDITION = 100;

function clampCondition(v: number): number {
  if (!Number.isFinite(v)) return MIN_CONDITION;
  if (v < MIN_CONDITION) return MIN_CONDITION;
  if (v > MAX_CONDITION) return MAX_CONDITION;
  return v;
}

// ────────────────────────────────────────────────────────────────────
// Projection
// ────────────────────────────────────────────────────────────────────

export type DormancyProjection = {
  /** Tier the player lands in after `elapsedHours` away. */
  newTier: DormancyTier;
  /**
   * Signed delta to apply to `player.condition`. Always <= 0. Already
   * clamped so `player.condition + conditionDelta >= 0`.
   */
  conditionDelta: number;
  /**
   * Signed delta to apply to `player.voidInstability`. Always >= 0.
   * Already clamped so the resulting corruption stays within [0, 100].
   */
  corruptionDelta: number;
  /**
   * Credits the player must pay on return to fully clear this tier's
   * dormancy penalty. 0 for `stable`. Rounded integer.
   */
  pendingRecoveryCost: number;
  /** Offline hours used for this projection (sanitized). */
  elapsedHours: number;
  /**
   * Multiplier on reward/income settlement while still in this tier.
   * Surfaced for UI so the player can see what they're giving up.
   */
  rewardPenaltyMult: number;
};

/**
 * Core pure projection. See file header. No side effects, no RNG.
 */
export function projectDormancy(
  player: Pick<PlayerState, "condition" | "voidInstability">,
  elapsedHours: number,
): DormancyProjection {
  const hours =
    Number.isFinite(elapsedHours) && elapsedHours > 0 ? elapsedHours : 0;
  const tier = classifyDormancy(hours);
  const tuning = getDormancyEffects(tier);

  // Per-day rates scale linearly with the elapsed window.
  const days = hours / 24;
  const rawConditionLoss = tuning.conditionDrainPerDay * days;
  const rawCorruptionGain = tuning.corruptionGainPerDay * days;

  // Clamp against the player's current values so we never go negative /
  // overflow. Both deltas are computed as the DIFFERENCE between pre- and
  // post-clamp values; this guarantees the caller can add them raw.
  const prevCondition = clampCondition(player.condition);
  const nextCondition = clampCondition(prevCondition - rawConditionLoss);
  const conditionDelta = nextCondition - prevCondition; // <= 0

  const prevCorruption = getCorruptionPct(player);
  const nextCorruption = clampCorruption(prevCorruption + rawCorruptionGain);
  const corruptionDelta = nextCorruption - prevCorruption; // >= 0

  const pendingRecoveryCost = computeRecoveryCost(tier);

  return {
    newTier: tier,
    conditionDelta,
    corruptionDelta,
    pendingRecoveryCost,
    elapsedHours: hours,
    rewardPenaltyMult: tuning.rewardPenaltyMult,
  };
}

/**
 * Convenience: project from two timestamps (ms since epoch). Pure helper
 * so consumers that DO have `lastSeenAt` on state don't have to do the
 * subtraction themselves. Out-of-order timestamps collapse to zero.
 */
export function projectDormancyFromTimestamps(
  player: Pick<PlayerState, "condition" | "voidInstability">,
  lastSeenAtMs: number,
  nowMs: number,
): DormancyProjection {
  const safeLast = Number.isFinite(lastSeenAtMs) ? lastSeenAtMs : nowMs;
  const safeNow = Number.isFinite(nowMs) ? nowMs : safeLast;
  const deltaMs = Math.max(0, safeNow - safeLast);
  const hours = deltaMs / (1000 * 60 * 60);
  return projectDormancy(player, hours);
}
