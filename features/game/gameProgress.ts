import type { PlayerState } from "@/features/game/gameTypes";

export function hasMeaningfulProgress(player: PlayerState): boolean {
  const hasChosenPath = player.factionAlignment !== "unbound";
  const hasAdvancedLevel = player.rankLevel > 1;
  const hasInfluence = player.influence > 0;
  const hasRecipes = player.knownRecipes.length > 0;
  const hasUnlockedRoutes = player.unlockedRoutes.length > 0;
  const hasQueuedMissions = player.missionQueue.length > 0;
  const hasMissionCapacityUpgrade = player.maxMissionQueueSlots > 1;

  return (
    hasChosenPath ||
    hasAdvancedLevel ||
    hasInfluence ||
    hasRecipes ||
    hasUnlockedRoutes ||
    hasQueuedMissions ||
    hasMissionCapacityUpgrade
  );
}

export function getContinueRoute(player: PlayerState): string {
  if (player.missionQueue.length > 0) {
    return "/missions";
  }

  if (player.knownRecipes.length > 0) {
    return "/bazaar/crafting-district";
  }

  if (player.unlockedRoutes.length > 0) {
    return "/bazaar/teleport-gate";
  }

  if (player.factionAlignment !== "unbound") {
    return "/home";
  }

  return "/";
}