import type { GameState } from "@/features/game/gameTypes";

function formatFactionLabel(alignment: GameState["player"]["factionAlignment"]) {
  switch (alignment) {
    case "bio":
      return "Bio";
    case "mecha":
      return "Mecha";
    case "pure":
      return "Pure";
    default:
      return "Unbound";
  }
}

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Affiliation Concourse",
    title: "Affiliation Concourse",
    subtitle:
      "Enter aligned power centers, build allegiance, and deepen affiliation-based progression systems.",
    cards: [
      {
        label: "Affiliation",
        value: formatFactionLabel(state.player.factionAlignment),
        hint: "Live shared affiliation state from the global game store.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence now comes from shared state.",
      },
      {
        label: "Affiliation Reward Tier",
        value: state.player.factionAlignment === "unbound" ? "Locked" : "Tier 1",
        hint: "Reward availability now reacts to affiliation.",
      },
    ],
  };
}
