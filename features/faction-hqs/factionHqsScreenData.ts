import type { GameState } from "@/features/game/gameTypes";

function formatFactionLabel(alignment: GameState["player"]["factionAlignment"]) {
  switch (alignment) {
    case "bio":
      return "Bio";
    case "mecha":
      return "Mecha";
    case "spirit":
      return "Spirit";
    default:
      return "Unbound";
  }
}

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Faction HQs",
    title: "Faction HQs",
    subtitle:
      "Enter aligned power centers, build allegiance, and deepen faction-based progression systems.",
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