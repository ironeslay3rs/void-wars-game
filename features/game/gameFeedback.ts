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
      return "Use for recovery and citadel services.";
    case "ironOre":
      return "Bank for forge stock and repairs.";
    case "scrapAlloy":
      return "Hold for heavier fabrication work.";
    case "runeDust":
      return "Spend on ritual crafting and ration binding.";
    case "emberCore":
      return "Rare forge fuel. Save it.";
    case "bioSamples":
      return "Convert into rations or Feast Hall recovery.";
    case "mossRations":
      return "Use to ease hunger and survival pressure.";
    default:
      return "Banked into current stock.";
  }
}
