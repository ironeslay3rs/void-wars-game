import { describe, expect, it } from "vitest";

import { getDefaultProfile } from "@/features/arena/behaviorProfile";
import {
  buildLoadout,
  resolveCombat,
  type CombatSide,
} from "@/features/arena/combatResolver";

function makeSide(
  school: "bio" | "mecha" | "pure",
  rating = 1000,
  label: string = school,
): CombatSide {
  return {
    profile: getDefaultProfile(school),
    loadout: buildLoadout(label, school, rating),
  };
}

describe("buildLoadout", () => {
  it("produces the expected shape with sensible defaults", () => {
    const lo = buildLoadout("Test", "bio", 1500);
    expect(lo.label).toBe("Test");
    expect(lo.school).toBe("bio");
    expect(lo.rating).toBe(1500);
    expect(lo.maxHp).toBe(380);
    expect(lo.minDamage).toBe(22);
    expect(lo.maxDamage).toBe(36);
    expect(lo.critChance).toBeCloseTo(0.09, 5);
    expect(lo.critMultiplier).toBeCloseTo(1.35, 5);
  });

  it("accepts overrides for every numeric field", () => {
    const lo = buildLoadout("Alt", "pure", 1800, {
      maxHp: 500,
      minDamage: 10,
      maxDamage: 99,
      critChance: 0.25,
      critMultiplier: 2,
    });
    expect(lo.maxHp).toBe(500);
    expect(lo.minDamage).toBe(10);
    expect(lo.maxDamage).toBe(99);
    expect(lo.critChance).toBe(0.25);
    expect(lo.critMultiplier).toBe(2);
  });

  it("never labels a Pure loadout with Spirit", () => {
    const lo = buildLoadout("Ember", "pure", 1000);
    expect(lo.school).toBe("pure");
    expect(lo.school).not.toBe("spirit" as never);
  });
});

describe("resolveCombat — determinism", () => {
  it("returns the same CombatResult for the same seed", () => {
    const a = makeSide("bio", 1200, "A");
    const b = makeSide("mecha", 1200, "B");
    const r1 = resolveCombat(a, b, 12345);
    const r2 = resolveCombat(a, b, 12345);
    expect(r1).toEqual(r2);
  });

  it("produces matching round-by-round traces for the same seed", () => {
    const a = makeSide("pure", 1400);
    const b = makeSide("bio", 1400);
    const r1 = resolveCombat(a, b, 77);
    const r2 = resolveCombat(a, b, 77);
    expect(r1.rounds.length).toBe(r2.rounds.length);
    for (let i = 0; i < r1.rounds.length; i += 1) {
      expect(r1.rounds[i]).toEqual(r2.rounds[i]);
    }
  });

  it("different seeds diverge in result (statistically)", () => {
    const a = makeSide("bio", 1000);
    const b = makeSide("mecha", 1000);
    const signatures = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const r = resolveCombat(a, b, seed);
      signatures.add(`${r.winnerIdx}:${r.turns}:${r.damageDealt.join(",")}`);
    }
    expect(signatures.size).toBeGreaterThan(1);
  });
});

describe("resolveCombat — invariants", () => {
  it("always selects a winner (0 or 1)", () => {
    const a = makeSide("bio");
    const b = makeSide("pure");
    for (const seed of [1, 99, 500, 1234, 9999]) {
      const r = resolveCombat(a, b, seed);
      expect([0, 1]).toContain(r.winnerIdx);
    }
  });

  it("echoes the seed into the result", () => {
    const a = makeSide("bio");
    const b = makeSide("mecha");
    const r = resolveCombat(a, b, 4242);
    expect(r.seed).toBe(4242);
  });

  it("damageDealt is non-negative and at least one side does damage", () => {
    const a = makeSide("bio");
    const b = makeSide("mecha");
    const r = resolveCombat(a, b, 2);
    expect(r.damageDealt[0]).toBeGreaterThanOrEqual(0);
    expect(r.damageDealt[1]).toBeGreaterThanOrEqual(0);
    expect(r.damageDealt[0] + r.damageDealt[1]).toBeGreaterThan(0);
  });

  it("turns <= 40 cap, and cappedOut only true when turns hits cap", () => {
    const a = makeSide("bio");
    const b = makeSide("mecha");
    const r = resolveCombat(a, b, 55);
    expect(r.turns).toBeLessThanOrEqual(40);
    if (r.cappedOut) expect(r.turns).toBe(40);
  });

  it("final HP of loser is 0 when not capped", () => {
    const a = makeSide("bio");
    const b = makeSide("mecha");
    const r = resolveCombat(a, b, 33);
    if (!r.cappedOut) {
      const loserHp = r.finalHp[1 - r.winnerIdx];
      expect(loserHp).toBe(0);
    }
  });

  it("rounds count equals turns", () => {
    const a = makeSide("bio");
    const b = makeSide("mecha");
    const r = resolveCombat(a, b, 123);
    expect(r.rounds.length).toBe(r.turns);
  });

  it("each round's action is one of the four known kinds", () => {
    const a = makeSide("pure");
    const b = makeSide("bio");
    const r = resolveCombat(a, b, 808);
    for (const round of r.rounds) {
      expect(["strike", "burst", "guard", "stall"]).toContain(round.action);
    }
  });
});

describe("resolveCombat — sensitivity to loadouts", () => {
  it("a dramatically stronger side wins more often across seeds", () => {
    const strong: CombatSide = {
      profile: getDefaultProfile("bio"),
      loadout: buildLoadout("Strong", "bio", 2000, {
        maxHp: 800,
        minDamage: 60,
        maxDamage: 90,
      }),
    };
    const weak: CombatSide = {
      profile: getDefaultProfile("mecha"),
      loadout: buildLoadout("Weak", "mecha", 1000, {
        maxHp: 200,
        minDamage: 10,
        maxDamage: 14,
      }),
    };
    let strongWins = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      const r = resolveCombat(strong, weak, seed);
      if (r.winnerIdx === 0) strongWins += 1;
    }
    expect(strongWins).toBeGreaterThanOrEqual(18);
  });
});
