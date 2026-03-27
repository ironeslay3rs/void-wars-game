import type { ArenaMode } from "@/features/arena/arenaTypes";

export const battleModes: ArenaMode[] = [
  {
    title: "Ranked",
    subtitle: "Season ladder — Arena of Blood",
    body: "High-stakes combat that tests doctrine, preparation, and nerve. Victories push your SR and earn school-aligned materials. Losses carry condition costs. Condition below 40% locks ranked participation.",
  },
  {
    title: "Practice",
    subtitle: "Low-pressure sparring",
    body: "Controlled combat with no ladder consequence. Use this to calibrate your build, test loadout pressure, and understand how your school performs before committing to ranked stakes.",
  },
  {
    title: "Tournament",
    subtitle: "Seasonal bracket event",
    body: "Structured bracket combat with prestige rewards and public standings. Tournaments run on a seasonal schedule — preparation and prior arena experience are required to place.",
  },
];

export const rules = [
  "Condition below 40% restricts ranked participation — recover before entering the queue.",
  "Each school fights differently: Bio hunts, Mecha controls, Pure burns. Preparation matters more than raw level.",
  "Arena victories pay out school-aligned materials. Bio earns bio samples, Mecha earns scrap alloy, Pure earns rune dust.",
  "Defeat costs condition. A bad run can send you to Status before you can re-queue.",
  "Ranked SR scales with match outcome, not participation — consistent wins build standing faster.",
];

export const rewards = [
  { label: "Credits", value: "70–150+ per match" },
  { label: "Rank XP", value: "35–65 per victory" },
  { label: "Influence", value: "2–6 per match" },
  { label: "School Materials", value: "Bio / Scrap / Rune Dust (school-linked)" },
  { label: "Season SR", value: "Ranked ladder rating" },
  { label: "Prestige track", value: "Seasonal unlocks (scheduled)" },
];
