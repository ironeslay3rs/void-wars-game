export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type ProfessionsSection = {
  title: string;
  description: string;
  body?: string;
  items?: string[];
};

export type ProfessionsScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: ProfessionsSection[];
};

export const professionsScreenData: ProfessionsScreenData = {
  eyebrow: "Void Wars / Professions Protocol",
  title: "Profession Systems",
  subtitle:
    "Define combat, crafting, and gathering roles across Bio, Mecha, and Pure-aligned development paths.",

  cards: [
    {
      label: "Roles",
      value: "12",
      hint: "Core profession identities",
    },
    {
      label: "Focuses",
      value: "03",
      hint: "Combat / Crafting / Gathering",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass profession shell",
    },
  ],

  sections: [
    {
      title: "Profession Classes",
      description:
        "Core profession families that will define combat, crafting, and support roles.",
      items: ["Combat", "Crafting", "Gathering"],
    },
    {
      title: "Role Development",
      description:
        "Reserved for profession depth, synergy, and specialization systems.",
      body: "Reserved for role progression, advanced branches, and profession synergy.",
    },
  ],
};