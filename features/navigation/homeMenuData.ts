export type HomeMenuItem = {
  id: string;
  label: string;
  href?: string;
};

export const homeMenuData: HomeMenuItem[] = [
  { id: "continue", label: "Continue", href: "/" },
  { id: "new-game", label: "New Game", href: "/new-game" },
  { id: "career", label: "Career", href: "/career" },
  { id: "mastery", label: "Mastery", href: "/mastery" },
  { id: "professions", label: "Professions", href: "/professions" },
  { id: "empires", label: "Empires", href: "/empires" },
  { id: "schools", label: "Schools", href: "/schools" },
  { id: "pantheons", label: "Pantheons", href: "/pantheons" },
  { id: "market", label: "Black Market Exchange", href: "/bazaar/war-exchange" },
  { id: "black-market", label: "Black Market", href: "/bazaar/black-market" },
  { id: "loadout", label: "Loadout", href: "/loadout" },
  { id: "arena", label: "Arena", href: "/arena" },
  { id: "battlefield", label: "War Fronts", href: "/battlefield" },
  { id: "guild", label: "Guild", href: "/guild" },
  { id: "settings", label: "Settings", href: "/settings" },
];
