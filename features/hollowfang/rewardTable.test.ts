import { describe, expect, it } from "vitest";

import {
  rollHollowfangReward,
  totalResourceCount,
  type HollowfangRewardBundle,
} from "@/features/hollowfang/rewardTable";
import type { RewardTier } from "@/features/hollowfang/encounterResolver";

const TIERS: RewardTier[] = ["victory", "partial", "wipe"];

describe("rollHollowfangReward — shape", () => {
  it("returns the requested tier and seed", () => {
    for (const tier of TIERS) {
      const b = rollHollowfangReward(tier, 12345);
      expect(b.tier).toBe(tier);
      expect(b.seed).toBe(12345);
      expect(typeof b.flavor).toBe("string");
      expect(b.flavor.length).toBeGreaterThan(0);
    }
  });

  it("resources is a non-empty array for every tier", () => {
    for (const tier of TIERS) {
      const b = rollHollowfangReward(tier, 1);
      expect(Array.isArray(b.resources)).toBe(true);
      expect(b.resources.length).toBeGreaterThan(0);
      for (const entry of b.resources) {
        expect(entry.amount).toBeGreaterThan(0);
        expect(typeof entry.key).toBe("string");
      }
    }
  });

  it("namedMaterials hook is present and empty (Phase 2 not wired yet)", () => {
    for (const tier of TIERS) {
      const b = rollHollowfangReward(tier, 7);
      expect(Array.isArray(b.namedMaterials)).toBe(true);
      expect(b.namedMaterials).toEqual([]);
    }
  });

  it("does not crash or throw when iterating the empty namedMaterials hook", () => {
    const b = rollHollowfangReward("victory", 42);
    expect(() => {
      for (const m of b.namedMaterials) {
        void m.id;
        void m.label;
      }
    }).not.toThrow();
  });
});

describe("rollHollowfangReward — determinism", () => {
  it("same (tier, seed) yields the same bundle", () => {
    const a = rollHollowfangReward("victory", 99);
    const b = rollHollowfangReward("victory", 99);
    expect(a).toEqual(b);
  });

  it("different seeds can produce different resource amounts for the same tier", () => {
    const a = rollHollowfangReward("victory", 1);
    const b = rollHollowfangReward("victory", 10_000);
    expect(JSON.stringify(a.resources)).not.toBe(JSON.stringify(b.resources));
  });
});

describe("rollHollowfangReward — tier ordering", () => {
  // Averages across many seeds — avoids one-shot noise for a monotone claim.
  function averageTotal(tier: RewardTier, seedCount = 50): number {
    let sum = 0;
    for (let seed = 1; seed <= seedCount; seed += 1) {
      sum += totalResourceCount(rollHollowfangReward(tier, seed));
    }
    return sum / seedCount;
  }

  it("victory rolls bigger totals than partial on average", () => {
    expect(averageTotal("victory")).toBeGreaterThan(averageTotal("partial"));
  });

  it("partial rolls bigger totals than wipe on average", () => {
    expect(averageTotal("partial")).toBeGreaterThan(averageTotal("wipe"));
  });

  it("victory tier includes apex materials (bloodvein/ashveil/ironHeart)", () => {
    // Over a small seed sweep, at least one apex should appear.
    const seen = new Set<string>();
    for (let seed = 1; seed <= 25; seed += 1) {
      const b = rollHollowfangReward("victory", seed);
      for (const r of b.resources) seen.add(r.key);
    }
    const apex = ["bloodvein", "ashveil", "ironHeart"];
    const any = apex.some((k) => seen.has(k));
    expect(any).toBe(true);
  });

  it("wipe tier stays to low-grade scraps (no apex materials)", () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const b = rollHollowfangReward("wipe", seed);
      for (const r of b.resources) {
        expect(["bloodvein", "ashveil", "ironHeart"]).not.toContain(r.key);
      }
    }
  });
});

describe("totalResourceCount", () => {
  it("sums every resource entry amount", () => {
    const fake: HollowfangRewardBundle = {
      tier: "victory",
      seed: 0,
      resources: [
        { key: "credits", amount: 10 },
        { key: "runeDust", amount: 5 },
      ],
      namedMaterials: [],
      flavor: "x",
    };
    expect(totalResourceCount(fake)).toBe(15);
  });

  it("returns 0 for an empty resources list", () => {
    const fake: HollowfangRewardBundle = {
      tier: "wipe",
      seed: 0,
      resources: [],
      namedMaterials: [],
      flavor: "x",
    };
    expect(totalResourceCount(fake)).toBe(0);
  });
});

