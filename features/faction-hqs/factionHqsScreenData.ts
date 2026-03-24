import type { GameState } from "@/features/game/gameTypes";

function formatFactionLabel(alignment: GameState["player"]["factionAlignment"]) {
  switch (alignment) {
    case "bio":
      return "Bio / Verdant Coil";
    case "mecha":
      return "Mecha / Chrome Synod";
    case "spirit":
      return "Pure / Ember Vault";
    default:
      return "Unbound";
  }
}

export function getFactionHqsScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / School Thrones",
    title: "Faction HQs",
    subtitle:
      "Claim one of the three surviving schools, build influence, and prepare a fragment of the final fusion doctrine.",
    cards: [
      {
        label: "Faction Alignment",
        value: formatFactionLabel(state.player.factionAlignment),
        hint: "Live shared faction state expressed through the archive's school names.",
      },
      {
        label: "Influence",
        value: String(state.player.influence),
        hint: "Influence tracks standing within the chosen school network.",
      },
      {
        label: "Faction Reward Tier",
        value: state.player.factionAlignment === "unbound" ? "Locked" : "Tier 1",
        hint: "Rewards remain path-bound for now, even though final transcendence requires fusion later.",
      },
    ],
  };
}
