import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export function formatResourceLabel(key: string) {
  switch (key) {
    case "fieldRations":
      return "Field Rations";
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
    default:
      return key;
  }
}

export function getNonZeroResourceEntries(resources: Partial<ResourcesState>) {
  return Object.entries(resources).filter(
    ([, value]) => typeof value === "number" && value !== 0,
  ) as Array<[ResourceKey, number]>;
}
