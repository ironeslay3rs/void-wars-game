export const SURVIVAL_TICK_INTERVAL_MS = 60000;
export const HUNGER_DECAY_PER_TICK = 1;
export const HUNGER_FED_THRESHOLD = 70;
export const HUNGER_PRESSURE_THRESHOLD = 40;
export const HUNGER_CONDITION_PRESSURE_PER_TICK = 1;

export const ACTIVITY_HUNGER_COST = {
  exploration: 8,
  mission: 6,
  hunt: 10,
} as const;

export const MOSS_RATION_RECIPE_COST = {
  bioSamples: 10,
  ironOre: 5,
} as const;

export const MOSS_RATION_HUNGER_RESTORE = 25;
export const MOSS_RATION_CONDITION_RESTORE = 5;
export const EMERGENCY_RATION_COST = 100;
export const EMERGENCY_RATION_CONDITION_RESTORE = 25;
export const EMERGENCY_RATION_COOLDOWN_MS = 30000;

export type SurvivalActivity = keyof typeof ACTIVITY_HUNGER_COST;

export function getHungerLabel(hunger: number) {
  if (hunger >= HUNGER_FED_THRESHOLD) return "Fed";
  if (hunger >= HUNGER_PRESSURE_THRESHOLD) return "Low";
  return "Starving";
}

export type HungerPressureTier = "fed" | "low" | "starving";

/**
 * Discrete hunger pressure effects for M2 resource sink tuning.
 * - Fed: no penalty
 * - Low: slight payout reduction + slightly harsher condition drain
 * - Starving: stronger payout reduction + stronger condition drain
 *
 * Kept intentionally simple (no hidden math, no stacking).
 */
export function getHungerPressureEffects(hunger: number): {
  tier: HungerPressureTier;
  label: ReturnType<typeof getHungerLabel>;
  rewardPenaltyPct: number; // 0..20
  conditionDrainPenalty: number; // extra condition drain to apply to a run
  rewardMultiplier: number; // 1 - rewardPenaltyPct/100
} {
  if (hunger >= HUNGER_FED_THRESHOLD) {
    return {
      tier: "fed",
      label: "Fed",
      rewardPenaltyPct: 0,
      conditionDrainPenalty: 0,
      rewardMultiplier: 1,
    };
  }

  if (hunger >= HUNGER_PRESSURE_THRESHOLD) {
    return {
      tier: "low",
      label: "Low",
      rewardPenaltyPct: 10,
      conditionDrainPenalty: 2,
      rewardMultiplier: 0.9,
    };
  }

  return {
    tier: "starving",
    label: "Starving",
    rewardPenaltyPct: 20,
    conditionDrainPenalty: 4,
    rewardMultiplier: 0.8,
  };
}

export function getActivityHungerCost(activity: SurvivalActivity) {
  return ACTIVITY_HUNGER_COST[activity];
}
