/**
 * Commodity prices, tax, listing fee, and quotes. Design context: `m3EconomyDesign.ts`.
 */
import type { CareerFocus } from "@/features/game/gameTypes";
import {
  VOID_MARKET_COMMODITIES,
  type VoidMarketCommodity,
} from "@/features/bazaar/voidMarketTypes";

export { VOID_MARKET_COMMODITIES, type VoidMarketCommodity };

export function isVoidMarketCommodity(
  key: string,
): key is VoidMarketCommodity {
  return (VOID_MARKET_COMMODITIES as readonly string[]).includes(key);
}

/** City tax on purchases (added to list price). */
export const VOID_MARKET_BUY_TAX_RATE = 0.08;

/** Listing fee withheld from sell proceeds (broker cut). */
export const VOID_MARKET_LISTING_FEE_RATE = 0.06;

/** Gathering focus: better realized sell prices before the listing fee. */
export const VOID_MARKET_GATHERING_SELL_BONUS = 0.06;

const COMMODITY_SHEET: Record<
  VoidMarketCommodity,
  { buyCreditsPerUnit: number; sellCreditsPerUnit: number }
> = {
  scrapAlloy: { buyCreditsPerUnit: 9, sellCreditsPerUnit: 5 },
  emberCore: { buyCreditsPerUnit: 45, sellCreditsPerUnit: 28 },
  runeDust: { buyCreditsPerUnit: 14, sellCreditsPerUnit: 8 },
  bioSamples: { buyCreditsPerUnit: 11, sellCreditsPerUnit: 6 },
};

export type VoidMarketBuyQuote = {
  baseCredits: number;
  taxCredits: number;
  totalCredits: number;
};

export function quoteVoidMarketBuy(
  units: number,
  commodity: VoidMarketCommodity,
): VoidMarketBuyQuote {
  const u = Math.max(0, Math.floor(units));
  const baseCredits = u * COMMODITY_SHEET[commodity].buyCreditsPerUnit;
  const totalCredits = Math.ceil(baseCredits * (1 + VOID_MARKET_BUY_TAX_RATE));
  const taxCredits = Math.max(0, totalCredits - baseCredits);
  return { baseCredits, taxCredits, totalCredits };
}

export type VoidMarketSellQuote = {
  grossCredits: number;
  listingFeeCredits: number;
  netCredits: number;
};

export function quoteVoidMarketSell(
  units: number,
  commodity: VoidMarketCommodity,
  careerFocus: CareerFocus | null,
): VoidMarketSellQuote {
  const u = Math.max(0, Math.floor(units));
  let grossCredits = u * COMMODITY_SHEET[commodity].sellCreditsPerUnit;
  if (careerFocus === "gathering") {
    grossCredits = Math.floor(
      grossCredits * (1 + VOID_MARKET_GATHERING_SELL_BONUS),
    );
  }
  const listingFeeCredits = Math.ceil(
    grossCredits * VOID_MARKET_LISTING_FEE_RATE,
  );
  const netCredits = Math.max(0, grossCredits - listingFeeCredits);
  return { grossCredits, listingFeeCredits, netCredits };
}

export const VOID_MARKET_COMMODITY_LABEL: Record<VoidMarketCommodity, string> =
  {
    scrapAlloy: "Scrap alloy",
    emberCore: "Ember core",
    runeDust: "Rune dust",
    bioSamples: "Bio samples",
  };
