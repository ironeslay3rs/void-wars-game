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
import { canonNavigationItems } from "@/features/canonRegistry";

export type NavigationItemId = keyof typeof canonNavigationItems;

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
    ...canonNavigationItems.inventory,
    icon: Briefcase,
    placement: ["bottom"],
    accent: "gold",
  },
  {
    ...canonNavigationItems.status,
    icon: Shield,
    placement: ["bottom"],
    accent: "blue",
  },
  {
    ...canonNavigationItems.missions,
    icon: ScrollText,
    placement: ["bottom"],
    accent: "red",
  },
  {
    ...canonNavigationItems.factions,
    icon: Users,
    placement: ["bottom"],
    accent: "purple",
  },
  {
    ...canonNavigationItems.bazaar,
    icon: Store,
    placement: ["bottom"],
    accent: "green",
  },
  {
    ...canonNavigationItems.arena,
    icon: Swords,
    placement: ["side"],
    accent: "red",
  },
  {
    ...canonNavigationItems.guild,
    icon: Gem,
    placement: ["side"],
    accent: "purple",
  },
  {
    ...canonNavigationItems.settings,
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
