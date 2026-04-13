/**
 * Task 3.1 canonical entry point — price calculation.
 *
 * Implementation lives in `blackMarketPricing.ts` (rapport-aware
 * Black Market quote helpers). Re-exported here under the file name
 * the Active-Sprint spec calls for.
 *
 * Composes:
 * - Base listing price (from blackMarketListings.ts)
 * - Fusion markup (BLACK_MARKET_BUY_MARKUP) / fence rate (BLACK_MARKET_SELL_PREMIUM)
 * - Rapport discount tier (rapportDiscount.ts) — best rapport across
 *   ALL brokers, since the Exchange Floor is a shared neutral venue
 */

export {
  getBestBrokerRapport,
  quoteBlackMarketBuy,
  quoteBlackMarketSell,
  type BlackMarketBuyQuote,
  type BlackMarketSellQuote,
} from "@/features/market/blackMarketPricing";
