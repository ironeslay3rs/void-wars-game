import type { GameState } from "@/features/game/gameTypes";
import { formatAffiliationLabel } from "@/lib/format";

export function getFactionHqsScreenData(state: GameState) {
  const factionAlignment = formatAffiliationLabel(state.player.factionAlignment);
  const isAligned = state.player.factionAlignment !== "unbound";

  return {
    eyebrow: "Bazaar / Faction HQs",
    title: "Faction HQs",
    subtitle:
      "Enter aligned power centers, build affiliation, and deepen doctrine-based progression systems.",
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
        label: "Doctrine Reward Tier",
        value: isAligned ? "Tier 1" : "Locked",
        hint: "Reward availability now reacts to active affiliation.",
      },
    ],
    sections: [
      {
        title: "Aligned Doctrines",
        description:
          "Review the known doctrine networks, identities, and ideological branches currently shaping the bazaar sphere.",
      },
      {
        title: "Doctrine Operations",
        description:
          "Reserved for doctrine reputation tracks, affiliation perks, contracts, and unlockable command options.",
        body: isAligned
          ? `Current affiliation detected: ${factionAlignment}. Future doctrine operations can now branch from this live shared state.`
          : "No affiliation detected yet. Choose a path to unlock doctrine operations, contracts, and deeper progression.",
      },
    ],
  };
}