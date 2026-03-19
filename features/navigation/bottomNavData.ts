export type BottomNavItem = {
  id: string;
  label: string;
  href: string;
};

export const bottomNavData: BottomNavItem[] = [
  { id: "inventory", label: "Inventory", href: "/inventory" },
  { id: "status", label: "Status", href: "/status" },
  { id: "missions", label: "Missions", href: "/missions" },
  { id: "factions", label: "Factions", href: "/factions" },
  { id: "black-market", label: "Black Market", href: "/bazaar" },
];