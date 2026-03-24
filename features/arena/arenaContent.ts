import type { ArenaMode } from "@/features/arena/arenaTypes";

export const battleModes: ArenaMode[] = [
  {
    title: "Ranked",
    subtitle: "Primary ladder combat",
    body: "High-risk competitive queue with rank pressure, rewards, and faction visibility.",
  },
  {
    title: "Practice",
    subtitle: "Low-pressure sparring",
    body: "Controlled matches for learning builds, pacing, and weapon rhythm without ladder pressure.",
  },
  {
    title: "Tournament",
    subtitle: "Scheduled event combat",
    body: "Bracket-based combat reserved for seasonal events, prestige rewards, and public standings.",
  },
];

export const rules = [
  "Condition below 40% restricts ranked participation.",
  "Arena tuning will later apply PvP-specific combat modifiers.",
  "Faction flavor remains visible, but combat balance overrides raw path advantage.",
  "Ranked rewards will scale with performance tier, not only participation.",
];

export const rewards = [
  { label: "Credits", value: "Base payout" },
  { label: "Influence", value: "Arena reputation" },
  { label: "Rank Progress", value: "Season ladder" },
  { label: "Prestige Items", value: "Future unlocks" },
];
