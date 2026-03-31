import type {
  FactionAlignment,
  PathType,
  ResourceKey,
} from "@/features/game/gameTypes";
import type { MarketListing } from "@/features/market/marketListings";
import { getContestedZoneMeta } from "@/features/world/contestedZone";

/**
 * Which power’s logistics line a listing roughly feeds (for war-demand pricing).
 * Omitted ids: neutral / mixed broker stock → no school tag.
 */
const LISTING_WAR_SUPPLY: Partial<Record<string, PathType>> = {
  "bio-sample-bundle": "bio",
  "moss-ration-pack": "bio",
  "field-med-patch": "bio",
  "rustfang-cleaver": "mecha",
  "patrol-shell": "mecha",
  "scrap-vest": "mecha",
  "iron-ore-bulk": "mecha",
  "scrap-alloy-pack": "mecha",
  "voidtooth-knife": "pure",
  "signal-flare": "pure",
  "rune-dust-vial": "pure",
  "ember-core-pair": "pure",
};

export function getListingWarSupplySchool(listingId: string): PathType | null {
  return LISTING_WAR_SUPPLY[listingId] ?? null;
}

/** Bulk materials the War Exchange buys from operatives, mapped to the same logistics schools as listings. */
const RESOURCE_WAR_SUPPLY: Partial<Record<ResourceKey, PathType>> = {
  ironOre: "mecha",
  scrapAlloy: "mecha",
  runeDust: "pure",
  emberCore: "pure",
  bioSamples: "bio",
  mossRations: "bio",
};

export function getResourceWarSupplySchool(key: ResourceKey): PathType | null {
  return RESOURCE_WAR_SUPPLY[key] ?? null;
}

/**
 * Multiplier stacked after stall arrears markup on War Exchange **buys** only.
 * Theater pressure + hot-sector scarcity; same-path contractors get a slight break on that lane.
 */
export function getWarExchangeBuyDemandMultiplier(
  listing: MarketListing,
  playerFaction: FactionAlignment,
  nowMs: number,
): number {
  const { school: contested } = getContestedZoneMeta(nowMs);
  const supplySchool = getListingWarSupplySchool(listing.id);
  let mult = 1.01;
  if (supplySchool === contested) {
    mult += 0.03;
  }
  if (
    playerFaction !== "unbound" &&
    playerFaction === contested &&
    supplySchool === contested
  ) {
    mult -= 0.02;
  }
  return mult;
}

/**
 * Multiplier on **gross** War Exchange sell quotes before broker tithe.
 * Hot-sector materials pay slightly more; same-path operatives get a small supplier premium.
 */
export function getWarExchangeSellDemandMultiplier(
  resourceKey: ResourceKey,
  playerFaction: FactionAlignment,
  nowMs: number,
): number {
  const { school: contested } = getContestedZoneMeta(nowMs);
  const supplySchool = getResourceWarSupplySchool(resourceKey);
  let mult = 1.01;
  if (supplySchool === contested) {
    mult += 0.03;
  }
  if (
    playerFaction !== "unbound" &&
    playerFaction === contested &&
    supplySchool === contested
  ) {
    mult += 0.02;
  }
  return mult;
}
