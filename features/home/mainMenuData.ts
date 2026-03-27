export type MainMenuIconKey =
  | "briefcase"
  | "brain"
  | "wrench"
  | "store"
  | "black-market"
  | "trophy"
  | "users"
  | "social"
  | "missions"
  | "settings";

export type MainMenuItem = {
  label: string;
  href: string;
  icon: MainMenuIconKey;
  isPrimary?: boolean;
};

export const mainMenuItems: MainMenuItem[] = [
  { label: "Career", href: "/career", icon: "briefcase" },
  { label: "Mastery", href: "/mastery", icon: "brain" },
  { label: "Professions", href: "/professions", icon: "wrench" },
  { label: "Market", href: "/market", icon: "store" },
  { label: "Black Market", href: "/market/black-market", icon: "black-market" },
  { label: "Arena", href: "/arena", icon: "trophy" },
  { label: "Guild", href: "/guild", icon: "users" },
  { label: "Social", href: "/social", icon: "social" },
  { label: "Missions", href: "/missions", icon: "missions" },
  { label: "Settings", href: "/settings", icon: "settings" },
];