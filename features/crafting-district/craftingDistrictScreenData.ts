import type { GameState } from "@/features/game/gameTypes";

export function getCraftingDistrictScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Crafting District",
    title: "Crafting District",
    subtitle:
      "A practical utility stop for turning current salvage into one immediate survival advantage before the next push.",
    cards: [
      {
        label: "Utility Focus",
        value: "Moss Binder",
        hint: "The active M1 use here is ration binding for survival pressure control.",
      },
      {
        label: "Ration Stock",
        value: String(state.player.resources.mossRations),
        hint: "Ready-to-use field supply for hunger stabilization.",
      },
      {
        label: "Bio Samples",
        value: String(state.player.resources.bioSamples),
        hint: "Primary recovered input for the district's active utility action.",
      },
      {
        label: "Material Stock",
        value: `${state.player.resources.ironOre + state.player.resources.scrapAlloy + state.player.resources.runeDust + state.player.resources.emberCore + state.player.resources.bioSamples}`,
        hint: "Current salvage on hand across existing tracked inputs.",
      },
    ],
  };
}
