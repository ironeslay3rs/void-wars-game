import type { PlayerState } from "@/features/game/gameTypes";

/** Wall-clock stall / workshop rent (Phase 4). */
export const STALL_RENT_INTERVAL_MS = 2 * 60 * 60 * 1000;

export const STALL_RENT_CREDITS = 18;

/** +5% War Exchange buy price per missed rent period (cap +30%). */
export const STALL_ARREARS_BUY_MARKUP_PER = 0.05;
export const STALL_ARREARS_BUY_MARKUP_MAX = 0.3;

export function getStallBrokerBuyMarkupMultiplier(arrears: number): number {
  const n = Math.max(0, Math.floor(arrears));
  return 1 + Math.min(STALL_ARREARS_BUY_MARKUP_MAX, n * STALL_ARREARS_BUY_MARKUP_PER);
}

export function getStallArrearsPayoffTotal(arrears: number): number {
  const n = Math.max(0, Math.floor(arrears));
  return n * STALL_RENT_CREDITS;
}

/**
 * Apply any rent periods that fell due before `now`. Advances `lastStallRentResolvedAt`
 * along the timeline; missed payments increment `stallArrearsCount`.
 */
export function processStallRentCharges(
  player: PlayerState,
  now: number,
): PlayerState {
  let last = player.lastStallRentResolvedAt;
  if (typeof last !== "number" || !Number.isFinite(last)) {
    last = now;
  }

  let arrears = player.stallArrearsCount ?? 0;
  let credits = player.resources.credits;
  let chargedAny = false;

  while (now - last >= STALL_RENT_INTERVAL_MS) {
    last += STALL_RENT_INTERVAL_MS;
    chargedAny = true;
    if (credits >= STALL_RENT_CREDITS) {
      credits -= STALL_RENT_CREDITS;
    } else {
      arrears = Math.min(99, arrears + 1);
    }
  }

  if (!chargedAny) {
    return player;
  }

  return {
    ...player,
    resources: {
      ...player.resources,
      credits: Math.max(0, credits),
    },
    lastStallRentResolvedAt: last,
    stallArrearsCount: arrears,
  };
}
