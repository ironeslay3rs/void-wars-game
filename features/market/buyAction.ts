/**
 * Task 3.1 canonical entry point — buy action.
 *
 * Implementation lives in `marketActions.ts` (`applyBlackMarketBuy`)
 * and `blackMarketPricing.ts` (`quoteBlackMarketBuy`). Re-exported
 * here under the file name the Active-Sprint spec calls for.
 */

export {
  applyBlackMarketBuy,
  quoteBlackMarketBuyCredits,
} from "@/features/market/marketActions";

export { quoteBlackMarketBuy } from "@/features/market/blackMarketPricing";
