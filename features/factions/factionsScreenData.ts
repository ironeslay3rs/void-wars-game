export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type FactionsSection = {
  title: string;
  description: string;
  body?: string;
};

export type FactionsScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: FactionsSection[];
};

export const factionsScreenData: FactionsScreenData = {
  eyebrow: "Void Wars / Faction Protocol",
  title: "Faction Systems",
  subtitle:
    "Track ideological powers, world influence, and standing systems across the evolving conflict.",

  cards: [
    {
      label: "Blocs",
      value: "03",
      hint: "Primary world powers",
    },
    {
      label: "Standings",
      value: "12",
      hint: "Planned rank and rep tiers",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass faction shell",
    },
  ],

  sections: [
    {
      title: "Power Blocs",
      description:
        "Major ideological forces competing for influence across the evolving world.",
    },
    {
      title: "Faction Standing",
      description:
        "Reserved for reputation systems, unlock tiers, and future alliance choices.",
      body: "Reserved for faction reputation, rank rewards, path loyalty, and alliance consequences.",
    },
  ],
};