export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type MasterySection = {
  title: string;
  description: string;
  body: string;
};

export type MasteryScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: MasterySection[];
};

export const masteryScreenData: MasteryScreenData = {
  eyebrow: "Void Wars / Mastery Protocol",
  title: "Mastery Systems",
  subtitle:
    "Track long-term growth, threshold unlocks, and path refinement across your evolution route.",

  cards: [
    {
      label: "Trees",
      value: "03",
      hint: "Primary mastery structures",
    },
    {
      label: "Milestones",
      value: "12",
      hint: "Major progression checkpoints",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass mastery shell",
    },
  ],

  sections: [
    {
      title: "Mastery Tree",
      description:
        "Future visual structure for growth branches, thresholds, and unlock paths.",
      body: "Reserved for node trees, tier gates, and path refinement systems.",
    },
    {
      title: "Milestone Console",
      description:
        "Major progression checkpoints and reward state overview.",
      body: "Reserved for milestone rewards, rank thresholds, and mastery state tracking.",
    },
  ],
};