import {
  canonFactionHqs,
  getFactionLabel,
} from "@/features/canonRegistry";
import type { GameState } from "@/features/game/gameTypes";

export function getFactionHqsScreenData(state: GameState) {
  const factionAlignment = getFactionLabel(state.player.factionAlignment);
  const isAligned = state.player.factionAlignment !== "unbound";

  return {
    eyebrow: canonFactionHqs.eyebrow,
    title: canonFactionHqs.title,
    subtitle:
      "Enter aligned power centers, build allegiance, and deepen affiliation-based progression systems.",
    cards: [
      {
        label: "Affiliation",
        value: factionAlignment,
        hint: "Live shared affiliation state from the global game store.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence now comes from shared state.",
      },
      {
        label: "Affiliation Reward Tier",
        value: isAligned ? "Tier 1" : "Locked",
        hint: "Reward availability now reacts to affiliation.",
      },
    ],
    sections: [
      {
        title: "Aligned Power Centers",
        description:
          "Review the known doctrine networks, identities, and ideological branches currently shaping the bazaar sphere.",
      },
      {
        title: "Affiliation Operations",
        description:
          "Reserved for affiliation reputation tracks, allegiance perks, contracts, and unlockable command options.",
        body: isAligned
          ? `Current affiliation detected: ${factionAlignment}. Future affiliation operations can now branch from this live shared state.`
          : "No affiliation detected yet. Choose a path to unlock affiliation operations, contracts, and deeper progression.",
      },
    ],
  };
}
