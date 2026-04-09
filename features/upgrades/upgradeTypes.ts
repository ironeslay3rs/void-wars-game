import type { PathType, ResourceKey } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";

/**
 * Upgrade readability layer — scan GameState and surface available progression
 * options sorted by proximity. Drives UpgradeNudge (Home) and UpgradeHub screen.
 *
 * No new game mechanics. Pure read layer over existing state.
 */

export type UpgradeKind =
  | "rank-up"
  | "rune-install"
  | "craft-recipe"
  | "mythic-gate"
  | "consume-ration"
  | "vent-heat";

export type UpgradeOption = {
  id: string;
  kind: UpgradeKind;
  /** Player-facing title. */
  title: string;
  /** What the player gets. */
  reward: string;
  /** e.g. "82% complete" */
  progressPct: number;
  /** What's still missing — human-readable. */
  gap: string;
  /** Route to act on this upgrade. */
  href: string;
  /** CTA label. */
  ctaLabel: string;
  /** Path color accent (null = neutral). */
  pathAccent: PathType | null;
  /** True if the upgrade can be claimed right now. */
  ready: boolean;
  /** Optional: school for rune installs. */
  school?: RuneSchool;
  /** Optional: recipe ID for crafting. */
  recipeId?: string;
  /** Material requirements for display. */
  costs?: Array<{ key: ResourceKey; need: number; have: number }>;
};

export type UpgradeReadySummary = {
  /** Total upgrades available right now. */
  readyCount: number;
  /** Closest upgrade (highest progressPct). */
  closest: UpgradeOption | null;
  /** All available upgrades sorted by proximity descending. */
  all: UpgradeOption[];
};

/** Product horizon for roadmap beats — not tied to GameState until implemented. */
export type UpgradeHorizon = "near" | "mid" | "late";

/**
 * Design pillar for prioritization and UI grouping.
 * Use when wiring new selector kinds or balancing reward cadence.
 */
export type UpgradeDesignPillar =
  | "pressure"
  | "economy"
  | "identity"
  | "field"
  | "social";

/**
 * Planned progression beat — narrative + routing hook for work not yet in `upgradeSelectors`.
 * Keep ids stable; add selector coverage when mechanics land.
 */
export type FutureUpgradeBeat = {
  id: string;
  horizon: UpgradeHorizon;
  headline: string;
  teaser: string;
  pillar: UpgradeDesignPillar;
  /** Existing screen to preview the fantasy; omit if TBD. */
  previewHref?: string;
};
