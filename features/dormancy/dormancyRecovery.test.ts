import { describe, it, expect } from "vitest";
import {
  projectDormancy,
  projectDormancyFromTimestamps,
} from "@/features/dormancy/dormancyRecovery";
import {
  DORMANCY_EFFECTS,
  computeRecoveryCost,
} from "@/features/dormancy/dormancyEffects";

type Snap = { condition: number; voidInstability: number };
const fresh = (): Snap => ({ condition: 100, voidInstability: 0 });

describe("projectDormancy — tier routing", () => {
  it("0h routes to stable, zero deltas, zero cost", () => {
    const p = projectDormancy(fresh(), 0);
    expect(p.newTier).toBe("stable");
    expect(p.conditionDelta).toBe(0);
    expect(p.corruptionDelta).toBe(0);
    expect(p.pendingRecoveryCost).toBe(0);
    expect(p.rewardPenaltyMult).toBe(1);
  });
  it("36h routes to strained", () => {
    expect(projectDormancy(fresh(), 36).newTier).toBe("strained");
  });
  it("100h routes to dormant", () => {
    expect(projectDormancy(fresh(), 100).newTier).toBe("dormant");
  });
  it("200h routes to displaced", () => {
    expect(projectDormancy(fresh(), 200).newTier).toBe("displaced");
  });
});

describe("projectDormancy — delta math against the tuning table", () => {
  it("strained 48h: drain = 2 * 2days = 4; corruption = 1 * 2 = 2", () => {
    const p = projectDormancy(fresh(), 48);
    expect(p.newTier).toBe("strained");
    expect(p.conditionDelta).toBeCloseTo(-4, 10);
    expect(p.corruptionDelta).toBeCloseTo(2, 10);
  });
  it("dormant 96h: drain = 5 * 4days = 20; corruption = 3 * 4 = 12", () => {
    const p = projectDormancy(fresh(), 96);
    expect(p.newTier).toBe("dormant");
    expect(p.conditionDelta).toBeCloseTo(-20, 10);
    expect(p.corruptionDelta).toBeCloseTo(12, 10);
  });
  it("displaced 240h = 10d: drain = 8*10 = 80 clamped by condition; corruption = 5*10 = 50", () => {
    const p = projectDormancy(fresh(), 240);
    expect(p.newTier).toBe("displaced");
    expect(p.conditionDelta).toBeCloseTo(-80, 10);
    expect(p.corruptionDelta).toBeCloseTo(50, 10);
  });
  it("pendingRecoveryCost matches table lookup per tier", () => {
    expect(projectDormancy(fresh(), 36).pendingRecoveryCost).toBe(
      computeRecoveryCost("strained"),
    );
    expect(projectDormancy(fresh(), 100).pendingRecoveryCost).toBe(
      computeRecoveryCost("dormant"),
    );
    expect(projectDormancy(fresh(), 200).pendingRecoveryCost).toBe(
      computeRecoveryCost("displaced"),
    );
  });
  it("rewardPenaltyMult mirrors tuning table", () => {
    expect(projectDormancy(fresh(), 36).rewardPenaltyMult).toBe(
      DORMANCY_EFFECTS.strained.rewardPenaltyMult,
    );
    expect(projectDormancy(fresh(), 200).rewardPenaltyMult).toBe(
      DORMANCY_EFFECTS.displaced.rewardPenaltyMult,
    );
  });
});

