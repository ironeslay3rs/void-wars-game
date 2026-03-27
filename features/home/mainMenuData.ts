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
  { label: "Career", href: "/career", icon: "briefcase" },
  { label: "Mastery", href: "/mastery", icon: "brain" },
  { label: "Professions", href: "/professions", icon: "wrench" },
  { label: "Market", href: "/bazaar", icon: "store" },
  { label: "Arena", href: "/arena", icon: "trophy" },
  { label: "Guild", href: "/guild", icon: "users" },
  { label: "Missions", href: "/missions", icon: "folder" },
  { label: "Settings", href: "/settings", icon: "settings" },
];
