/**
 * Tests — raidResolver.
 *
 * Coverage:
 * - resolveRaidTick is deterministic (same inputs → same outcome).
 * - Miss case: loot is empty, stabilityLoss is 0, landed false.
 * - Attacker-strong raid on defender-weak (low stability) landed target
 *   yields meaningful resource swing toward attacker (loot > 0 for
 *   every tribute entry).
 * - applyRaidOutcome is pure: no input mutation; no-op for miss.
 * - landed raid reduces stability and clamps at 0.
 */

import { describe, expect, it } from "vitest";
import { getTerritoryById, makeTerritoryRegistry } from "./territoryRegistry";
import { applyRaidOutcome, resolveRaidTick } from "./raidResolver";
import type { Territory, TerritoryOwner } from "./territoryTypes";

const ATTACKER: TerritoryOwner = { kind: "empire", id: "chrome-synod" };

function weakTerritory(): Territory {
  const t = getTerritoryById("arena-of-blood");
  if (!t) throw new Error("fixture missing");
  // Force low stability — simulates a defender-weak lane.
  return { ...t, stability: 0.1 };
}

describe("resolveRaidTick — determinism", () => {
  it("same inputs produce identical outcomes", () => {
    const t = weakTerritory();
    const a = resolveRaidTick(t, ATTACKER, 0.9, 42);
    const b = resolveRaidTick(t, ATTACKER, 0.9, 42);
    expect(a).toEqual(b);
  });

  it("different seeds can produce different landed/loot outcomes", () => {
    const t = weakTerritory();
    const seeds = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14];
    const sigs = new Set(
      seeds.map((s) => {
        const o = resolveRaidTick(t, ATTACKER, 0.5, s);
        return `${o.landed}:${JSON.stringify(o.loot)}`;
      }),
    );
    expect(sigs.size).toBeGreaterThanOrEqual(2);
  });
});

describe("resolveRaidTick — miss vs. landed", () => {
  it("raidRisk = 0 always misses: empty loot, zero stabilityLoss", () => {
    const t = weakTerritory();
    for (const seed of [1, 7, 42, 999]) {
      const out = resolveRaidTick(t, ATTACKER, 0, seed);
      expect(out.landed).toBe(false);
      expect(out.stabilityLoss).toBe(0);
      expect(out.loot).toEqual({});
      expect(out.territoryId).toBe(t.id);
    }
  });

  it("raidRisk = 1 always lands and swings resources toward attacker", () => {
    const t = weakTerritory();
    for (const seed of [1, 7, 42, 101, 999]) {
      const out = resolveRaidTick(t, ATTACKER, 1, seed);
      expect(out.landed).toBe(true);
      expect(out.stabilityLoss).toBeGreaterThan(0);
      // Every tribute entry should have produced ≥1 loot.
      for (const [key, amt] of Object.entries(t.tributeRate)) {
        if (!amt || amt <= 0) continue;
        const got = (out.loot as Record<string, number | undefined>)[key];
        expect(got, `expected loot for ${key} on seed ${seed}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("weak (low-stability) targets leak more per tick than empire seats", () => {
    const seat = getTerritoryById("chrome-synod")!; // stability 0.78
    const lane = weakTerritory(); // stability 0.10
    const seed = 5;
    const seatOut = resolveRaidTick(seat, ATTACKER, 1, seed);
    const laneOut = resolveRaidTick(lane, ATTACKER, 1, seed);
    const seatCredits = (seatOut.loot as Record<string, number>).credits ?? 0;
    const laneCredits = (laneOut.loot as Record<string, number>).credits ?? 0;
    // Lane is weaker → leakFactor higher → more credits siphoned per unit
    // tribute. Compare fractions of their respective tribute credits.
    const seatFrac = seatCredits / (seat.tributeRate.credits ?? 1);
    const laneFrac = laneCredits / (lane.tributeRate.credits ?? 1);
    expect(laneFrac).toBeGreaterThan(seatFrac);
  });
});

describe("applyRaidOutcome — purity", () => {
  it("no-op for a missed raid", () => {
    const t = weakTerritory();
    const out = resolveRaidTick(t, ATTACKER, 0, 1);
    const next = applyRaidOutcome(t, out);
    expect(next).toBe(t); // exact reference return for miss
  });

  it("returns a new object for a landed raid — input unchanged", () => {
    const t = weakTerritory();
    const snap = JSON.parse(JSON.stringify(t));
    const out = resolveRaidTick(t, ATTACKER, 1, 7);
    const next = applyRaidOutcome(t, out);
    expect(next).not.toBe(t);
    expect(next.tributeRate).not.toBe(t.tributeRate);
    expect(next.owner).not.toBe(t.owner);
    expect(t).toEqual(snap);
    expect(next.stability).toBeCloseTo(
      Math.max(0, t.stability - out.stabilityLoss),
      5,
    );
  });

  it("stability clamps to 0", () => {
    const t: Territory = { ...weakTerritory(), stability: 0.01 };
    const out = resolveRaidTick(t, ATTACKER, 1, 3);
    const next = applyRaidOutcome(t, out);
    expect(next.stability).toBeGreaterThanOrEqual(0);
    expect(next.stability).toBeLessThanOrEqual(1);
  });
});

describe("raid scope — touches every canon territory", () => {
  it("resolves without throwing across the full registry", () => {
    for (const t of makeTerritoryRegistry()) {
      const out = resolveRaidTick(t, ATTACKER, 0.75, 1234 + t.id.length);
      expect(out.territoryId).toBe(t.id);
      const next = applyRaidOutcome(t, out);
      expect(next.stability).toBeGreaterThanOrEqual(0);
      expect(next.stability).toBeLessThanOrEqual(1);
    }
  });
});
