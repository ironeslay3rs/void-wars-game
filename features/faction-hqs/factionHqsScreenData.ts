import type { GameState } from "@/features/game/gameTypes";

function formatFactionLabel(alignment: GameState["player"]["factionAlignment"]) {
  switch (alignment) {
    case "bio":
      return "Verdant Coil";
    case "mecha":
      return "Chrome Synod";
    case "spirit":
      return "Ember Vault";
    default:
      return "Unbound";
  }
}

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Faction HQs",
    title: "Faction HQs",
    subtitle:
      "Enter school strongholds, build allegiance, and prepare for guild-era expansion across the Void.",
    cards: [
      {
        label: "Faction Alignment",
        value: formatFactionLabel(state.player.factionAlignment),
        hint: "Live shared faction state from the global game store.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence now comes from shared state.",
      },
      {
        label: "Faction Reward Tier",
        value: state.player.factionAlignment === "unbound" ? "Locked" : "Tier 1",
        hint: "Reward availability now reacts to faction alignment.",
      },
    ],
  };
}