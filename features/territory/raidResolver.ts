/**
 * Raid Resolver — seeded, deterministic raid tick.
 *
 * Pure module. A raid is a short economic attack: if it lands (seeded vs.
 * raidRisk), the attacker steals a share of the defender's tribute and
 * bleeds some stability. No territory flip — raids are friction, not
 * conquest. Use warResolver.ts for sieges.
 *
 * Canon: Black Market.md — "stolen technology / mixed evolution." The
 * lanes are the natural raid targets; empire seats are hardened.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type {
  RaidOutcome,
  Territory,
  TerritoryOwner,
} from "./territoryTypes";

// ─────────────────────────────────────────────────────
// Deterministic RNG — Mulberry32 (reused pattern)
// ─────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ownerLabel(o: TerritoryOwner): string {
  if (o.kind === "guild") return `Guild:${o.id}`;
  switch (o.id) {
    case "verdant-coil":
      return "Verdant Coil";
    case "chrome-synod":
      return "Chrome Synod";
    case "ember-vault":
      return "Ember Vault";
    case "black-city":
      return "Black City";
  }
}

/**
 * Resolve a single raid tick against `territory`. Pure.
 *
 * @param territory - target of the raid
 * @param attacker  - who is running the raid
 * @param raidRisk  - 0..1 probability gate (typically from economyPressure)
 * @param seed      - deterministic seed
 */
export function resolveRaidTick(
  territory: Territory,
  attacker: TerritoryOwner,
  raidRisk: number,
  seed: number,
): RaidOutcome {
  const rand = mulberry32(seed);
  const roll = rand();
  const landed = roll < clamp(raidRisk, 0, 1);

  if (!landed) {
    return {
      territoryId: territory.id,
      landed: false,
      loot: {},
      stabilityLoss: 0,
      flavor: `${ownerLabel(attacker)} probe at ${territory.name} is turned away.`,
    };
  }

  // Lower-stability targets leak more tribute per tick. Empire seats (>= 0.7)
  // leak ~15%; unstable lanes (< 0.5) can leak up to ~55%.
  const leakFactor = clamp(0.15 + (1 - territory.stability) * 0.55, 0.1, 0.7);
  // Seeded variance on top, bounded.
  const variance = 0.8 + rand() * 0.4; // 0.8..1.2

  const loot: Partial<Record<ResourceKey, number>> = {};
  for (const [rawKey, amt] of Object.entries(territory.tributeRate)) {
    const key = rawKey as ResourceKey;
    if (!amt || amt <= 0) continue;
    const stolen = Math.max(1, Math.floor(amt * leakFactor * variance));
    loot[key] = stolen;
  }

  // Stability loss scales with how much was siphoned — with a floor so a
  // landed raid always hurts.
  const stabilityLoss = clamp(0.03 + (1 - territory.stability) * 0.07, 0.03, 0.12);

  return {
    territoryId: territory.id,
    landed: true,
    loot,
    stabilityLoss: round3(stabilityLoss),
    flavor: `${ownerLabel(attacker)} raiders bleed tribute from ${territory.name}.`,
  };
}

/**
 * Apply a landed raid to the territory. Pure — returns a new Territory.
 * No-op when the raid didn't land.
 */
export function applyRaidOutcome(
  territory: Territory,
  outcome: RaidOutcome,
): Territory {
  if (!outcome.landed) return territory;
  return {
    ...territory,
    owner: { ...territory.owner },
    tributeRate: { ...territory.tributeRate },
    stability: clamp(territory.stability - outcome.stabilityLoss, 0, 1),
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}
