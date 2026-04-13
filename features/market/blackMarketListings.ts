import type {
  MarketListing,
} from "@/features/market/marketListings";

/**
 * Black Market exchange listings.
 *
 * Canon source: `lore-canon/01 Master Canon/Locations/Black Market.md`
 *   "The Black Market survives by fusing a little bit of everything.
 *    It is not pure Bio, pure Mecha, or pure Pure.
 *    That mixed identity is part of why it endures."
 *
 * The neutral cross-school marketplace. Distinct from:
 * - War Exchange (faction-pressured, clean economy)
 * - Golden Bazaar / Void Market (Greed lane, specific trades)
 *
 * Listings here are canonically MIXED — each grants a cross-discipline
 * bundle (scrapAlloy + runeDust, bioSamples + emberCore, etc.) rather
 * than a single-school resource. Pricing carries a small fusion markup
 * to reflect the risk of mixed provenance.
 *
 * FUTURE: Meldshards (canon Black Market fusion apex lesser form per
 * vault CLAUDE.md) are not yet a resource key. When added, they'll
 * slot into this listing set as the premium Black Market currency.
 * For now the venue runs on the existing 5-resource economy.
 */

export const BLACK_MARKET_LISTINGS: MarketListing[] = [
  {
    id: "bm-fusion-salvage-crate",
    name: "Fusion Salvage Crate",
    category: "materials",
    rarity: "Common",
    priceCredits: 180,
    stock: 10,
    description:
      "Unlabeled lot. Cross-provenance: alloy plate + rune dust + ember grit. The Black Market signature mixed bundle.",
    grant: { scrapAlloy: 3, runeDust: 2, emberCore: 1 },
  },
  {
    id: "bm-bonesmith-kit",
    name: "Bonesmith Kit",
    category: "materials",
    rarity: "Uncommon",
    priceCredits: 240,
    stock: 8,
    description:
      "Mixed-origin kit for field armorers — Bio tissue stabilizer plus Mecha frame scrap. Nobody asks where it came from.",
    grant: { bioSamples: 3, scrapAlloy: 3 },
  },
  {
    id: "bm-emberveil-dram",
    name: "Emberveil Dram",
    category: "consumables",
    rarity: "Uncommon",
    priceCredits: 260,
    stock: 6,
    description:
      "Mixed-discipline dose — Pure ember-fragment suspended in bio-preserving oil. Off-market grade.",
    grant: { emberCore: 1, bioSamples: 4 },
  },
  {
    id: "bm-sinful-lot",
    name: "Sinful Lot",
    category: "materials",
    rarity: "Rare",
    priceCredits: 380,
    stock: 4,
    description:
      "Rare cross-lane bundle — Bio, Mecha, and Pure contributions in one sealed pod. Fusion-grade provenance; premium price.",
    grant: { bioSamples: 4, scrapAlloy: 4, emberCore: 1, runeDust: 3 },
  },
  {
    id: "bm-rusted-cache",
    name: "Rusted Cache",
    category: "materials",
    rarity: "Common",
    priceCredits: 90,
    stock: 14,
    description:
      "Grab-bag of lower-grade salvage. Iron ore and scrap with a hand-written tag.",
    grant: { ironOre: 6, scrapAlloy: 2 },
  },
];

/**
 * Pricing multipliers distinguishing Black Market economy from War
 * Exchange. The Black Market mark is a "mixed-provenance risk premium":
 * players pay more to buy (fusion markup) and get less when selling
 * (haggle fence). War Exchange stays the efficient clean market.
 */
export const BLACK_MARKET_BUY_MARKUP = 1.15;
export const BLACK_MARKET_SELL_PREMIUM = 0.9;

export function getBlackMarketListingById(id: string): MarketListing | undefined {
  return BLACK_MARKET_LISTINGS.find((l) => l.id === id);
}
