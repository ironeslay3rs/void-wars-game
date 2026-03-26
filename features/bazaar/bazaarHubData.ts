export type BazaarHubId = "void-market" | "black-market";

export type BazaarHubThemeKey = "market" | "blackMarket";

export type BazaarHub = {
  id: BazaarHubId;
  title: string;
  subtitle: string;
  badge: string;
  route: string;
  themeKey: BazaarHubThemeKey;
  positionClass: string;
  widthClass: string;
};

export const bazaarHubData: BazaarHub[] = [
  {
    id: "void-market",
    title: "War Exchange",
    subtitle: "Taxed buys · listing-fee sells · four commodities",
    badge: "M3 Commodity Desk",
    route: "/bazaar/war-exchange",
    themeKey: "market",
    positionClass: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2",
    widthClass: "w-[360px]",
  },
  {
    id: "black-market",
    title: "Black Market",
    subtitle: "Neutral Survivor Citadel",
    badge: "Deals Are Sacred",
    route: "/bazaar/black-market",
    themeKey: "blackMarket",
    positionClass: "left-1/2 top-[78%] -translate-x-1/2 -translate-y-1/2",
    widthClass: "w-[340px]",
  },
];
