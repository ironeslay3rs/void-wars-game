import type { GameState } from "@/features/game/gameTypes";

function formatFactionLabel(alignment: GameState["player"]["factionAlignment"]) {
  switch (alignment) {
    case "bio":
      return "Bio";
    case "mecha":
      return "Mecha";
    case "spirit":
      return "Pure";
    default:
      return "Unbound";
  }
}

export function getFactionHqsScreenData(state: GameState) {
  const factionAlignment = formatFactionLabel(state.player.factionAlignment);
  const isAligned = state.player.factionAlignment !== "unbound";

  return {
    eyebrow: "Bazaar / Faction HQs",
    title: "Faction HQs",
    subtitle:
      "Enter aligned power centers, build allegiance, and deepen faction-based progression systems.",
    cards: [
      {
        label: "Doctrine Alignment",
        value: factionAlignment,
        hint: "Live shared doctrine state from the global game store.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence now comes from shared state.",
      },
      {
        label: "Faction Reward Tier",
        value: isAligned ? "Tier 1" : "Locked",
        hint: "Reward availability now reacts to doctrine alignment.",
      },
    ],
    sections: [
      {
        title: "Aligned Power Centers",
        description:
          "Review the known faction networks, identities, and ideological branches currently shaping the bazaar sphere.",
      },
      {
        title: "Faction Operations",
        description:
          "Reserved for faction reputation tracks, allegiance perks, contracts, and unlockable command options.",
        body: isAligned
          ? `Current doctrine detected: ${factionAlignment}. Future faction operations can now branch from this live shared state.`
          : "No doctrine alignment detected yet. Choose a doctrine to unlock faction operations, contracts, and deeper progression.",
      },
    ],
  };
}