describe("projectDormancy — clamp invariants", () => {
  it("condition never projected below 0", () => {
    const low: Snap = { condition: 5, voidInstability: 0 };
    const p = projectDormancy(low, 1000); // huge displaced window
    expect(low.condition + p.conditionDelta).toBeGreaterThanOrEqual(0);
    expect(p.conditionDelta).toBeLessThanOrEqual(0);
    expect(p.conditionDelta).toBeGreaterThanOrEqual(-5);
  });
  it("corruption never projected above 100", () => {
    const high: Snap = { condition: 100, voidInstability: 95 };
    const p = projectDormancy(high, 1000);
    expect(high.voidInstability + p.corruptionDelta).toBeLessThanOrEqual(100);
    expect(p.corruptionDelta).toBeGreaterThanOrEqual(0);
    expect(p.corruptionDelta).toBeLessThanOrEqual(5);
  });
  it("corruption delta always >= 0", () => {
    for (const h of [0, 10, 36, 100, 200, 1000]) {
      expect(projectDormancy(fresh(), h).corruptionDelta).toBeGreaterThanOrEqual(
        0,
      );
    }
  });
  it("condition delta always <= 0", () => {
    for (const h of [0, 10, 36, 100, 200, 1000]) {
      expect(projectDormancy(fresh(), h).conditionDelta).toBeLessThanOrEqual(0);
    }
  });
  it("pendingRecoveryCost never negative", () => {
    for (const h of [0, 10, 36, 100, 200, 1000]) {
      expect(
        projectDormancy(fresh(), h).pendingRecoveryCost,
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("projectDormancy — defensive elapsedHours input", () => {
  it("negative elapsed collapses to 0-hour stable projection", () => {
    const p = projectDormancy(fresh(), -5);
    expect(p.newTier).toBe("stable");
    expect(p.elapsedHours).toBe(0);
    expect(p.conditionDelta).toBe(0);
    expect(p.corruptionDelta).toBe(0);
  });
  it("NaN elapsed → stable 0h", () => {
    const p = projectDormancy(fresh(), Number.NaN);
    expect(p.newTier).toBe("stable");
    expect(p.elapsedHours).toBe(0);
  });
  it("+Infinity elapsed collapses to stable (non-finite sentinel)", () => {
    const p = projectDormancy(fresh(), Number.POSITIVE_INFINITY);
    expect(p.elapsedHours).toBe(0);
    expect(p.newTier).toBe("stable");
  });
});

describe("projectDormancy — purity: no input mutation", () => {
  it("does not mutate the player snapshot", () => {
    const snap: Snap = { condition: 77, voidInstability: 33 };
    const before = { ...snap };
    projectDormancy(snap, 200);
    expect(snap).toEqual(before);
  });
});

describe("projectDormancyFromTimestamps — timestamp math", () => {
  const HOUR_MS = 3_600_000;
  const DAY_MS = 24 * HOUR_MS;

  it("identical timestamps → 0h stable", () => {
    const t = 1_700_000_000_000;
    const p = projectDormancyFromTimestamps(fresh(), t, t);
    expect(p.elapsedHours).toBe(0);
    expect(p.newTier).toBe("stable");
  });
  it("now − last = 48h (strained) applies strained tuning", () => {
    const now = 1_700_000_000_000;
    const last = now - 48 * HOUR_MS;
    const p = projectDormancyFromTimestamps(fresh(), last, now);
    expect(p.elapsedHours).toBeCloseTo(48, 10);
    expect(p.newTier).toBe("strained");
    expect(p.conditionDelta).toBeCloseTo(-4, 10);
  });
  it("8-day delta routes to displaced", () => {
    const now = 1_700_000_000_000;
    const last = now - 8 * DAY_MS;
    const p = projectDormancyFromTimestamps(fresh(), last, now);
    expect(p.newTier).toBe("displaced");
    expect(p.elapsedHours).toBeCloseTo(192, 10);
  });
  it("negative delta (last > now) collapses to 0 (no time travel bonus)", () => {
    const now = 1_700_000_000_000;
    const last = now + 10 * DAY_MS;
    const p = projectDormancyFromTimestamps(fresh(), last, now);
    expect(p.elapsedHours).toBe(0);
    expect(p.newTier).toBe("stable");
  });
  it("non-finite lastSeen collapses safely", () => {
    const now = 1_700_000_000_000;
    const p = projectDormancyFromTimestamps(fresh(), Number.NaN, now);
    expect(p.elapsedHours).toBe(0);
    expect(p.newTier).toBe("stable");
  });
  it("does not mutate input player", () => {
    const snap: Snap = { condition: 50, voidInstability: 20 };
    const before = { ...snap };
    const now = 1_700_000_000_000;
    projectDormancyFromTimestamps(snap, now - 72 * HOUR_MS, now);
    expect(snap).toEqual(before);
  });
});
