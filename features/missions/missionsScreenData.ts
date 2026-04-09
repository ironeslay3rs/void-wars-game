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
    "Queue timed contracts on your stack. When timers pay out, prep the next push — then deploy from Command when you are ready to enter the field.",

  cards: [
    {
      label: "Types",
      value: "03",
      hint: "Combat, gathering, and story beats on the contract board.",
    },
    {
      label: "Ops",
      value: "12",
      hint: "Rotating operations you can queue on the shared timer stack.",
    },
    {
      label: "Status",
      value: "Live",
      hint: "Queue, timers, and payouts are wired — treat this as your ops spine.",
    },
  ],

  sections: [
    {
      title: "Mission Categories",
      description:
        "Contracts cluster into combat pressure, gathering hauls, and story-forward pushes — pick what the lane needs.",
      items: ["Combat Contracts", "Gathering Runs", "Story Operations"],
    },
    {
      title: "Objective rhythm",
      description:
        "Each job states duration, cost to the body, and payout — read before you stack timers.",
      body: "Briefings and reward lines stay tied to the live board; if something is greyed out, doctrine or path is telling you to recover first.",
    },
  ],
};