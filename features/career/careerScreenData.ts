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

export type SchoolDoctrineLine = {
  number: number;
  flame: string;
  meaning: string;
};

export type SchoolDoctrine = {
  school: "bio" | "mecha" | "pure";
  schoolLabel: string;
  tagline: string;
  name: string;
  lines: SchoolDoctrineLine[];
};

export type CareerScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: CareerSection[];
  doctrines?: SchoolDoctrine[];
};

export const careerScreenData: CareerScreenData = {
  eyebrow: "Void Wars / Career Protocol",
  title: "Career Systems",
  subtitle:
    "Role identity and Sevenfold mastery on this page. Career focus drives field and crafting modifiers — set it on the Character screen.",

  cards: [
    {
      label: "Schools",
      value: "03",
      hint: "Bio (Verdant Coil), Mecha (Chrome Synod), Pure (Ember Vault) — same rails as /mastery.",
    },
    {
      label: "Sevenfold",
      value: "L7",
      hint: "Per-school depth + minors. Executional L2 unlocked at three minors in one school.",
    },
    {
      label: "Career Focus",
      value: "Live",
      hint: "Combat / Gathering / Crafting — drives field pickup amounts, shell damage, and Crafting District discounts.",
    },
  ],

  sections: [
    {
      title: "Character & Focus",
      description: "Portrait and career focus live on the Character screen.",
      body: "Career focus drives shell drill damage, field pickup amounts, and discounted district craft costs. Faction alignment sets the primary path for hybrid rune taxes and zone access conditions.",
    },
    {
      title: "Mastery Tree",
      description: "Shared with the Mastery home-menu route.",
      body: "Install minors, read capacity pools, and deepen runes here or on /mastery. Zone deployment and some advanced recipes check your deepest-school depth before granting access.",
    },
    {
      title: "The Three Paths",
      description: "Each school embodies one pillar of the divine trinity.",
      body: "The real path to escaping the Void is not any single school — it is the fusion of Body (Bio), Mind (Mecha), and Soul (Pure). This forbidden truth is the engine of all progression. No school holds the full answer; each holds one third of the key.",
    },
  ],

  doctrines: [
    {
      school: "pure",
      schoolLabel: "Pure — The Ember Vault",
      tagline: "Fire remembers.",
      name: "The Seven Flames",
      lines: [
        { number: 1, flame: "Kill Your Idols", meaning: "Worship blinds the self." },
        { number: 2, flame: "Ash Marks the Survivor", meaning: "Every wound is a lesson." },
        { number: 3, flame: "Memory is a Blade", meaning: "What is remembered can be wielded." },
        { number: 4, flame: "The Ember Outlasts the Storm", meaning: "Soul survives flesh." },
        { number: 5, flame: "The Ember Smothers in Silk", meaning: "Comfort kills. The Velvet Trial." },
        { number: 6, flame: "The Phoenix Burns Twice", meaning: "Rebirth is will, not mercy." },
        { number: 7, flame: "The Void Must Be Fed", meaning: "Mastery demands sacrifice." },
      ],
    },
    {
      school: "bio",
      schoolLabel: "Bio — The Verdant Coil",
      tagline: "We are what survives.",
      name: "The Seven Truths of Mutation",
      lines: [
        { number: 1, flame: "The Hunt is the Teacher", meaning: "The field teaches what training cannot." },
        { number: 2, flame: "Consume to Ascend", meaning: "DNA absorbed is power earned." },
        { number: 3, flame: "Weakness is a Signal", meaning: "What breaks you shows you what to become." },
        { number: 4, flame: "The Body Remembers", meaning: "Muscle memory outlasts conscious thought." },
        { number: 5, flame: "Wrath is Evolution's Fuel", meaning: "Controlled rage accelerates adaptation." },
        { number: 6, flame: "The Predator Has No Peace", meaning: "Rest is a wound waiting to happen." },
        { number: 7, flame: "Become the Apex", meaning: "There is no ceiling — only the next kill." },
      ],
    },
    {
      school: "mecha",
      schoolLabel: "Mecha — The Chrome Synod",
      tagline: "Perfection is property — and we own it.",
      name: "The Seven Truths of Perfection",
      lines: [
        { number: 1, flame: "Imprecision is Decay", meaning: "Every flaw is a fracture in the system." },
        { number: 2, flame: "Hierarchy Preserves Order", meaning: "Without rank, evolution collapses into noise." },
        { number: 3, flame: "Ironheart is the Language of Power", meaning: "Those who control the metal control the world." },
        { number: 4, flame: "Stillness is Strength", meaning: "The machine that waits outlasts the one that rushes." },
        { number: 5, flame: "Pride is Discipline, Not Arrogance", meaning: "Radiance must be earned, then maintained." },
        { number: 6, flame: "The Mind Transcends the Flesh", meaning: "What the body cannot hold, the machine will carry." },
        { number: 7, flame: "Perfection is Risk Calculated", meaning: "Even failure must make you stronger." },
      ],
    },
  ],
};
