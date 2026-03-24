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
    "Track long-term growth, Void-tier thresholds, and body / mind / soul refinement across your evolution route.",

  cards: [
    {
      label: "Trees",
      value: "03",
      hint: "Body / Mind / Soul",
    },
    {
      label: "Milestones",
      value: "07",
      hint: "Doctrine thresholds planned",
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
      body: "Reserved for body, mind, and soul node trees, Void-tier gates, and fusion refinement systems.",
    },
    {
      title: "Milestone Console",
      description:
        "Major progression checkpoints and reward state overview.",
      body: "Reserved for doctrine rewards, rank thresholds, and Legendary/Epic mastery state tracking.",
    },
  ],
};