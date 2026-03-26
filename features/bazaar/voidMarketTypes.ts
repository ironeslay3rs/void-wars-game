export const VOID_MARKET_COMMODITIES = [
  "scrapAlloy",
  "emberCore",
  "runeDust",
  "bioSamples",
] as const;

export type VoidMarketCommodity = (typeof VOID_MARKET_COMMODITIES)[number];
