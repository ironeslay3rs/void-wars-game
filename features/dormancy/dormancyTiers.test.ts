import { describe, it, expect } from "vitest";
import {
  DORMANCY_LABEL,
  DORMANCY_SEVERITY,
  DORMANCY_TIER_HOURS,
  DORMANCY_TIER_ORDER,
  classifyDormancy,
  hoursIntoTier,
  type DormancyTier,
} from "@/features/dormancy/dormancyTiers";

describe("classifyDormancy — boundary hours", () => {
  it("classifies 0h as stable", () => {
    expect(classifyDormancy(0)).toBe("stable");
  });
  it("classifies just under 24h as stable", () => {
    expect(classifyDormancy(23.999)).toBe("stable");
  });
  it("classifies exactly 24h as strained (tier boundary is exclusive upper)", () => {
    expect(classifyDormancy(24)).toBe("strained");
  });
  it("classifies 71.999h as strained", () => {
    expect(classifyDormancy(71.999)).toBe("strained");
  });
  it("classifies exactly 72h as dormant", () => {
    expect(classifyDormancy(72)).toBe("dormant");
  });
  it("classifies 167.999h as dormant", () => {
    expect(classifyDormancy(167.999)).toBe("dormant");
  });
  it("classifies exactly 168h as displaced", () => {
    expect(classifyDormancy(168)).toBe("displaced");
  });
  it("classifies huge inputs as displaced", () => {
    expect(classifyDormancy(1e9)).toBe("displaced");
  });
});

describe("classifyDormancy — defensive inputs", () => {
  it("clamps negative hours to stable", () => {
    expect(classifyDormancy(-1)).toBe("stable");
    expect(classifyDormancy(-100000)).toBe("stable");
  });
  it("clamps NaN to stable", () => {
    expect(classifyDormancy(Number.NaN)).toBe("stable");
  });
  it("clamps +Infinity to displaced via walk", () => {
    expect(classifyDormancy(Number.POSITIVE_INFINITY)).toBe("stable");
  });
  it("clamps -Infinity to stable", () => {
    expect(classifyDormancy(Number.NEGATIVE_INFINITY)).toBe("stable");
  });
});

describe("DORMANCY_LABEL — canonical wording", () => {
  it("uses exact canonical labels", () => {
    expect(DORMANCY_LABEL.stable).toBe("Stable");
    expect(DORMANCY_LABEL.strained).toBe("Strained");
    expect(DORMANCY_LABEL.dormant).toBe("Dormant");
    expect(DORMANCY_LABEL.displaced).toBe("Displaced");
  });
  it("never uses 'Spirit' in any label (canon: Pure)", () => {
    for (const tier of DORMANCY_TIER_ORDER) {
      expect(DORMANCY_LABEL[tier]).not.toMatch(/spirit/i);
    }
  });
});

describe("DORMANCY_SEVERITY — ordinal rank", () => {
  it("assigns stable=0, strained=1, dormant=2, displaced=3", () => {
    expect(DORMANCY_SEVERITY.stable).toBe(0);
    expect(DORMANCY_SEVERITY.strained).toBe(1);
    expect(DORMANCY_SEVERITY.dormant).toBe(2);
    expect(DORMANCY_SEVERITY.displaced).toBe(3);
  });
  it("is strictly monotonic along the tier order", () => {
    for (let i = 1; i < DORMANCY_TIER_ORDER.length; i++) {
      const prev = DORMANCY_SEVERITY[DORMANCY_TIER_ORDER[i - 1]];
      const curr = DORMANCY_SEVERITY[DORMANCY_TIER_ORDER[i]];
      expect(curr).toBeGreaterThan(prev);
    }
  });
});

describe("DORMANCY_TIER_HOURS — ascending thresholds", () => {
  it("has canonical 24/72/168/Infinity upper bounds", () => {
    expect(DORMANCY_TIER_HOURS.stable).toBe(24);
    expect(DORMANCY_TIER_HOURS.strained).toBe(72);
    expect(DORMANCY_TIER_HOURS.dormant).toBe(168);
    expect(DORMANCY_TIER_HOURS.displaced).toBe(Infinity);
  });
  it("is strictly ascending along tier order", () => {
    for (let i = 1; i < DORMANCY_TIER_ORDER.length; i++) {
      const prev = DORMANCY_TIER_HOURS[DORMANCY_TIER_ORDER[i - 1]];
      const curr = DORMANCY_TIER_HOURS[DORMANCY_TIER_ORDER[i]];
      expect(curr).toBeGreaterThan(prev);
    }
  });
});

describe("DORMANCY_TIER_ORDER — fixed iteration order", () => {
  it("lists exactly the four tiers in canonical order", () => {
    expect(DORMANCY_TIER_ORDER).toEqual([
      "stable",
      "strained",
      "dormant",
      "displaced",
    ] satisfies DormancyTier[]);
  });
});

describe("hoursIntoTier — math", () => {
  it("returns raw hours inside stable", () => {
    expect(hoursIntoTier(0)).toBe(0);
    expect(hoursIntoTier(12)).toBe(12);
    expect(hoursIntoTier(23.5)).toBe(23.5);
  });
  it("subtracts stable upper when in strained", () => {
    expect(hoursIntoTier(24)).toBe(0);
    expect(hoursIntoTier(48)).toBe(24);
  });
  it("subtracts strained upper when in dormant", () => {
    expect(hoursIntoTier(72)).toBe(0);
    expect(hoursIntoTier(120)).toBe(48);
  });
  it("subtracts dormant upper when displaced (unbounded)", () => {
    expect(hoursIntoTier(168)).toBe(0);
    expect(hoursIntoTier(500)).toBe(500 - 168);
  });
  it("clamps negatives/NaN to 0 at stable", () => {
    expect(hoursIntoTier(-5)).toBe(0);
    expect(hoursIntoTier(Number.NaN)).toBe(0);
  });
});
