import { PlayerState } from "./gameTypes";

export function hasMeaningfulProgress(state: PlayerState): boolean {
  const hasCompletedMission = state.missions.some(
    (mission) => mission.status === "completed"
  );

  const hasActiveMission = state.missions.some(
    (mission) => mission.status === "active"
  );

  const hasNonStarterInventory = state.inventory.some(
    (item) => item.id !== "starter-ration"
  );

  const hasAdvancedDistricts = state.unlockedDistricts.length > 1;

  return (
    state.path !== null ||
    hasCompletedMission ||
    hasActiveMission ||
    hasNonStarterInventory ||
    hasAdvancedDistricts ||
    state.rankLevel > 1 ||
    state.rankXp > 0
  );
}

export function getContinueRoute(state: PlayerState): string {
  if (state.activeMissionId) {
    return "/missions";
  }

  const hasAvailableMission = state.missions.some(
    (mission) => mission.status === "available"
  );

  const hasCompletedMission = state.missions.some(
    (mission) => mission.status === "completed"
  );

  if (hasAvailableMission || hasCompletedMission) {
    return "/missions";
  }

  if (state.rankLevel > 1 || state.rankXp > 0) {
    return "/status";
  }

  if (state.path) {
    return "/missions";
  }

  return "/";
}