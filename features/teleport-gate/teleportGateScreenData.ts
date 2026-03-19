import type { GameState } from "@/features/game/gameTypes";

export function getTeleportGateScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Teleport Gate",
    title: "Teleport Gate",
    subtitle:
      "Launch into routes, danger zones, and expedition spaces through future travel systems.",
    cards: [
      {
        label: "Gate Status",
        value: state.player.districtState.gateStatus,
        hint: "Live shared gate state from the global game store.",
      },
      {
        label: "Unlocked Routes",
        value: String(state.player.unlockedRoutes.length),
        hint: "Routes now come from shared state.",
      },
      {
        label: "Travel Cost",
        value: state.player.unlockedRoutes.length > 0 ? "25 Credits" : "--",
        hint: "Basic placeholder cost based on unlocked travel access.",
      },
    ],
  };
}