describe("rollHollowfangReward — purity", () => {
  it("returns a fresh bundle each call (separate arrays)", () => {
    const a = rollHollowfangReward("victory", 5);
    const b = rollHollowfangReward("victory", 5);
    expect(a).not.toBe(b);
    expect(a.resources).not.toBe(b.resources);
    expect(a.namedMaterials).not.toBe(b.namedMaterials);
  });

  it("does not mutate a caller-supplied options object", () => {
    const opts = { includePhase2: true } as const;
    const snapshot = JSON.stringify(opts);
    rollHollowfangReward("victory", 123, opts);
    rollHollowfangReward("partial", 456, opts);
    expect(JSON.stringify(opts)).toBe(snapshot);
  });
});

// ────────────────────────────────────────────────────────────────────
// Phase 2 named-materials opt-in
// ────────────────────────────────────────────────────────────────────

const PHASE2_IDS = new Set(["veinshard", "heartIron", "veilAsh", "meldshard"]);

describe("rollHollowfangReward — includePhase2 default (off)", () => {
  it("preserves legacy empty namedMaterials when option is omitted", () => {
    for (const tier of TIERS) {
      const b = rollHollowfangReward(tier, 7);
      expect(b.namedMaterials).toEqual([]);
    }
  });

  it("preserves legacy empty namedMaterials when includePhase2: false", () => {
    for (const tier of TIERS) {
      const b = rollHollowfangReward(tier, 7, { includePhase2: false });
      expect(b.namedMaterials).toEqual([]);
    }
  });

  it("resource roll output is byte-identical with vs without the option (back-compat)", () => {
    for (const tier of TIERS) {
      for (const seed of [1, 42, 999, 12_345]) {
        const legacy = rollHollowfangReward(tier, seed);
        const explicit = rollHollowfangReward(tier, seed, {
          includePhase2: false,
        });
        expect(explicit.resources).toEqual(legacy.resources);
      }
    }
  });
});

describe("rollHollowfangReward — includePhase2: true", () => {
  it("is deterministic for the same (tier, seed)", () => {
    const a = rollHollowfangReward("victory", 777, { includePhase2: true });
    const b = rollHollowfangReward("victory", 777, { includePhase2: true });
    expect(a.namedMaterials).toEqual(b.namedMaterials);
    expect(a.resources).toEqual(b.resources);
  });

  it("only emits ids from the Phase 2 registry (no apex leakage)", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const b = rollHollowfangReward("victory", seed, { includePhase2: true });
      for (const entry of b.namedMaterials) {
        expect(PHASE2_IDS.has(entry.id)).toBe(true);
        expect(typeof entry.label).toBe("string");
        expect(entry.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("wipe tier never emits phase2 drops", () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const b = rollHollowfangReward("wipe", seed, { includePhase2: true });
      expect(b.namedMaterials).toEqual([]);
    }
  });

  // Tier weights: victory 0.45, partial 0.15, wipe 0.0. Independent-chance
  // roll over 4 registry entries → expected-count ≈ 4 * p. Sampled over a
  // large seed sweep so stochastic noise doesn't fail the suite.
  function averagePhase2Count(
    tier: RewardTier,
    seedCount: number,
  ): number {
    let sum = 0;
    for (let seed = 1; seed <= seedCount; seed += 1) {
      sum += rollHollowfangReward(tier, seed, { includePhase2: true })
        .namedMaterials.length;
    }
    return sum / seedCount;
  }

  it("victory averages close to 4 * 0.45 = 1.8 phase2 drops", () => {
    const avg = averagePhase2Count("victory", 400);
    expect(avg).toBeGreaterThan(1.4);
    expect(avg).toBeLessThan(2.2);
  });

  it("partial averages close to 4 * 0.15 = 0.6 phase2 drops", () => {
    const avg = averagePhase2Count("partial", 400);
    expect(avg).toBeGreaterThan(0.3);
    expect(avg).toBeLessThan(0.9);
  });

  it("victory drops strictly more phase2 mats on average than partial", () => {
    const victory = averagePhase2Count("victory", 300);
    const partial = averagePhase2Count("partial", 300);
    expect(victory).toBeGreaterThan(partial);
  });

  it("victory drops more than wipe (wipe is exactly zero)", () => {
    expect(averagePhase2Count("wipe", 100)).toBe(0);
    expect(averagePhase2Count("victory", 100)).toBeGreaterThan(0);
  });

  it("over a seed sweep, each phase2 id is reachable on victory", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200; seed += 1) {
      const b = rollHollowfangReward("victory", seed, { includePhase2: true });
      for (const m of b.namedMaterials) seen.add(m.id);
    }
    for (const id of PHASE2_IDS) {
      expect(seen.has(id)).toBe(true);
    }
  });
});
