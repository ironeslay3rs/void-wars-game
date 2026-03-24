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
    title: "Void Market",
    subtitle: "Primary Exchange",
    badge: "Open Trade & Auctions",
    route: "/bazaar/void-market",
    themeKey: "market",
    positionClass: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2",
    widthClass: "w-[360px]",
  },
  {
    id: "black-market",
    title: "Black Market",
    subtitle: "Neutral Citadel",
    badge: "Sin Lanes & Risk Services",
    route: "/bazaar/black-market",
    themeKey: "blackMarket",
    positionClass: "left-1/2 top-[78%] -translate-x-1/2 -translate-y-1/2",
    widthClass: "w-[340px]",
  },
];