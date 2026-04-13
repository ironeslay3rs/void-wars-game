/**
 * Economy Pressure — pure selector.
 *
 * Given the current Territory[] + active War[] + PlayerState, produce an
 * EconomyPressure { incomeMult, priceMult, raidRisk } capturing wartime
 * squeeze. No randomness here — pure arithmetic on the world snapshot.
 *
 * Canon: The Three Empires.md — war is perpetual background friction.
 * Black City / Black Market lanes react most to instability (neutral).
 */

import type { PlayerState } from "@/features/game/gameTypes";
import type { EconomyPressure, Territory, War } from "./territoryTypes";

const MIN_INCOME_MULT = 0.55;
const MAX_PRICE_MULT = 1.85;
const MAX_RAID_RISK = 0.85;

/**
 * Compute global economy pressure. Pure.
 *
 * - incomeMult: degrades as average stability falls + as more wars run.
 * - priceMult: inflates with war count and neutral-lane instability.
 * - raidRisk: scales directly off instability + active-war count.
 *
 * PlayerState is currently only used for faction-alignment nudges (stub —
 * callers can expand safely). It is kept on the signature so frontends
 * can pass it without a refactor.
 */
export function selectEconomyPressure(
  territories: readonly Territory[],
  wars: readonly War[],
  _player: PlayerState,
): EconomyPressure {
  const activeWars = wars.filter((w) => w.phase !== "resolved").length;

  const avgStability =
    territories.length === 0
      ? 1
      : territories.reduce((sum, t) => sum + t.stability, 0) /
        territories.length;

  // Neutral (Black City + lanes) react harder to instability — they are the
  // trade spine and take the price shock first.
  const neutralStability = weightedStability(territories, "neutral");

  // Income sags as stability drops and wars multiply.
  const stabilityIncomeFactor = 0.6 + avgStability * 0.4; // 0.6..1.0
  const warIncomePenalty = Math.min(0.35, activeWars * 0.08);
  const incomeMult = clamp(
    stabilityIncomeFactor - warIncomePenalty,
    MIN_INCOME_MULT,
    1.15,
  );

  // Prices rise with war count and neutral instability.
  const warPriceBump = Math.min(0.55, activeWars * 0.1);
  const neutralShock = (1 - neutralStability) * 0.35;
  const priceMult = clamp(1 + warPriceBump + neutralShock, 0.9, MAX_PRICE_MULT);

  // Raid risk: every 0.1 below avgStability adds 8%; each war adds 5%.
  const raidBase = Math.max(0, 0.65 - avgStability) * 0.8;
  const raidRisk = clamp(
    raidBase + activeWars * 0.05,
    0,
    MAX_RAID_RISK,
  );

  return {
    incomeMult: round3(incomeMult),
    priceMult: round3(priceMult),
    raidRisk: round3(raidRisk),
    activeWars,
    avgStability: round3(avgStability),
  };
}

/**
 * Per-territory pressure — useful for UI tooltips. Pure.
 */
export function selectTerritoryPressure(
  territory: Territory,
  wars: readonly War[],
): { underSiege: boolean; activeWars: number; raidRisk: number } {
  const relevant = wars.filter(
    (w) => w.territoryId === territory.id && w.phase !== "resolved",
  );
  const underSiege = relevant.some(
    (w) => w.phase === "siege" || w.phase === "assault",
  );
  const raidRisk = clamp(
    (1 - territory.stability) * 0.7 + relevant.length * 0.1,
    0,
    MAX_RAID_RISK,
  );
  return { underSiege, activeWars: relevant.length, raidRisk: round3(raidRisk) };
}

function weightedStability(
  territories: readonly Territory[],
  theme: Territory["schoolTheme"],
): number {
  const filtered = territories.filter((t) => t.schoolTheme === theme);
  if (filtered.length === 0) return 1;
  return (
    filtered.reduce((s, t) => s + t.stability, 0) / filtered.length
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}
