import {
  canonFactionHqs,
  getFactionLabel,
} from "@/features/canonRegistry";
import type { GameState } from "@/features/game/gameTypes";

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: canonFactionHqs.eyebrow,
    title: canonFactionHqs.title,
    subtitle:
      "Enter aligned power centers, build allegiance, and deepen affiliation-based progression systems.",
    cards: [
      {
        label: "Affiliation",
        value: getFactionLabel(state.player.factionAlignment),
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
