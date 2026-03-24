import type { MissionCategory } from "@/features/game/gameTypes";

export type OutboundRationActivity = "exploration" | "mission" | "hunt";

export const FIELD_RATION_COSTS: Record<OutboundRationActivity, number> = {
  exploration: 0,
  mission: 1,
  hunt: 1,
};

export function getFieldRationCost(activity: OutboundRationActivity) {
  return FIELD_RATION_COSTS[activity];
}

export function getMissionFieldRationCost(category: MissionCategory) {
  return category === "hunting-ground"
    ? getFieldRationCost("hunt")
    : getFieldRationCost("mission");
}

export function hasEnoughFieldRations(
  currentFieldRations: number,
  activity: OutboundRationActivity,
) {
  return currentFieldRations >= getFieldRationCost(activity);
}

export function hasEnoughFieldRationsForMission(
  currentFieldRations: number,
  category: MissionCategory,
) {
  return currentFieldRations >= getMissionFieldRationCost(category);
}

export function formatFieldRationCost(cost: number) {
  if (cost <= 0) {
    return "No Field Rations";
  }

  return `${cost} Field Ration${cost === 1 ? "" : "s"}`;
}
