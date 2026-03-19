export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type MissionsSection = {
  title: string;
  description: string;
  body?: string;
  items?: string[];
};

export type MissionsScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: MissionsSection[];
};

export const missionsScreenData: MissionsScreenData = {
  eyebrow: "Void Wars / Mission Protocol",
  title: "Mission Systems",
  subtitle:
    "Track contracts, objectives, and operation flow across combat, gathering, and advancement loops.",

  cards: [
    {
      label: "Types",
      value: "03",
      hint: "Combat / Gathering / Story",
    },
    {
      label: "Ops",
      value: "12",
      hint: "Planned mission categories",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass mission shell",
    },
  ],

  sections: [
    {
      title: "Mission Categories",
      description:
        "Core mission families that define how players progress through the world.",
      items: ["Combat Contracts", "Gathering Runs", "Story Operations"],
    },
    {
      title: "Objective Console",
      description:
        "Reserved for mission flow, reward logic, and objective state tracking.",
      body: "Reserved for briefing panels, reward breakdowns, timer logic, and objective progression.",
    },
  ],
};