import { describe, expect, it } from "vitest";

import {
  HOLLOWFANG_PROFILE,
  getHollowfangPhase,
  getPhaseByOrder,
  totalTurnBudget,
  type HollowfangPhase,
  type HollowfangProfile,
} from "@/features/hollowfang/hollowfangProfile";

describe("HOLLOWFANG_PROFILE — integrity", () => {
  it("declares prestige identity and a positive HP pool", () => {
    expect(HOLLOWFANG_PROFILE.id).toBe("hollowfang");
    expect(HOLLOWFANG_PROFILE.tier).toBe("prestige");
    expect(HOLLOWFANG_PROFILE.displayName.length).toBeGreaterThan(0);
    expect(HOLLOWFANG_PROFILE.maxHp).toBeGreaterThan(0);
    expect(HOLLOWFANG_PROFILE.recommendedRankLevel).toBeGreaterThan(0);
    expect(HOLLOWFANG_PROFILE.baseCorruptionTax).toBeGreaterThan(0);
  });

  it("has exactly three phases in ascending order", () => {
    expect(HOLLOWFANG_PROFILE.phases).toHaveLength(3);
    HOLLOWFANG_PROFILE.phases.forEach((phase, idx) => {
      expect(phase.order).toBe(idx + 1);
    });
  });

  it("has monotonically-decreasing hpEnterAt thresholds (gating each phase)", () => {
    const thresholds = HOLLOWFANG_PROFILE.phases.map((p) => p.hpEnterAt);
    expect(thresholds[0]).toBe(1);
    for (let i = 1; i < thresholds.length; i += 1) {
      expect(thresholds[i]).toBeLessThan(thresholds[i - 1]!);
    }
    thresholds.forEach((t) => {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    });
  });

  it("escalates incoming baseDamage phase over phase", () => {
    const [p1, p2, p3] = HOLLOWFANG_PROFILE.phases;
    expect(p2!.baseDamage).toBeGreaterThan(p1!.baseDamage);
    expect(p3!.baseDamage).toBeGreaterThan(p2!.baseDamage);
  });

  it("has non-empty tell lists with readable labels and positive dangerBudget", () => {
    for (const phase of HOLLOWFANG_PROFILE.phases) {
      expect(phase.tells.length).toBeGreaterThan(0);
      const ids = new Set<string>();
      for (const tell of phase.tells) {
        expect(tell.id).toBeTruthy();
        expect(tell.label.length).toBeGreaterThan(0);
        expect(tell.flavor.length).toBeGreaterThan(0);
        expect(tell.dangerBudget).toBeGreaterThan(0);
        expect(tell.dangerBudget).toBeLessThanOrEqual(10);
        expect(ids.has(tell.id)).toBe(false);
        ids.add(tell.id);
      }
    }
  });

  it("has unique phase ids and positive turn caps", () => {
    const seen = new Set<HollowfangPhase["id"]>();
    for (const phase of HOLLOWFANG_PROFILE.phases) {
      expect(seen.has(phase.id)).toBe(false);
      seen.add(phase.id);
      expect(phase.turnCap).toBeGreaterThan(0);
      expect(phase.name.length).toBeGreaterThan(0);
      expect(phase.flavor.length).toBeGreaterThan(0);
    }
  });

  it("uses Pure naming (never Spirit) in flavor text", () => {
    const corpus = [
      HOLLOWFANG_PROFILE.displayName,
      ...HOLLOWFANG_PROFILE.phases.map((p) => p.flavor),
      ...HOLLOWFANG_PROFILE.phases.flatMap((p) => p.tells.map((t) => t.flavor)),
    ].join(" ");
    expect(/\bspirit\b/i.test(corpus)).toBe(false);
  });
});

describe("selectors", () => {
  it("getHollowfangPhase returns the matching phase", () => {
    const p = getHollowfangPhase("hollow-rage");
    expect(p).toBeDefined();
    expect(p!.order).toBe(2);
  });

  it("getHollowfangPhase returns undefined for unknown id", () => {
    // @ts-expect-error — intentional bad id for runtime check
    expect(getHollowfangPhase("nope")).toBeUndefined();
  });

  it("getPhaseByOrder returns the phase of that order", () => {
    expect(getPhaseByOrder(1).id).toBe("marrow-hunt");
    expect(getPhaseByOrder(2).id).toBe("hollow-rage");
    expect(getPhaseByOrder(3).id).toBe("void-maw");
  });

  it("totalTurnBudget equals sum of phase turn caps", () => {
    const expected = HOLLOWFANG_PROFILE.phases.reduce(
      (a, p) => a + p.turnCap,
      0,
    );
    expect(totalTurnBudget()).toBe(expected);
  });

  it("totalTurnBudget accepts a custom profile", () => {
    const custom: HollowfangProfile = {
      ...HOLLOWFANG_PROFILE,
      phases: HOLLOWFANG_PROFILE.phases.map((p) => ({ ...p, turnCap: 2 })),
    };
    expect(totalTurnBudget(custom)).toBe(6);
  });
});

describe("purity — profile is not mutated by selectors", () => {
  it("selector calls leave the canonical profile untouched", () => {
    const snapshot = JSON.stringify(HOLLOWFANG_PROFILE);
    getPhaseByOrder(1);
    getHollowfangPhase("void-maw");
    totalTurnBudget();
    expect(JSON.stringify(HOLLOWFANG_PROFILE)).toBe(snapshot);
  });
});
