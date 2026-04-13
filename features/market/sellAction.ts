/**
 * Task 3.1 canonical entry point — sell action.
 *
 * Implementation lives in `marketActions.ts` (`applyBlackMarketSell`)
 * and `blackMarketPricing.ts` (`quoteBlackMarketSell`). Re-exported
 * here under the file name the Active-Sprint spec calls for.
 */

export {
  applyBlackMarketSell,
  quoteBlackMarketSellCredits,
} from "@/features/market/marketActions";

export { quoteBlackMarketSell } from "@/features/market/blackMarketPricing";
