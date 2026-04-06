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
  { label: "Command", href: "/home", icon: "missions", isPrimary: true },
  { label: "Deploy", href: "/deploy-into-void", icon: "store", isPrimary: true },
  { label: "Contracts", href: "/missions", icon: "missions", isPrimary: true },
  { label: "Vitals", href: "/status", icon: "settings", isPrimary: true },
  { label: "Stores", href: "/inventory", icon: "briefcase", isPrimary: true },
  { label: "Black Market", href: "/bazaar/black-market", icon: "black-market", isPrimary: true },
  { label: "Arena", href: "/arena", icon: "trophy" },
  { label: "Career", href: "/career", icon: "briefcase" },
  { label: "Mastery", href: "/mastery", icon: "brain" },
  { label: "Professions", href: "/professions", icon: "wrench" },
];
