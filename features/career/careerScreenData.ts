export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type CareerSection = {
  title: string;
  description: string;
  body: string;
};

export type CareerScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: CareerSection[];
};

export const careerScreenData: CareerScreenData = {
  eyebrow: "Void Wars / Career Protocol",
  title: "Career Systems",
  subtitle:
    "Define long-term role identity, specialization direction, and class progression across Bio, Mecha, and Pure doctrines.",

  cards: [
    {
      label: "Tracks",
      value: "03",
      hint: "Bio / Mecha / Pure foundations",
    },
    {
      label: "Branches",
      value: "12",
      hint: "Future specialization routes",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass progression shell",
    },
  ],

  sections: [
    {
      title: "Career Tracks",
      description:
        "Reserved for long-term identity choices and specialization branches.",
      body: "Reserved for role doctrines, branching commitments, and future class development.",
    },
    {
      title: "Progress Outlook",
      description:
        "Forward view of how your role path could evolve over time.",
      body: "Reserved for synergy forecasting, class milestones, and role unlocks.",
    },
  ],
};