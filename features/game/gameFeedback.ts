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
    case "coilboundLattice":
      return "Coilbound Lattice";
    case "ashSynodRelic":
      return "Ash Synod Relic";
    case "vaultLatticeShard":
      return "Vault Lattice Shard";
    case "ironHeart":
      return "Ironheart";
    default:
      return key;
  }
}

export function getResourceTier(key: ResourceKey): "common" | "rare" | "apex" {
  switch (key) {
    case "credits":
    case "ironOre":
    case "scrapAlloy":
    case "bioSamples":
    case "mossRations":
      return "common";
    case "runeDust":
    case "emberCore":
      return "rare";
    case "coilboundLattice":
    case "ashSynodRelic":
    case "vaultLatticeShard":
    case "ironHeart":
      return "apex";
    default:
      return "common";
  }
}

export function getResourceIdentity(key: ResourceKey): string {
  switch (key) {
    case "credits":
      return "Black Market currency. Spends everywhere — Feast Hall, Crafting District, market listings.";
    case "ironOre":
      return "Raw extraction ore. Chrome Synod territory bleeds this. Refine into Scrap Alloy to unlock utility.";
    case "scrapAlloy":
      return "Refined structural metal. Core crafting input for kits, armor repairs, and district fabrication.";
    case "runeDust":
      return "Ground ember residue from old rune collapse sites. Ember Vault currency — feeds attunement, kit priming, and rune work.";
    case "emberCore":
      return "Crystallised ember charge recovered from deep ruin shards. Rare prep material — burns hot and doesn't refill easy.";
    case "bioSamples":
      return "Live biological matter lifted from field targets. Verdant Coil currency — feeds Feast Hall plates and Void Extract.";
    case "mossRations":
      return "Compressed survival ration made from moss-field deposits. Eases hunger and condition pressure in the field.";
    case "coilboundLattice":
      return "Verdant Coil boss relic. Reserved for late mastery forge work — do not spend carelessly.";
    case "ashSynodRelic":
      return "Chrome Synod boss relic. Apex material tier — mythic forge access only.";
    case "vaultLatticeShard":
      return "Ember Vault boss relic. Soul-path ascension material — the rarest input in the current war economy.";
    case "ironHeart":
      return "Ironheart — mythic war material. Chrome Synod apex metal. Required for restricted-war forge access.";
    default:
      return "Banked into current stock.";
  }
}

export function getResourceLoopMeaning(key: ResourceKey): string {
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
      return "Spend at Feast Hall (Hunter's Plate) or Crafting District (Void Extract) to manage pressure.";
    case "mossRations":
      return "Use to ease hunger and survival pressure.";
    case "coilboundLattice":
    case "ashSynodRelic":
    case "vaultLatticeShard":
    case "ironHeart":
      return "Boss relic — reserve for late mastery forge work.";
    default:
      return "Banked into current stock.";
  }
}

export function getNonZeroResourceEntries(resources: Partial<ResourcesState>) {
  return Object.entries(resources).filter(
    ([, value]) => typeof value === "number" && value !== 0,
  ) as Array<[ResourceKey, number]>;
}
