export type HomeMenuItem = {
  id: string;
  label: string;
  href?: string;
};

export const homeMenuData: HomeMenuItem[] = [
  { id: "continue", label: "Continue", href: "/" },
  { id: "new-game", label: "New Game", href: "/" },
  { id: "career", label: "Career", href: "/career" },
  { id: "mastery", label: "Mastery", href: "/mastery" },
  { id: "professions", label: "Professions", href: "/professions" },
  { id: "market", label: "Market", href: "/bazaar" },
  { id: "loadout", label: "Loadout", href: "/loadout" },
  { id: "arena", label: "Arena", href: "/arena" },
  { id: "guild", label: "Guild", href: "/guild" },
  { id: "settings", label: "Settings", href: "/settings" },
];