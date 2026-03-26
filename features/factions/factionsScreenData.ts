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
        hint: "Doctrine wing — drives pressure reading and HQ stipends.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "City-side standing separate from guild contribution.",
      },
      {
        label: "Guild contribution",
        value: String(state.player.guildContributionTotal),
        hint: "Mercenary ledger from contracts + realtime void theatres.",
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
