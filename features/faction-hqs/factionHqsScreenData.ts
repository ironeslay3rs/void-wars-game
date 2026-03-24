import type { GameState } from "@/features/game/gameTypes";
import { formatAffiliationLabel } from "@/lib/format";

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Faction HQs",
    title: "Faction HQs",
    subtitle:
      "Enter aligned power centers, build affiliation, and deepen doctrine-based progression systems.",
    cards: [
      {
        label: "Affiliation",
        value: formatAffiliationLabel(state.player.factionAlignment),
        hint: "Live shared affiliation state from the global game store.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence now comes from shared state.",
      },
      {
        label: "Doctrine Reward Tier",
        value: state.player.factionAlignment === "unbound" ? "Locked" : "Tier 1",
        hint: "Reward availability now reacts to active affiliation.",
      },
    ],
  };
}