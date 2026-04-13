import { describe, expect, it } from "vitest";

import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import {
  HOLLOWFANG_PREP,
  checkPrep,
  readinessScore,
  type HollowfangPrepRequirements,
} from "@/features/hollowfang/prepRequirements";

// ────────────────────────────────────────────────────────────────────
// Helpers — build the minimal "PrepPlayer" shape the module consumes
// ────────────────────────────────────────────────────────────────────

const ALL_KEYS: ResourceKey[] = [
  "credits",
  "ironOre",
  "scrapAlloy",
  "runeDust",
  "emberCore",
  "bioSamples",
  "mossRations",
  "coilboundLattice",
  "ashSynodRelic",
  "vaultLatticeShard",
  "ironHeart",
  "bloodvein",
  "ashveil",
];

function makeResources(overrides: Partial<Record<ResourceKey, number>> = {}): ResourcesState {
  const base: ResourcesState = {} as ResourcesState;
  for (const k of ALL_KEYS) base[k] = 0;
  return { ...base, ...overrides };
}

type PrepPlayer = {
  rankLevel: number;
  condition: number;
  voidInstability: number;
  resources: ResourcesState;
};

function readyPlayer(overrides: Partial<PrepPlayer> = {}): PrepPlayer {
  return {
    rankLevel: HOLLOWFANG_PREP.minRankLevel,
    condition: HOLLOWFANG_PREP.minCondition + 10,
    voidInstability: 10,
    resources: makeResources({
      bloodvein: 2,
      ashveil: 2,
      runeDust: 40,
      emberCore: 5,
    }),
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────────────
// checkPrep
// ────────────────────────────────────────────────────────────────────

describe("checkPrep", () => {
  it("passes with empty blockers when the player is fully prepped", () => {
    const res = checkPrep(readyPlayer());
    expect(res.ok).toBe(true);
    expect(res.blockers).toEqual([]);
    expect(res.requirements).toBe(HOLLOWFANG_PREP);
  });

  it("reports a rank blocker when under-ranked", () => {
    const res = checkPrep(readyPlayer({ rankLevel: 1 }));
    expect(res.ok).toBe(false);
    const ranks = res.blockers.filter((b) => b.kind === "rank");
    expect(ranks).toHaveLength(1);
    const rb = ranks[0]!;
    expect(rb.kind).toBe("rank");
    if (rb.kind === "rank") {
      expect(rb.required).toBe(HOLLOWFANG_PREP.minRankLevel);
      expect(rb.actual).toBe(1);
    }
  });

  it("reports a condition blocker when condition is too low", () => {
    const res = checkPrep(readyPlayer({ condition: 10 }));
    const found = res.blockers.find((b) => b.kind === "condition");
    expect(found).toBeDefined();
    if (found && found.kind === "condition") {
      expect(found.actual).toBe(10);
      expect(found.required).toBe(HOLLOWFANG_PREP.minCondition);
      expect(found.tier).toBeTruthy();
    }
  });

  it("reports a corruption blocker when over the cap", () => {
    const res = checkPrep(readyPlayer({ voidInstability: 95 }));
    const found = res.blockers.find((b) => b.kind === "corruption");
    expect(found).toBeDefined();
    if (found && found.kind === "corruption") {
      expect(found.actual).toBeGreaterThan(HOLLOWFANG_PREP.maxCorruption);
      expect(found.required).toBe(HOLLOWFANG_PREP.maxCorruption);
    }
  });

  it("reports one material blocker per missing stack", () => {
    const res = checkPrep(readyPlayer({ resources: makeResources() }));
    const matBlockers = res.blockers.filter((b) => b.kind === "material");
    expect(matBlockers.length).toBe(HOLLOWFANG_PREP.materials.length);
    for (const mat of HOLLOWFANG_PREP.materials) {
      const blk = matBlockers.find(
        (b) => b.kind === "material" && b.key === mat.key,
      );
      expect(blk).toBeDefined();
      if (blk && blk.kind === "material") {
        expect(blk.required).toBe(mat.amount);
        expect(blk.actual).toBe(0);
      }
    }
  });

  it("lists every failing dimension when the player is fully un-prepped", () => {
    const res = checkPrep({
      rankLevel: 0,
      condition: 0,
      voidInstability: 100,
      resources: makeResources(),
    });
    const kinds = new Set(res.blockers.map((b) => b.kind));
    expect(kinds.has("rank")).toBe(true);
    expect(kinds.has("condition")).toBe(true);
    expect(kinds.has("corruption")).toBe(true);
    expect(kinds.has("material")).toBe(true);
    expect(res.ok).toBe(false);
  });

  it("accepts a custom requirements spec", () => {
    const custom: HollowfangPrepRequirements = {
      minRankLevel: 1,
      minCondition: 1,
      maxCorruption: 100,
      materials: [{ key: "credits", amount: 1 }],
    };
    const res = checkPrep(
      {
        rankLevel: 1,
        condition: 1,
        voidInstability: 0,
        resources: makeResources({ credits: 1 }),
      },
      custom,
    );
    expect(res.ok).toBe(true);
    expect(res.requirements).toBe(custom);
  });
});

// ────────────────────────────────────────────────────────────────────
// readinessScore
// ────────────────────────────────────────────────────────────────────

describe("readinessScore", () => {
  it("returns ~1.0 for a fully-prepped player", () => {
    const score = readinessScore(readyPlayer());
    expect(score).toBeGreaterThanOrEqual(0.95);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("returns a low score for an un-prepped player", () => {
    const score = readinessScore({
      rankLevel: 0,
      condition: 0,
      voidInstability: 100,
      resources: makeResources(),
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(0.3);
  });

  it("stays within [0, 1] for extreme inputs", () => {
    const high = readinessScore({
      rankLevel: 9999,
      condition: 9999,
      voidInstability: 0,
      resources: makeResources({
        bloodvein: 9999,
        ashveil: 9999,
        runeDust: 9999,
        emberCore: 9999,
      }),
    });
    expect(high).toBeLessThanOrEqual(1);
    expect(high).toBeGreaterThanOrEqual(0);

    const low = readinessScore({
      rankLevel: -50,
      condition: -50,
      voidInstability: 9999,
      resources: makeResources(),
    });
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
  });

  it("is monotonic: more-ready inputs do not score lower than less-ready", () => {
    const lean = readinessScore({
      rankLevel: 5,
      condition: 30,
      voidInstability: 70,
      resources: makeResources({ runeDust: 5 }),
    });
    const mid = readinessScore({
      rankLevel: 10,
      condition: 50,
      voidInstability: 40,
      resources: makeResources({
        bloodvein: 1,
        runeDust: 10,
        emberCore: 2,
      }),
    });
    const full = readinessScore(readyPlayer());
    expect(mid).toBeGreaterThanOrEqual(lean);
    expect(full).toBeGreaterThanOrEqual(mid);
  });
});

describe("purity", () => {
  it("does not mutate the player input", () => {
    const player = readyPlayer();
    const snapshot = JSON.stringify(player);
    checkPrep(player);
    readinessScore(player);
    expect(JSON.stringify(player)).toBe(snapshot);
  });

  it("does not mutate the HOLLOWFANG_PREP constant", () => {
    const snapshot = JSON.stringify(HOLLOWFANG_PREP);
    checkPrep(readyPlayer());
    readinessScore(readyPlayer());
    expect(JSON.stringify(HOLLOWFANG_PREP)).toBe(snapshot);
  });
});
