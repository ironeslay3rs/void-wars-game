import type { GameState } from "@/features/game/gameTypes";

export function getCraftingDistrictScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Crafting District",
    title: "Crafting District",
    subtitle:
      "Forge gear, refine materials, socket runes, and create high-value items for future progression systems.",
    cards: [
      {
        label: "Forge Status",
        value: state.player.districtState.forgeStatus,
        hint: "Live shared state from the global game store.",
      },
      {
        label: "Known Recipes",
        value: String(state.player.knownRecipes.length),
        hint: "Unlocked recipes now come from shared state.",
      },
      {
        label: "Material Stock",
        value: `${state.player.resources.ironOre + state.player.resources.scrapAlloy + state.player.resources.runeDust + state.player.resources.emberCore + state.player.resources.fieldRations}`,
        hint: "Combined tracked materials and provision stock.",
      },
    ],
  };
}
