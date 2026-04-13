import { describe, expect, it } from "vitest";
import {
  EXPLORATION_VARIANCE_MAX_PCT,
  EXPLORATION_VARIANCE_MIN_PCT,
  rollExplorationReward,
} from "@/features/exploration/rollExplorationReward";
import { phase1ExplorationReward } from "@/features/exploration/explorationData";

describe("rollExplorationReward", () => {
  it("preserves rank XP, mastery, influence — only resources vary", () => {
    const rolled = rollExplorationReward(
      phase1ExplorationReward,
      "seed-alpha",
    );
    expect(rolled.rankXp).toBe(phase1ExplorationReward.rankXp);
    expect(rolled.masteryProgress).toBe(phase1ExplorationReward.masteryProgress);
    expect(rolled.influence).toBe(phase1ExplorationReward.influence);
    expect(rolled.conditionDelta).toBe(phase1ExplorationReward.conditionDelta);
  });

  it("resources land within the ±variance band", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const rolled = rollExplorationReward(phase1ExplorationReward, seed);
      for (const [key, baseAmount] of Object.entries(
        phase1ExplorationReward.resources ?? {},
      )) {
        if (typeof baseAmount !== "number") continue;
        const rolledAmount = rolled.resources?.[key as keyof typeof rolled.resources];
        expect(rolledAmount).toBeDefined();
        const min = Math.max(1, Math.round(baseAmount * EXPLORATION_VARIANCE_MIN_PCT));
        const max = Math.max(1, Math.round(baseAmount * EXPLORATION_VARIANCE_MAX_PCT));
        expect(rolledAmount!).toBeGreaterThanOrEqual(min);
        expect(rolledAmount!).toBeLessThanOrEqual(max);
      }
    }
  });

  it("same seed produces same roll (deterministic)", () => {
    const a = rollExplorationReward(phase1ExplorationReward, "fixed-seed");
    const b = rollExplorationReward(phase1ExplorationReward, "fixed-seed");
    expect(a.resources).toEqual(b.resources);
  });

  it("different seeds produce different rolls across a sample", () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const r = rollExplorationReward(phase1ExplorationReward, `s-${i}`);
      results.add(JSON.stringify(r.resources));
    }
    // At least 3 distinct outcomes across 20 seeds — confirms variance
    // is actually sampling, not collapsing to one value.
    expect(results.size).toBeGreaterThanOrEqual(3);
  });

  it("never drops a resource to zero (floor of 1)", () => {
    const rolled = rollExplorationReward(phase1ExplorationReward, "x");
    for (const v of Object.values(rolled.resources ?? {})) {
      expect(v).toBeGreaterThanOrEqual(1);
    }
  });
});
