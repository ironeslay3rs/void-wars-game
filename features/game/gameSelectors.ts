import type { GameState } from "@/features/game/gameTypes";

export function getFactionAlignment(state: GameState) {
  return state.player.factionAlignment;
}

export function hasChosenPath(state: GameState) {
  return state.player.factionAlignment !== "unbound";
}

export function hasUnlockedRoutes(state: GameState) {
  return state.player.unlockedRoutes.length > 0;
}

export function isTeleportGateOpen(state: GameState) {
  return state.player.districtState.gateStatus === "open";
}

export function canAccessTeleportGate(state: GameState) {
  return (
    state.player.unlockedRoutes.includes("/bazaar/teleport-gate") ||
    state.player.unlockedRoutes.includes("teleport-gate") ||
    state.player.districtState.gateStatus !== "standby" ||
    hasChosenPath(state)
  );
}

export function canContinueGame(state: GameState) {
  return (
    hasChosenPath(state) ||
    state.player.rankLevel > 1 ||
    state.player.influence > 0 ||
    state.player.knownRecipes.length > 0 ||
    hasUnlockedRoutes(state) ||
    state.player.districtState.gateStatus !== "standby" ||
    state.player.districtState.arenaStatus !== "locked"
  );
}

export function getContinueRoute(state: GameState) {
  if (canAccessTeleportGate(state)) {
    return "/bazaar/teleport-gate";
  }

  return "/";
}