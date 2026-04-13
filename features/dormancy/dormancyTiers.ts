/**
 * Dormancy Tiers — offline lifecycle thresholds.
 *
 * Canon anchors:
 *   - lore-canon/CLAUDE.md → "Offline Lifecycle" section names the four
 *     canonical states in order: Stable → Strained → Dormant → Displaced.
 *     The CLAUDE.md note explicitly flags "Punishment tuning still open";
 *     this module closes that loop with default thresholds.
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — the Void taxes
 *     anyone who stops actively adapting. Absence is erosion.
 *
 * Default tuning (hours since last seen):
 *   - Stable     0   –  24h   (one real-world day of grace)
 *   - Strained  24   –  72h   (up to three days: first bite)
 *   - Dormant   72   – 168h   (up to one week: meaningful decay)
 *   - Displaced 168+ hours    (past a week: costly reintegration)
 *
 * Pure, deterministic, no I/O. Reducers + UI read these.
 */

export type DormancyTier = "stable" | "strained" | "dormant" | "displaced";

/** Canonical display label, matching lore-canon/CLAUDE.md wording. */
export const DORMANCY_LABEL: Record<DormancyTier, string> = {
  stable: "Stable",
  strained: "Strained",
  dormant: "Dormant",
  displaced: "Displaced",
};

/**
 * Severity is an ordinal rank (0 = benign, 3 = worst). UI badges and
 * sort-order use this — don't treat the number as a multiplier.
 */
export const DORMANCY_SEVERITY: Record<DormancyTier, 0 | 1 | 2 | 3> = {
  stable: 0,
  strained: 1,
  dormant: 2,
  displaced: 3,
};

/**
 * Upper bound (exclusive) of each tier in hours. `displaced` is open-ended
 * (Infinity). Keep ascending — `classifyDormancy` walks in order.
 */
export const DORMANCY_TIER_HOURS: Record<DormancyTier, number> = {
  stable: 24,
  strained: 72,
  dormant: 168,
  displaced: Infinity,
};

/** Tier order for iteration (never rely on Object.keys ordering). */
export const DORMANCY_TIER_ORDER: readonly DormancyTier[] = [
  "stable",
  "strained",
  "dormant",
  "displaced",
] as const;

/**
 * Classify elapsed offline hours into a canonical tier.
 * Negative / NaN / non-finite input clamps to `stable` (zero hours).
 */
export function classifyDormancy(elapsedHours: number): DormancyTier {
  const h = Number.isFinite(elapsedHours) && elapsedHours > 0 ? elapsedHours : 0;
  if (h < DORMANCY_TIER_HOURS.stable) return "stable";
  if (h < DORMANCY_TIER_HOURS.strained) return "strained";
  if (h < DORMANCY_TIER_HOURS.dormant) return "dormant";
  return "displaced";
}

/**
 * Convenience: hours into the current tier (0 at tier entry). Useful for
 * UI bars — "12 / 48 hours into Strained". For `displaced`, returns the
 * total hours past the 168h gate (unbounded).
 */
export function hoursIntoTier(elapsedHours: number): number {
  const h = Number.isFinite(elapsedHours) && elapsedHours > 0 ? elapsedHours : 0;
  const tier = classifyDormancy(h);
  switch (tier) {
    case "stable":
      return h;
    case "strained":
      return h - DORMANCY_TIER_HOURS.stable;
    case "dormant":
      return h - DORMANCY_TIER_HOURS.strained;
    case "displaced":
      return h - DORMANCY_TIER_HOURS.dormant;
  }
}
