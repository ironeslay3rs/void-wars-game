/**
 * Tests — warResolver (siege tick + apply).
 *
 * Coverage:
 * - openWar produces a well-formed War and rejects self-vs-self.
 * - resolveSiegeTick is deterministic: same inputs → identical outcome.
 * - Differing seeds produce divergent outcomes over a batch.
 * - Momentum monotonicity: given a strong lead-in momentum, momentum
 *   stays positive across a sample of seeds (it cannot jump wildly
 *   negative in one tick because of the 0.6 decay coupling).
 * - applySiegeOutcome never mutates its inputs (purity).
 */

import { describe, expect, it } from "vitest";
import { getTerritoryById } from "./territoryRegistry";
import {
  applySiegeOutcome,
  openWar,
  resolveSiegeTick,
} from "./warResolver";
import type {
  SiegeOutcome,
  Territory,
  TerritoryOwner,
  War,
} from "./territoryTypes";

const ATTACKER: TerritoryOwner = { kind: "empire", id: "chrome-synod" };
const DEFENDER: TerritoryOwner = { kind: "empire", id: "verdant-coil" };

function fixtureTerritory(): Territory {
  const t = getTerritoryById("verdant-coil");
  if (!t) throw new Error("test fixture missing");
  return t;
}

function fixtureWar(overrides: Partial<War> = {}): War {
  const base = openWar("verdant-coil", ATTACKER, DEFENDER, 1);
  return { ...base, ...overrides };
}

describe("openWar", () => {
  it("creates a skirmish-phase war at tick 0", () => {
    const w = openWar("verdant-coil", ATTACKER, DEFENDER, 42);
    expect(w.territoryId).toBe("verdant-coil");
    expect(w.phase).toBe("skirmish");
    expect(w.ticks).toBe(0);
    expect(w.momentum).toBe(0);
    expect(w.attacker).toEqual(ATTACKER);
    expect(w.defender).toEqual(DEFENDER);
    expect(typeof w.id).toBe("string");
  });

  it("throws when attacker equals defender", () => {
    expect(() =>
      openWar("verdant-coil", ATTACKER, { ...ATTACKER }, 1),
    ).toThrow();
  });
});

describe("resolveSiegeTick — determinism", () => {
  it("same (territory, war, seed) → identical outcome", () => {
    const t = fixtureTerritory();
    const w = fixtureWar();
    const a = resolveSiegeTick(t, w, 123);
    const b = resolveSiegeTick(t, w, 123);
    expect(a).toEqual(b);
  });

  it("different seeds produce divergent outcomes over a batch", () => {
    const t = fixtureTerritory();
    const w = fixtureWar();
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const momentums = new Set(
      seeds.map((s) => resolveSiegeTick(t, w, s).momentum),
    );
    // Very small chance of false collisions; expect at least a couple
    // of distinct values.
    expect(momentums.size).toBeGreaterThanOrEqual(3);
  });
});

describe("resolveSiegeTick — bounds & invariants", () => {
  it("momentum stays within [-1, 1]", () => {
    const t = fixtureTerritory();
    for (const seed of [1, 7, 13, 42, 99, 256, 1024]) {
      for (const startMomentum of [-0.9, -0.3, 0, 0.3, 0.9]) {
        const w = fixtureWar({ momentum: startMomentum, ticks: seed % 5 });
        const out = resolveSiegeTick(t, w, seed);
        expect(out.momentum).toBeGreaterThanOrEqual(-1);
        expect(out.momentum).toBeLessThanOrEqual(1);
      }
    }
  });

  it("damage is non-negative and stabilityDelta is ≤ 0 during siege", () => {
    const t = fixtureTerritory();
    for (const seed of [11, 22, 33, 44, 55, 66, 77]) {
      const out = resolveSiegeTick(t, fixtureWar(), seed);
      expect(out.damage).toBeGreaterThanOrEqual(0);
      expect(out.stabilityDelta).toBeLessThanOrEqual(0);
    }
  });

  it("momentum carries: +0.9 momentum stays > 0 next tick across seeds", () => {
    const t = fixtureTerritory();
    // With momentum decay 0.6 and delta clamped, a 0.9 lead cannot fall
    // below zero in a single tick — verify over many seeds.
    for (const seed of [3, 19, 71, 204, 808, 1337]) {
      const w = fixtureWar({ momentum: 0.9, ticks: 4 });
      const out = resolveSiegeTick(t, w, seed);
      expect(out.momentum).toBeGreaterThan(0);
    }
  });
});

describe("applySiegeOutcome — purity", () => {
  it("does not mutate input territory or war", () => {
    const t = fixtureTerritory();
    const w = fixtureWar();
    const tSnap = JSON.parse(JSON.stringify(t));
    const wSnap = JSON.parse(JSON.stringify(w));

    const outcome = resolveSiegeTick(t, w, 777);
    const { territory: nextT, war: nextW } = applySiegeOutcome(t, w, outcome);

    expect(t).toEqual(tSnap);
    expect(w).toEqual(wSnap);
    // Returned objects are new references.
    expect(nextT).not.toBe(t);
    expect(nextW).not.toBe(w);
    expect(nextT.tributeRate).not.toBe(t.tributeRate);
    expect(nextT.owner).not.toBe(t.owner);
  });

  it("advances ticks and clamps stability to [0,1]", () => {
    const t: Territory = { ...fixtureTerritory(), stability: 0.02 };
    const w = fixtureWar();
    // Synthetic outcome — large negative delta.
    const outcome: SiegeOutcome = {
      winner: ATTACKER,
      damage: 1,
      stabilityDelta: -0.5,
      tributeSwing: 0,
      momentum: 0.3,
      resolved: false,
      newOwner: null,
      flavor: "test",
    };
    const { territory: nextT, war: nextW } = applySiegeOutcome(t, w, outcome);
    expect(nextT.stability).toBe(0);
    expect(nextW.ticks).toBe(w.ticks + 1);
  });

  it("sets phase to 'resolved' and applies newOwner on flip", () => {
    const t = fixtureTerritory();
    const w = fixtureWar({ phase: "assault", ticks: 7 });
    const outcome: SiegeOutcome = {
      winner: ATTACKER,
      damage: 0,
      stabilityDelta: -0.01,
      tributeSwing: 0.3,
      momentum: 0.5,
      resolved: true,
      newOwner: ATTACKER,
      flavor: "flip",
    };
    const { territory: nextT, war: nextW } = applySiegeOutcome(t, w, outcome);
    expect(nextW.phase).toBe("resolved");
    expect(nextT.owner).toEqual(ATTACKER);
    // Input unchanged.
    expect(t.owner).toEqual(DEFENDER);
  });
});
