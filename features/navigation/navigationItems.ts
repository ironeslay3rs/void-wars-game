import {
  House,
  Compass,
  Briefcase,
  Shield,
  ScrollText,
  Store,
  type LucideIcon,
} from "lucide-react";
import { canonNavigationItems } from "@/features/canonRegistry";

export type NavigationItemId = keyof typeof canonNavigationItems | "home" | "deploy";

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
    id: "home",
    label: "Command",
    href: "/home",
    icon: House,
    placement: ["bottom"],
    accent: "neutral",
  },
  {
    id: "deploy",
    label: "Deploy",
    href: "/deploy-into-void",
    icon: Compass,
    placement: ["bottom"],
    accent: "red",
  },
  {
    ...canonNavigationItems.missions,
    label: "Contracts",
    icon: ScrollText,
    placement: ["bottom"],
    accent: "red",
  },
  {
    ...canonNavigationItems.status,
    label: "Vitals",
    icon: Shield,
    placement: ["bottom"],
    accent: "blue",
  },
  {
    ...canonNavigationItems.inventory,
    label: "Stores",
    icon: Briefcase,
    placement: ["bottom"],
    accent: "gold",
  },
  {
    ...canonNavigationItems.bazaar,
    label: "Black Market",
    icon: Store,
    placement: ["bottom"],
    accent: "green",
  },
];

export function getNavigationItemsByPlacement(
  placement: NavigationPlacement,
) {
  return navigationItems.filter((item) => item.placement.includes(placement));
}
