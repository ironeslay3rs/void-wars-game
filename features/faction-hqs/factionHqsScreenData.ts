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
        hint: "Doctrine wing allegiance — unlocks HQ stipends and pressure reading.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Standing currency for city-side progression.",
      },
      {
        label: "Guild contribution",
        value: String(state.player.guildContributionTotal),
        hint: "Mercenary ledger from closed contracts and void field work.",
      },
    ],
  };
}
