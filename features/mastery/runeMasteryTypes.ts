import type { FactionAlignment, PathType } from "@/features/game/gameTypes";

/** Schools that accept void runes (Bio / Mecha / Pure only). */
export type RuneSchool = PathType;

export const RUNE_SCHOOLS: RuneSchool[] = ["bio", "mecha", "pure"];

export type RuneCapacityPool = "blood" | "frame" | "resonance";

export type RuneCapacityState = Record<RuneCapacityPool, number>;

export type PlayerRuneMasteryState = {
  /**
   * Sevenfold rune depth per school (L1 shallow = 1, deepens with minors installed).
   * Stored value matches 1 + minorCountBySchool[s], capped at 7.
   */
  depthBySchool: Record<RuneSchool, number>;
  /** Installed minor runes per school (cap per school in logic). */
  minorCountBySchool: Record<RuneSchool, number>;
  /** Remaining Blood / Frame / Resonance capacity for installs. */
  capacity: RuneCapacityState;
  /** Base maxima before hybrid drain. */
  capacityMax: RuneCapacityState;
  /** Cross-school installs (off primary path) permanently tighten capacity ceilings. */
  hybridDrainStacks: number;
};

export function schoolToCapacityPool(school: RuneSchool): RuneCapacityPool {
  if (school === "bio") return "blood";
  if (school === "mecha") return "frame";
  return "resonance";
}

export function getPrimaryRuneSchool(
  alignment: FactionAlignment,
): RuneSchool | null {
  if (alignment === "unbound") return null;
  return alignment;
}
