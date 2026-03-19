import type { GameState } from "@/features/game/gameTypes";

export function getMechaFoundryScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Mecha Foundry",
    title: "Mecha Foundry",
    subtitle:
      "Upgrade frames, tune weapon systems, and prepare precision builds for future combat progression.",
    cards: [
      {
        label: "Frame Tier",
        value: "Base Chassis",
        hint: "No advanced mech frame has been installed yet.",
      },
      {
        label: "System Status",
        value: state.player.districtState.mechaStatus,
        hint: "Live shared state from the global game store.",
      },
      {
        label: "Installed Modules",
        value: "0",
        hint: `Credits available: ${state.player.resources.credits}`,
      },
    ],
  };
}