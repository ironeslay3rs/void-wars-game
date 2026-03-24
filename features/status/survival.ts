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
  bioSamples: 2,
  runeDust: 1,
} as const;

export const MOSS_RATION_HUNGER_RESTORE = 25;
export const MOSS_RATION_CONDITION_RESTORE = 5;

export type SurvivalActivity = keyof typeof ACTIVITY_HUNGER_COST;

export function getHungerLabel(hunger: number) {
  if (hunger >= HUNGER_FED_THRESHOLD) return "Fed";
  if (hunger >= HUNGER_PRESSURE_THRESHOLD) return "Low";
  return "Starving";
}

export function getActivityHungerCost(activity: SurvivalActivity) {
  return ACTIVITY_HUNGER_COST[activity];
}
