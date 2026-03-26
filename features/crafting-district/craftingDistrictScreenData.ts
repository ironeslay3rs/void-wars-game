import type { GameState } from "@/features/game/gameTypes";

export function getCraftingDistrictScreenData(state: GameState) {
  return {
    eyebrow: "Bazaar / Crafting District",
    title: "Crafting District",
    subtitle:
      "Survival buffers first. Bind Moss Rations to control hunger pressure, refine salvage into working stock, then graduate into deeper Rune Crafter outputs once the core loop is stable.",
    cards: [
      {
        label: "Utility Focus",
        value: "Moss Binder",
        hint: "Primary early action: convert field biomass into a ration that protects the next run.",
      },
      {
        label: "Ration Stock",
        value: String(state.player.resources.mossRations),
        hint: "Ready-to-use field supply for hunger stabilization.",
      },
      {
        label: "Bio Samples",
        value: String(state.player.resources.bioSamples),
        hint: "Early crafting fuel. Spend this first when survival becomes the blocker.",
      },
      {
        label: "Material Stock",
        value: `${state.player.resources.ironOre + state.player.resources.scrapAlloy + state.player.resources.runeDust + state.player.resources.emberCore + state.player.resources.bioSamples}`,
        hint: "Current salvage on hand across existing tracked inputs.",
      },
    ],
  };
}
