import type { ArenaMode } from "@/features/arena/arenaTypes";

export const battleModes: ArenaMode[] = [
  {
    id: "ranked",
    title: "Ranked",
    subtitle: "Season ladder — Arena of Blood",
    body: "High-stakes combat that tests doctrine, preparation, and nerve. Victories push your SR and earn school-aligned materials. Losses carry condition costs. Condition below 40% locks ranked participation.",
  },
  {
    id: "practice",
    title: "Practice",
    subtitle: "Low-pressure sparring",
    body: "Controlled combat with no ladder SR and no condition loss. Payouts are reduced (~35%). Use this to calibrate loadout pressure before committing to ranked stakes.",
  },
  {
    id: "tournament",
    title: "Tournament",
    subtitle: "Seasonal bracket event",
    body: "M1: uses ranked stakes (SR + condition + full payouts) while bracket scheduling is still a shell. Condition gate matches ranked.",
  },
];

export const rules = [
  "Ranked & tournament require 40%+ condition to queue. Practice waives the gate — no SR or condition swing, reduced payouts. Opponent archetype shifts SR swing (+12–+18 win / −14–−10 loss) and payout multiplier.",
  "Every 3rd enemy counter is telegraphed in-match (+22% raw damage before your armor mitigates).",
  "Loadout weapon and armor change arena math: strike scaling from your equipped weapon, mitigation from armor (see match screen snapshot).",
  "Each school fights differently: Bio hunts, Mecha controls, Pure burns. Doctrine still matters on top of gear.",
  "Arena victories pay school-aligned materials on ranked/tournament lanes; practice pays the same mix at ~35%.",
  "Ranked defeat costs condition (−10) and SR; victory costs light strain (−6) but raises SR.",
  "Selecting a mode on the arena hub passes through to the match — stakes are labeled in-match.",
];

export const rewards = [
  { label: "Credits", value: "70–150+ per match" },
  { label: "Rank XP", value: "35–65 per victory" },
  { label: "Influence", value: "2–6 per match" },
  { label: "School Materials", value: "Bio / Scrap / Rune Dust (school-linked)" },
  { label: "Season SR", value: "Ranked ladder rating" },
  { label: "Prestige track", value: "Seasonal unlocks (scheduled)" },
];
