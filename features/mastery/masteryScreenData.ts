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
  sections: MasterySection[];
};

export const masteryScreenData: MasteryScreenData = {
  eyebrow: "Void Wars / Mastery Protocol",
  title: "School Mastery",
  subtitle:
    "M2 functional: depth + capacity + Executional tiers (L2/L3) drive gates, theme-aligned field/contract yields, hybrid tax, zone deploy rules (see Void Expedition chips), Crafting relic refines, and recipe depth checks.",

  sections: [
    {
      title: "Canon rule",
      description:
        "Specialization-first, costly commits — Bio, Mecha, and Pure only.",
      body: "Mastery investment is sticky by default. Hybrid installs are allowed but taxed so dabbling cannot replace committing to a path.",
    },
    {
      title: "M1 operations",
      description: "What you can do in-game this build.",
      body: "Install minors on Career or here (same panel). Field loot can drop boss relics; Crafting District refines them into salvage. Set career focus on Character for combat, gathering, or crafting modifiers. Later: respec windows and deeper hybrid unlocks per Book 1 pacing.",
    },
    {
      title: "Respec window (later)",
      description: "Narrow correction before hard lock — not wired in M1.",
      body: masteryFrameworkScaffold.respecWindowHook.implementationNote,
    },
    {
      title: "Hybrid unlock (later)",
      description: "Branches after primary commitment — beyond current slice.",
      body: masteryFrameworkScaffold.hybridUnlockHooks.compatibilityNote,
    },
  ],
};
