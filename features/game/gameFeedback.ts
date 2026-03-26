import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export function formatResourceLabel(key: string) {
  switch (key) {
    case "credits":
      return "Credits";
    case "ironOre":
      return "Iron Ore";
    case "scrapAlloy":
      return "Scrap Alloy";
    case "runeDust":
      return "Rune Dust";
    case "emberCore":
      return "Ember Core";
    case "bioSamples":
      return "Bio Samples";
    case "mossRations":
      return "Moss Rations";
    default:
      return key;
  }
}

export function getNonZeroResourceEntries(resources: Partial<ResourcesState>) {
  return Object.entries(resources).filter(
    ([, value]) => typeof value === "number" && value !== 0,
  ) as Array<[ResourceKey, number]>;
}

export function getResourceLoopMeaning(key: ResourceKey) {
  switch (key) {
    case "credits":
      return "Spend at Feast Hall and Crafting District to stabilize and prime the next deployment.";
    case "ironOre":
      return "Refine into Scrap Alloy in the Crafting District.";
    case "scrapAlloy":
      return "Prime utility kits like Scrap Kit in the Crafting District.";
    case "runeDust":
      return "Bind Moss Rations and prime kits in the Crafting District.";
    case "emberCore":
      return "Prime high-impact prep like Ember Stim in the Crafting District.";
    case "bioSamples":
      return "Spend at Feast Hall (Hunter’s Plate) or Crafting District (Void Extract) to manage pressure.";
    case "mossRations":
      return "Use to ease hunger and survival pressure.";
    default:
      return "Banked into current stock.";
  }
}
