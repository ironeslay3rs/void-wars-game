export type NavigationItem = {
  id: string;
  label: string;
  route: string;

  unlocked: boolean;
  requiredRank?: number;
};

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    route: "/",
    unlocked: true,
  },
  {
    id: "missions",
    label: "Missions",
    route: "/missions",
    unlocked: true,
  },
  {
    id: "bazaar",
    label: "Bazaar",
    route: "/bazaar",
    unlocked: true,
  },
  {
    id: "inventory",
    label: "Inventory",
    route: "/inventory",
    unlocked: true,
  },
  {
    id: "factions",
    label: "Factions",
    route: "/factions",
    unlocked: true,
  },
  {
    id: "arena",
    label: "Arena",
    route: "/arena",
    unlocked: false,
    requiredRank: 3,
  },
  {
    id: "blackmarket",
    label: "Black Market",
    route: "/bazaar/black-market",
    unlocked: false,
    requiredRank: 5,
  },
];