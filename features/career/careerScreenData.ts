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
    "Role identity and Sevenfold mastery on this page; set portrait and career focus on Character — focus drives light field and crafting modifiers.",

  cards: [
    {
      label: "Schools",
      value: "03",
      hint: "Bio, Mecha, Pure — same rails as /mastery.",
    },
    {
      label: "Sevenfold",
      value: "L7",
      hint: "Per-school depth + minors; Executional L2 at three minors in one school.",
    },
    {
      label: "Career focus",
      value: "Live",
      hint: "Combat / Gathering / Crafting — field and Crafting District bonuses.",
    },
  ],

  sections: [
    {
      title: "Character & focus",
      description: "Portrait and career focus live on the Character screen.",
      body: "Career focus drives shell drill damage, field pickup amounts, and discounted district craft costs. Faction alignment sets primary path for hybrid rune taxes.",
    },
    {
      title: "Mastery tree",
      description: "Shared with the Mastery home-menu route.",
      body: "Install minors, read capacity pools, and deepen runes here or on /mastery. Zone deploy and some recipes check deepest-school depth.",
    },
  ],
};
