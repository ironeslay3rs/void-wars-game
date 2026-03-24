import { clamp } from "@/features/game/gameMissionUtils";
import type { PlayerState, SurvivalActivityType } from "@/features/game/gameTypes";

export const MAX_HUNGER = 100;
export const LOW_HUNGER_THRESHOLD = 25;
export const LOW_HUNGER_CONDITION_PENALTY = 3;
export const FIELD_RATIONS_RESTORE = 35;
export const FIELD_RATIONS_CRAFT_CREDITS_COST = 12;
export const FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST = 1;

const HUNGER_DRAIN_BY_ACTIVITY: Record<SurvivalActivityType, number> = {
  exploration: 8,
  mission: 6,
  hunt: 10,
};

export function getHungerStateLabel(hunger: number) {
  if (hunger >= 80) return "Fed";
  if (hunger >= 55) return "Steady";
  if (hunger >= LOW_HUNGER_THRESHOLD) return "Thin";
  return "Depleted";
}

export function applySurvivalActivity(player: PlayerState, activity: SurvivalActivityType) {
  const hungerDrain = HUNGER_DRAIN_BY_ACTIVITY[activity];
  const nextHunger = clamp(player.survival.hunger - hungerDrain, 0, MAX_HUNGER);
  const isLowHunger = nextHunger <= LOW_HUNGER_THRESHOLD;

  return {
    ...player,
    condition: isLowHunger
      ? clamp(player.condition - LOW_HUNGER_CONDITION_PENALTY, 0, 100)
      : player.condition,
    survival: {
      ...player.survival,
      hunger: nextHunger,
    },
  };
}
