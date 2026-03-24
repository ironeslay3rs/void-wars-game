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
  const factionAlignment = formatFactionLabel(state.player.factionAlignment);
  const isAligned = state.player.factionAlignment !== "unbound";

  return {
    eyebrow: "Archive / Core Rule",
    title: "Seven-Sin World Doctrine",
    subtitle:
      "Humanity is the shadow of a higher form, exiled into the 3D Void. Bio, Mecha, and Pure must eventually fuse to break the prison.",
    cards: [
      {
        label: "Core Premise",
        value: "Break the Void",
        hint: "Evolution of body, mind, and soul is the only route to reclaim what humanity lost.",
      },
      {
        label: "Live Alignment",
        value: factionAlignment,
        hint: "The current player path mapped against the archive's three schools.",
      },
      {
        label: "Final Law",
        value: isAligned ? "Fusion Required" : "Path Not Chosen",
        hint: "Body + mind + soul is the divine trinity needed to transcend the Void.",
      },
    ],
    sections: [
      {
        title: "Archive Doctrine",
        description:
          "Review the three schools, their world empires, and the sin-bound myth structure driving the long arc.",
      },
      {
        title: "Alignment Consequence",
        description:
          "Current path pressure, future progression stakes, and why no single school is sufficient alone.",
        body: isAligned
          ? `${factionAlignment} is active. The archive frames this as a partial path only: mastery of one school grants leverage, but transcendence still requires fusion of Bio, Mecha, and Pure.`
          : "No path has been claimed. The archive's law is clear: each school grants only a fragment of humanity's lost shape, and fusion remains the end-state.",
      },
    ],
  };
}
