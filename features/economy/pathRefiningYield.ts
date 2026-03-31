import type { FactionAlignment, ResourcesState } from "@/features/game/gameTypes";

/**
 * Phase 4 — path-shaped refining: aligned operatives recover a sliver of their school’s
 * staple material on successful refinery batches (M1 slice).
 */
export function getRefiningPathBonus(
  alignment: FactionAlignment,
): Partial<ResourcesState> {
  if (alignment === "unbound") {
    return {};
  }
  if (alignment === "bio") {
    return { bioSamples: 1 };
  }
  if (alignment === "mecha") {
    return { scrapAlloy: 1 };
  }
  return { runeDust: 1 };
}
