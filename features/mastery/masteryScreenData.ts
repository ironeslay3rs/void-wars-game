import { masteryFrameworkScaffold } from "@/features/mastery/masteryFramework";

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
  title: "School Mastery",
  subtitle:
    "Framework for Bio, Mecha, and Pure progression: sticky by default, limited respec only before lock, and future-safe hybrid hooks later.",

  cards: [
    {
      label: "Schools",
      value: String(masteryFrameworkScaffold.schoolTracks.length),
      hint: "Bio, Mecha, and Pure are the only active mastery rails.",
    },
    {
      label: "Permanence",
      value: "Sticky",
      hint: "School investment is treated as permanent by default.",
    },
    {
      label: "Hybrid Hooks",
      value: "Reserved",
      hint: "Future hybrid unlocks must sit after primary specialization.",
    },
  ],

  sections: [
    {
      title: "Canon Rule",
      description:
        "Mastery commitment should feel costly and specialization-first inside the current Book 1 direction.",
      body: "Bio, Mecha, and Pure are the only school rails. School mastery is sticky by default, with permanence treated as the baseline rule rather than casual swapping.",
    },
    {
      title: "M1 Shape",
      description:
        "The current safe implementation is framework scaffolding, not a full node tree or class system.",
      body: "Use threshold ids, state hooks, and read-only guidance now. Do not build deep tree logic, class effects, or reset systems until later gameplay work begins.",
    },
    {
      title: "Respec Window Hook",
      description:
        "Future respec should exist only as a narrow correction window before hard commitment.",
      body: masteryFrameworkScaffold.respecWindowHook.implementationNote,
    },
    {
      title: "Hybrid Unlock Hook",
      description:
        "Future hybrids should branch from an already committed school identity instead of replacing specialization-first progression.",
      body: masteryFrameworkScaffold.hybridUnlockHooks.compatibilityNote,
    },
  ],
};
