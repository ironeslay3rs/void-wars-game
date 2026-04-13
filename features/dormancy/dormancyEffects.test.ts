import { describe, it, expect } from "vitest";
import {
  DORMANCY_EFFECTS,
  DORMANCY_BASE_RECOVERY_COST,
  getDormancyEffects,
  computeRecoveryCost,
} from "@/features/dormancy/dormancyEffects";
import {
  DORMANCY_LABEL,
  DORMANCY_TIER_ORDER,
} from "@/features/dormancy/dormancyTiers";

describe("DORMANCY_EFFECTS — Stable has zero bite", () => {
  it("Stable drains nothing, no corruption, neutral reward & cost", () => {
    const e = DORMANCY_EFFECTS.stable;
    expect(e.conditionDrainPerDay).toBe(0);
    expect(e.corruptionGainPerDay).toBe(0);
    expect(e.rewardPenaltyMult).toBe(1);
    expect(e.recoveryCostMult).toBe(1);
  });
});

describe("DORMANCY_EFFECTS — severity monotonicity", () => {
  const order = ["strained", "dormant", "displaced"] as const;
  it("conditionDrainPerDay strictly increases across Strained < Dormant < Displaced", () => {
    for (let i = 1; i < order.length; i++) {
      expect(DORMANCY_EFFECTS[order[i]].conditionDrainPerDay).toBeGreaterThan(
        DORMANCY_EFFECTS[order[i - 1]].conditionDrainPerDay,
      );
    }
  });
  it("corruptionGainPerDay strictly increases", () => {
    for (let i = 1; i < order.length; i++) {
      expect(DORMANCY_EFFECTS[order[i]].corruptionGainPerDay).toBeGreaterThan(
        DORMANCY_EFFECTS[order[i - 1]].corruptionGainPerDay,
      );
    }
  });
  it("rewardPenaltyMult strictly decreases (worse tier = smaller multiplier)", () => {
    for (let i = 1; i < order.length; i++) {
      expect(DORMANCY_EFFECTS[order[i]].rewardPenaltyMult).toBeLessThan(
        DORMANCY_EFFECTS[order[i - 1]].rewardPenaltyMult,
      );
    }
  });
  it("recoveryCostMult strictly increases", () => {
    for (let i = 1; i < order.length; i++) {
      expect(DORMANCY_EFFECTS[order[i]].recoveryCostMult).toBeGreaterThan(
        DORMANCY_EFFECTS[order[i - 1]].recoveryCostMult,
      );
    }
  });
  it("Stable is gentler than Strained across every axis", () => {
    const s = DORMANCY_EFFECTS.stable;
    const x = DORMANCY_EFFECTS.strained;
    expect(s.conditionDrainPerDay).toBeLessThan(x.conditionDrainPerDay);
    expect(s.corruptionGainPerDay).toBeLessThan(x.corruptionGainPerDay);
    expect(s.rewardPenaltyMult).toBeGreaterThan(x.rewardPenaltyMult);
    expect(s.recoveryCostMult).toBeLessThanOrEqual(x.recoveryCostMult);
  });
  it("reward multipliers stay in (0, 1]", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      const m = DORMANCY_EFFECTS[tier].rewardPenaltyMult;
      expect(m).toBeGreaterThan(0);
      expect(m).toBeLessThanOrEqual(1);
    }
  });
});

describe("getDormancyEffects — lookup", () => {
  it("returns the same reference as DORMANCY_EFFECTS[tier]", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(getDormancyEffects(tier)).toBe(DORMANCY_EFFECTS[tier]);
    }
  });
});

describe("DORMANCY_BASE_RECOVERY_COST — non-negative & monotonic", () => {
  it("Stable is zero", () => {
    expect(DORMANCY_BASE_RECOVERY_COST.stable).toBe(0);
  });
  it("all costs are non-negative", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(DORMANCY_BASE_RECOVERY_COST[tier]).toBeGreaterThanOrEqual(0);
    }
  });
  it("cost strictly increases across tiers", () => {
    for (let i = 1; i < DORMANCY_TIER_ORDER.length; i++) {
      expect(
        DORMANCY_BASE_RECOVERY_COST[DORMANCY_TIER_ORDER[i]],
      ).toBeGreaterThan(
        DORMANCY_BASE_RECOVERY_COST[DORMANCY_TIER_ORDER[i - 1]],
      );
    }
  });
});

describe("computeRecoveryCost — floor(base × mult), clamped 0", () => {
  it("stable is always 0", () => {
    expect(computeRecoveryCost("stable")).toBe(0);
  });
  it("strained = floor(25 * 1.1) = 27", () => {
    expect(computeRecoveryCost("strained")).toBe(27);
  });
  it("dormant = floor(150 * 1.5) = 225", () => {
    expect(computeRecoveryCost("dormant")).toBe(225);
  });
  it("displaced = floor(600 * 2.5) = 1500", () => {
    expect(computeRecoveryCost("displaced")).toBe(1500);
  });
  it("is non-negative for every tier", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(computeRecoveryCost(tier)).toBeGreaterThanOrEqual(0);
    }
  });
  it("is monotonic across tiers", () => {
    const costs = DORMANCY_TIER_ORDER.map((t) => computeRecoveryCost(t));
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1]);
    }
  });
  it("returns integers", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(Number.isInteger(computeRecoveryCost(tier))).toBe(true);
    }
  });
});

describe("canon — 'Pure' never 'Spirit' in labels (sanity)", () => {
  it("label set contains no Spirit-era wording", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(DORMANCY_LABEL[tier]).not.toMatch(/spirit/i);
    }
  });
});
