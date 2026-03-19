import {
  Briefcase,
  Shield,
  ScrollText,
  Swords,
  Store,
  Users,
  Settings,
  Gem,
  type LucideIcon,
} from "lucide-react";

export type NavigationItemId =
  | "inventory"
  | "status"
  | "missions"
  | "factions"
  | "black-market"
  | "arena"
  | "guild"
  | "settings";

export type NavigationPlacement = "bottom" | "side";

export type NavigationItem = {
  id: NavigationItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  placement: NavigationPlacement[];
  isLocked?: boolean;
  accent?: "red" | "green" | "blue" | "purple" | "gold" | "neutral";
};

export const navigationItems: NavigationItem[] = [
  {
    id: "inventory",
    label: "Inventory",
    href: "/inventory",
    icon: Briefcase,
    placement: ["bottom"],
    accent: "gold",
  },
  {
    id: "status",
    label: "Status",
    href: "/status",
    icon: Shield,
    placement: ["bottom"],
    accent: "blue",
  },
  {
    id: "missions",
    label: "Missions",
    href: "/missions",
    icon: ScrollText,
    placement: ["bottom"],
    accent: "red",
  },
  {
    id: "factions",
    label: "Factions",
    href: "/factions",
    icon: Users,
    placement: ["bottom"],
    accent: "purple",
  },
  {
    id: "black-market",
    label: "Black Market",
    href: "/bazaar",
    icon: Store,
    placement: ["bottom"],
    accent: "green",
  },
  {
    id: "arena",
    label: "Arena",
    href: "/arena",
    icon: Swords,
    placement: ["side"],
    accent: "red",
  },
  {
    id: "guild",
    label: "Guild",
    href: "/guild",
    icon: Gem,
    placement: ["side"],
    accent: "purple",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    placement: ["side"],
    accent: "neutral",
  },
];

export function getNavigationItemsByPlacement(
  placement: NavigationPlacement,
) {
  return navigationItems.filter((item) => item.placement.includes(placement));
}