import type { UpgradeKind } from "./upgradeTypes";

export const upgradeKindLabels: Record<UpgradeKind, string> = {
  "rank-up": "Rank",
  "rune-install": "Mastery",
  "craft-recipe": "Crafting",
  "mythic-gate": "Mythic",
  "consume-ration": "Recovery",
  "vent-heat": "Pressure",
};

export const upgradeKindAccents: Record<UpgradeKind, string> = {
  "rank-up": "border-red-500/30 bg-red-500/8",
  "rune-install": "border-violet-500/30 bg-violet-500/8",
  "craft-recipe": "border-amber-400/30 bg-amber-400/8",
  "mythic-gate": "border-cyan-400/30 bg-cyan-400/8",
  "consume-ration": "border-emerald-500/30 bg-emerald-500/8",
  "vent-heat": "border-orange-400/30 bg-orange-400/8",
};

export const upgradeHubScreenData = {
  eyebrow: "Progression",
  title: "Upgrade Hub",
  subtitle:
    "Every available upgrade in one place — sorted by proximity. The closest breakthrough is always first.",
} as const;
