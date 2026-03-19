export type MainMenuIconKey =
  | "play"
  | "folder"
  | "briefcase"
  | "brain"
  | "wrench"
  | "store"
  | "trophy"
  | "users"
  | "settings";

export type MainMenuItem = {
  label: string;
  href: string;
  icon: MainMenuIconKey;
  isPrimary?: boolean;
};

export const mainMenuItems: MainMenuItem[] = [
  { label: "Continue", href: "/", icon: "folder", isPrimary: true },
  { label: "New Game", href: "/", icon: "play" },
  { label: "Career", href: "/status", icon: "briefcase" },
  { label: "Mastery", href: "/factions", icon: "brain" },
  { label: "Professions", href: "/status", icon: "wrench" },
  { label: "Market", href: "/bazaar", icon: "store" },
  { label: "Arena", href: "/arena", icon: "trophy" },
  { label: "Guild", href: "/missions", icon: "users" },
  { label: "Settings", href: "/status", icon: "settings" },
];