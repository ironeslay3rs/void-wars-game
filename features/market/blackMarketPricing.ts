import {
  getRapportDiscountPct,
  getDiscountedCost,
} from "@/features/broker-dialogue/rapportDiscount";
import {
  BLACK_MARKET_BUY_MARKUP,
  BLACK_MARKET_SELL_PREMIUM,
  getBlackMarketListingById,
} from "@/features/market/blackMarketListings";
import { RESOURCE_BASE_PRICES } from "@/features/market/marketData";
import type { ResourceKey } from "@/features/game/gameTypes";

/**
 * The Exchange Floor is a shared neutral venue — no single broker owns it.
 * Rapport discount uses the player's best rapport across ALL brokers,
 * reflecting overall trust earned in the Black Market community.
 */
export function getBestBrokerRapport(
  brokerRapport: Record<string, number>,
): number {
  let best = 0;
  for (const v of Object.values(brokerRapport)) {
    if (v > best) best = v;
  }
  return best;
}

export type BlackMarketBuyQuote = {
  basePrice: number;
  markupPrice: number;
  rapportDiscountPct: number;
  finalPrice: number;
};

export function quoteBlackMarketBuy(
  listingId: string,
  bestRapport: number,
): BlackMarketBuyQuote | null {
  const listing = getBlackMarketListingById(listingId);
  if (!listing) return null;
  const basePrice = listing.priceCredits;
  const markupPrice = Math.ceil(basePrice * BLACK_MARKET_BUY_MARKUP);
  const rapportDiscountPct = getRapportDiscountPct(bestRapport);
  const finalPrice = getDiscountedCost(markupPrice, bestRapport);
  return { basePrice, markupPrice, rapportDiscountPct, finalPrice };
}

export type BlackMarketSellQuote = {
  basePerUnit: number;
  grossBeforeFence: number;
  rapportBonusPct: number;
  net: number;
};

/**
 * Sell quote with rapport bonus. Trusted sellers get a BETTER fence rate
 * (rapport bonus added on top of the base 90% premium). At Trusted tier
 * the fence pays ~108% of base (0.9 * 1.20) instead of flat 90%.
 */
export function quoteBlackMarketSell(
  key: ResourceKey,
  amount: number,
  bestRapport: number,
): BlackMarketSellQuote {
  const basePerUnit = RESOURCE_BASE_PRICES[key] ?? 0;
  const n = Math.max(0, Math.floor(amount));
  const gross = basePerUnit * n;
  const rapportBonusPct = getRapportDiscountPct(bestRapport);
  const fenceRate = BLACK_MARKET_SELL_PREMIUM * (1 + rapportBonusPct / 100);
  const net = Math.max(1, Math.floor(gross * fenceRate));
  return { basePerUnit, grossBeforeFence: gross, rapportBonusPct, net };
}
