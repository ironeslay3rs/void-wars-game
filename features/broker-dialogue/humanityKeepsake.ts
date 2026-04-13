/**
 * Humanity Keepsakes — canon-grounded passive reward.
 *
 * Canon source: `lore-canon/01 Master Canon/Themes/Humanity Theme.md`
 *   "People become stronger not only through personal effort,
 *    but through the sacrifices made for them by others."
 *
 * When a broker's rapport reaches the Keepsake threshold (80), that
 * broker silently grants the player a Keepsake — a small permanent
 * +1% reward multiplier that persists across runs. The bonus stacks
 * additively across all brokers who have granted one.
 *
 * Design:
 * - Keepsakes are one-shot per broker — granting is idempotent.
 * - They're not revokable: even if rapport later decays, the Keepsake
 *   stays. The canon framing is that someone believed in you at one
 *   moment — that gift cannot be un-given.
 * - The bonus is small (+1% per keepsake, max 10%). It's a theme
 *   payoff, not a power fantasy.
 * - Player can hold at most 10 Keepsakes across 10 active brokers
 *   (Warden, Nails, Root never grant — they don't participate in the
 *   rapport system).
 *
 * Stored separately from `brokerDialogueUnlocks` because unlocks are
 * per-broker interaction gates; Keepsakes are player-wide passive
 * reward modifiers with different semantics.
 */

export const KEEPSAKE_RAPPORT_THRESHOLD = 80;
export const KEEPSAKE_REWARD_BONUS_PCT_PER = 1;
export const KEEPSAKE_MAX_COUNT = 10;

export type HumanityKeepsakeInput = {
  rapport: Record<string, number>;
  keepsakes: Record<string, boolean>;
};

export type HumanityKeepsakeResult = {
  keepsakes: Record<string, boolean>;
  newlyGranted: string[];
  changed: boolean;
};

/**
 * Scans the rapport map and grants a Keepsake for every broker at or
 * above the threshold that doesn't already hold one. Pure; caller
 * decides when to persist.
 */
export function detectHumanityKeepsakes(
  input: HumanityKeepsakeInput,
): HumanityKeepsakeResult {
  const { rapport, keepsakes } = input;
  const existingCount = Object.values(keepsakes).filter(Boolean).length;
  if (existingCount >= KEEPSAKE_MAX_COUNT) {
    return { keepsakes, newlyGranted: [], changed: false };
  }

  const nextKeepsakes = { ...keepsakes };
  const newlyGranted: string[] = [];
  let currentCount = existingCount;

  for (const [brokerId, value] of Object.entries(rapport)) {
    if (value < KEEPSAKE_RAPPORT_THRESHOLD) continue;
    if (nextKeepsakes[brokerId]) continue;
    if (currentCount >= KEEPSAKE_MAX_COUNT) break;
    nextKeepsakes[brokerId] = true;
    newlyGranted.push(brokerId);
    currentCount += 1;
  }

  return {
    keepsakes: nextKeepsakes,
    newlyGranted,
    changed: newlyGranted.length > 0,
  };
}

/**
 * Total reward multiplier contributed by currently-held Keepsakes.
 * Additive: 3 keepsakes = +3% = multiplier 1.03.
 */
export function getKeepsakeRewardMultiplier(
  keepsakes: Record<string, boolean>,
): number {
  const count = Math.min(
    KEEPSAKE_MAX_COUNT,
    Object.values(keepsakes).filter(Boolean).length,
  );
  return 1 + (count * KEEPSAKE_REWARD_BONUS_PCT_PER) / 100;
}

/** Count of held Keepsakes (capped to max). */
export function countKeepsakes(keepsakes: Record<string, boolean>): number {
  return Math.min(
    KEEPSAKE_MAX_COUNT,
    Object.values(keepsakes).filter(Boolean).length,
  );
}
