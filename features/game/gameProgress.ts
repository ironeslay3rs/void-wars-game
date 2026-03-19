import type { PlayerState } from "@/features/game/gameTypes";

export function hasMeaningfulProgress(player: PlayerState): boolean {
  const hasChosenPath = player.factionAlignment !== "unbound";
  const hasAdvancedLevel = player.level > 1;
  const hasInfluence = player.influence > 0;
  const hasRecipes = player.knownRecipes.length > 0;
  const hasUnlockedRoutes = player.unlockedRoutes.length > 0;
  const gateMoved = player.districtState.gateStatus !== "standby";
  const arenaMoved = player.districtState.arenaStatus !== "locked";

  return (
    hasChosenPath ||
    hasAdvancedLevel ||
    hasInfluence ||
    hasRecipes ||
    hasUnlockedRoutes ||
    gateMoved ||
    arenaMoved
  );
}

export function getContinueRoute(player: PlayerState): string {
  const hasTeleportRoute =
    player.unlockedRoutes.includes("/bazaar/teleport-gate") ||
    player.unlockedRoutes.includes("teleport-gate");

  if (hasTeleportRoute || player.districtState.gateStatus !== "standby") {
    return "/bazaar/teleport-gate";
  }

  return "/";
}