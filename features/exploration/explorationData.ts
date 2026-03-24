import type { MissionReward } from "@/features/game/gameTypes";

export const PHASE1_EXPLORATION_DURATION_MS = 60000;

export const phase1ExplorationReward: MissionReward = {
  rankXp: 18,
  masteryProgress: 4,
  conditionDelta: 0,
  influence: 1,
  resources: {
    credits: 35,
    ironOre: 2,
    fieldRations: 1,
  },
};
