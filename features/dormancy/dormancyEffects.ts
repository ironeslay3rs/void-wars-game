/**
 * Dormancy Effects — per-tier consequence multipliers.
 *
 * Canon anchors:
 *   - lore-canon/CLAUDE.md → Offline Lifecycle (Stable → Strained →
 *     Dormant → Displaced). Fusion pillar: Darkest Dungeon readable
 *     punishment — tiers MUST bite harder as you fall further.
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — absence is
 *     erosion. Flesh ebbs, the Void creeps in, and reintegration is not
 *     free.
 *
 * Design rules:
 *   - `conditionDrainPerDay` reads against the 0–100 condition scale
 *     (HIGH = healthy) — it is the amount subtracted per 24 offline hours.
 *   - `corruptionGainPerDay` reads against the 0–100 corruption scale
 *     (HIGH = tainted) — added per 24 offline hours. Stable is flat zero.
 *   - `rewardPenaltyMult` multiplies income/reward payouts earned while
 *     the player is still in this tier at settlement time (1 = neutral).
 *   - `recoveryCostMult` scales reintegration expense (hub service costs,
 *     cleansing fees) when the player returns online.
 *
 * All numbers are tunable constants. Pure — consumers fold the result.
 */

import type { DormancyTier } from "@/features/dormancy/dormancyTiers";

export type DormancyEffectTuning = {
  /** Points of condition lost per 24h offline in this tier. */
  conditionDrainPerDay: number;
  /** Points of corruption gained per 24h offline in this tier. */
  corruptionGainPerDay: number;
  /** Multiplier on rewards earned while in this tier (1 = neutral). */
  rewardPenaltyMult: number;
  /** Multiplier on reintegration/recovery costs (1 = neutral). */
  recoveryCostMult: number;
};

/**
 * Canonical tuning table. Ramp is geometric-ish so the gap between
 * tiers is felt, not grindy:
 *
 *   Stable     — no bite, full rewards, no recovery.
 *   Strained   — light drain, mild corruption creep, 5% reward shave.
 *   Dormant    — meaningful body/soul erosion, 15% reward shave, 1.5x costs.
 *   Displaced  — harsh; 30% reward shave and 2.5x recovery to return.
 */
export const DORMANCY_EFFECTS: Record<DormancyTier, DormancyEffectTuning> = {
  stable: {
    conditionDrainPerDay: 0,
    corruptionGainPerDay: 0,
    rewardPenaltyMult: 1,
    recoveryCostMult: 1,
  },
  strained: {
    conditionDrainPerDay: 2,
    corruptionGainPerDay: 1,
    rewardPenaltyMult: 0.95,
    recoveryCostMult: 1.1,
  },
  dormant: {
    conditionDrainPerDay: 5,
    corruptionGainPerDay: 3,
    rewardPenaltyMult: 0.85,
    recoveryCostMult: 1.5,
  },
  displaced: {
    conditionDrainPerDay: 8,
    corruptionGainPerDay: 5,
    rewardPenaltyMult: 0.7,
    recoveryCostMult: 2.5,
  },
};

/** Pure lookup — cheap enough to call inline. */
export function getDormancyEffects(tier: DormancyTier): DormancyEffectTuning {
  return DORMANCY_EFFECTS[tier];
}

/**
 * Base recovery cost (in credits) for fully flushing the dormancy debuff
 * at this tier before effect multipliers. Kept small at lower tiers so
 * casual absence doesn't punish engagement; Displaced is a deliberate
 * re-entry tax.
 */
export const DORMANCY_BASE_RECOVERY_COST: Record<DormancyTier, number> = {
  stable: 0,
  strained: 25,
  dormant: 150,
  displaced: 600,
};

/**
 * Final pending recovery cost = base × recoveryCostMult. Rounded down;
 * clamped at 0. Consumers can show this in UI before the player returns.
 */
export function computeRecoveryCost(tier: DormancyTier): number {
  const base = DORMANCY_BASE_RECOVERY_COST[tier];
  const mult = DORMANCY_EFFECTS[tier].recoveryCostMult;
  const raw = Math.floor(Math.max(0, base) * Math.max(0, mult));
  return raw < 0 ? 0 : raw;
}
