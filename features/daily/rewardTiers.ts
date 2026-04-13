/**
 * Daily Reward Tiers — S/A/B/C performance grading + resource payouts.
 *
 * Pure: given a hunt and a performance record, returns a graded tier and a
 * flat resource reward bundle scaled by difficulty, boss-window tier, and
 * time-to-complete bonus.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type { DailyHunt } from "@/features/daily/huntRotation";
import type { BossWindow } from "@/features/daily/bossSchedule";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

export type DailyRewardTier = "S" | "A" | "B" | "C";

export type DailyPerformance = {
  /** Mobs the player cleared during the run. */
  mobsCleared: number;
  /** Did the player kill the scheduled/zone boss? */
  bossDefeated: boolean;
  /** Total time the run took, in seconds. */
  elapsedSeconds: number;
  /** Par time for the zone, in seconds (e.g. 10 minutes = 600). */
  parSeconds: number;
  /** Whether the run was completed inside an apex boss window. */
  scheduledWindow?: BossWindow | null;
};

export type DailyReward = {
  tier: DailyRewardTier;
  score: number; // 0..100, the underlying grading score
  payouts: Partial<Record<ResourceKey, number>>;
  rewardMultiplier: number;
};

/** Score contributions, all 0..1, weighted and summed to a 0..100 score. */
function computeScore(hunt: DailyHunt, perf: DailyPerformance): number {
  const quota = Math.max(1, hunt.clearQuota);
  const clearRatio = Math.min(1, perf.mobsCleared / quota);

  const bossScore = perf.bossDefeated ? 1 : 0;

  const par = Math.max(1, perf.parSeconds);
  const elapsed = Math.max(1, perf.elapsedSeconds);
  // 1.0 at or under par, falling to 0 at 2x par.
  const paceRatio = Math.max(0, Math.min(1, (2 * par - elapsed) / par));

  // Weights: clears 55, boss 25, pace 20.
  const raw = clearRatio * 55 + bossScore * 25 + paceRatio * 20;
  return Math.round(raw);
}

function scoreToTier(score: number): DailyRewardTier {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  return "C";
}

function tierMultiplier(tier: DailyRewardTier): number {
  switch (tier) {
    case "S":
      return 1.6;
    case "A":
      return 1.25;
    case "B":
      return 1;
    case "C":
      return 0.65;
  }
}

function windowMultiplier(window?: BossWindow | null): number {
  if (!window) return 1;
  return window.tier === "apex" ? 1.25 : 1.1;
}

/** Base resource bundle keyed by zone loot theme. */
function baseBundleForTheme(
  theme: VoidZoneLootTheme,
): Partial<Record<ResourceKey, number>> {
  switch (theme) {
    case "ash_mecha":
      return { credits: 240, scrapAlloy: 18, emberCore: 6 };
    case "bio_rot":
      return { credits: 240, bioSamples: 16, runeDust: 4 };
    case "void_pure":
      // Pure theme — NEVER "Spirit".
      return { credits: 260, runeDust: 12, emberCore: 4 };
  }
}

function scaleBundle(
  bundle: Partial<Record<ResourceKey, number>>,
  factor: number,
): Partial<Record<ResourceKey, number>> {
  const out: Partial<Record<ResourceKey, number>> = {};
  for (const key of Object.keys(bundle) as ResourceKey[]) {
    const v = bundle[key];
    if (typeof v !== "number") continue;
    const scaled = Math.max(0, Math.round(v * factor));
    if (scaled > 0) out[key] = scaled;
  }
  return out;
}

export function gradeDailyHunt(
  hunt: DailyHunt,
  perf: DailyPerformance,
): DailyReward {
  const score = computeScore(hunt, perf);
  const tier = scoreToTier(score);

  const multiplier =
    hunt.rewardMultiplier *
    tierMultiplier(tier) *
    windowMultiplier(perf.scheduledWindow);

  const base = baseBundleForTheme(hunt.lootTheme);
  const payouts = scaleBundle(base, multiplier);

  return {
    tier,
    score,
    payouts,
    rewardMultiplier: multiplier,
  };
}

/** Convenience: list the grading thresholds (useful for UI previews). */
export const DAILY_TIER_THRESHOLDS: Array<{
  tier: DailyRewardTier;
  minScore: number;
}> = [
  { tier: "S", minScore: 90 },
  { tier: "A", minScore: 75 },
  { tier: "B", minScore: 55 },
  { tier: "C", minScore: 0 },
];
