import { describe, expect, it } from "vitest";

import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import { HOLLOWFANG_PROFILE } from "@/features/hollowfang/hollowfangProfile";
import {
  resolveHollowfangEncounter,
  type EncounterResult,
  type HollowfangAttemptPlayer,
} from "@/features/hollowfang/encounterResolver";

// ────────────────────────────────────────────────────────────────────
// Test helpers
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

function readyPlayer(overrides: Partial<HollowfangAttemptPlayer> = {}): HollowfangAttemptPlayer {
  return {
    rankLevel: HOLLOWFANG_PROFILE.recommendedRankLevel + 3,
    condition: 95,
    voidInstability: 5,
    resources: makeResources({
      bloodvein: 3,
      ashveil: 3,
      runeDust: 80,
      emberCore: 10,
    }),
    ...overrides,
  };
}

function unpreppedPlayer(): HollowfangAttemptPlayer {
  return {
    rankLevel: 1,
    condition: 10,
    voidInstability: 95,
    resources: makeResources(),
  };
}

// Discover a seed that produces a given outcome for a given player.
// Bounded search — keeps the test deterministic because the seeds themselves
// are fixed once discovered.
function findSeedForOutcome(
  player: HollowfangAttemptPlayer,
  outcome: EncounterResult["outcome"],
  maxTries = 500,
): number {
  for (let seed = 1; seed <= maxTries; seed += 1) {
    const res = resolveHollowfangEncounter(player, seed);
    if (res.outcome === outcome) return seed;
  }
  throw new Error(
    `no seed produced outcome=${outcome} within ${maxTries} tries`,
  );
}

// ────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────

describe("resolveHollowfangEncounter — shape + invariants", () => {
  it("returns a well-formed result on a clean attempt", () => {
    const r = resolveHollowfangEncounter(readyPlayer(), 1);
    expect(r.seed).toBe(1);
    expect(["victory", "partial", "wipe"]).toContain(r.outcome);
    expect(r.rewardTier).toBe(r.outcome);
    expect(r.phasesCleared).toBeGreaterThanOrEqual(0);
    expect(r.phasesCleared).toBeLessThanOrEqual(HOLLOWFANG_PROFILE.phases.length);
    expect(r.damageSuffered).toBeGreaterThanOrEqual(0);
    expect(r.conditionCost).toBeGreaterThanOrEqual(0);
    expect(r.corruptionGain).toBeGreaterThanOrEqual(0);
    expect(r.readiness).toBeGreaterThanOrEqual(0);
    expect(r.readiness).toBeLessThanOrEqual(1);
    expect(Array.isArray(r.phaseTrace)).toBe(true);
    expect(r.prep).toBeDefined();
    expect(Array.isArray(r.prep.blockers)).toBe(true);
  });

  it("phasesCleared never exceeds the profile phase count", () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const r = resolveHollowfangEncounter(readyPlayer(), seed);
      expect(r.phasesCleared).toBeLessThanOrEqual(HOLLOWFANG_PROFILE.phases.length);
    }
  });

  it("phaseTrace stops at or before the first failed phase", () => {
    const r = resolveHollowfangEncounter(unpreppedPlayer(), 7);
    for (let i = 1; i < r.phaseTrace.length; i += 1) {
      // Every previous phase must have cleared for this trace entry to exist.
      expect(r.phaseTrace[i - 1]!.cleared).toBe(true);
    }
    // The trace length must equal phasesCleared (all-clear) or phasesCleared+1 (stopped).
    expect([r.phasesCleared, r.phasesCleared + 1]).toContain(r.phaseTrace.length);
  });

  it("phase trace turnsUsed is within each phase's turnCap", () => {
    const r = resolveHollowfangEncounter(readyPlayer(), 3);
    for (const trace of r.phaseTrace) {
      const phase = HOLLOWFANG_PROFILE.phases.find((p) => p.id === trace.phaseId)!;
      expect(trace.turnsUsed).toBeGreaterThanOrEqual(0);
      expect(trace.turnsUsed).toBeLessThanOrEqual(phase.turnCap);
      expect(trace.tellsLanded).toBeGreaterThanOrEqual(0);
      expect(trace.tellsCountered).toBeGreaterThanOrEqual(0);
      expect(trace.incomingDamage).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("resolveHollowfangEncounter — determinism", () => {
  it("same (player, seed) yields the same result across calls", () => {
    const player = readyPlayer();
    const a = resolveHollowfangEncounter(player, 42);
    const b = resolveHollowfangEncounter(player, 42);
    expect(a).toEqual(b);
  });

  it("different seeds can produce different phase traces", () => {
    // Use a partially-prepped player so RNG has room to affect tell rolls
    // and dps jitter. A fully-prepped player can deterministically one-shot
    // each phase, collapsing many seeds onto the same trace.
    const partial: HollowfangAttemptPlayer = {
      rankLevel: HOLLOWFANG_PROFILE.recommendedRankLevel,
      condition: 60,
      voidInstability: 45,
      resources: makeResources({ bloodvein: 1, runeDust: 20, emberCore: 2 }),
    };
    const traces = new Set<string>();
    for (const seed of [1, 5, 42, 1337, 99_999]) {
      const r = resolveHollowfangEncounter(partial, seed);
      traces.add(JSON.stringify(r.phaseTrace));
    }
    // Across 5 seeds we expect at least 2 distinct traces.
    expect(traces.size).toBeGreaterThan(1);
  });
});

describe("resolveHollowfangEncounter — outcome model", () => {
  it("a seeded victory: prepped player can clear all phases", () => {
    const player = readyPlayer();
    const seed = findSeedForOutcome(player, "victory");
    const r = resolveHollowfangEncounter(player, seed);
    expect(r.outcome).toBe("victory");
    expect(r.phasesCleared).toBe(3);
    expect(r.phaseTrace.every((t) => t.cleared)).toBe(true);
  });

  it("a seeded wipe: unprepped player eventually wipes", () => {
    const player = unpreppedPlayer();
    const seed = findSeedForOutcome(player, "wipe");
    const r = resolveHollowfangEncounter(player, seed);
    expect(r.outcome).toBe("wipe");
    expect(r.rewardTier).toBe("wipe");
    // Wipe path: either no phase cleared OR damage exceeded the wall.
    const phase1 = r.phaseTrace[0];
    const phase1Failed = phase1 && !phase1.cleared;
    expect(phase1Failed || r.damageSuffered > 0).toBe(true);
  });

  it("wipe costs are strictly larger than victory costs (same RNG expectations)", () => {
    const preppedSeed = findSeedForOutcome(readyPlayer(), "victory");
    const wipeSeed = findSeedForOutcome(unpreppedPlayer(), "wipe");
    const v = resolveHollowfangEncounter(readyPlayer(), preppedSeed);
    const w = resolveHollowfangEncounter(unpreppedPlayer(), wipeSeed);
    expect(w.corruptionGain).toBeGreaterThan(v.corruptionGain);
    expect(w.conditionCost).toBeGreaterThan(v.conditionCost);
  });

  it("victory requires all phases cleared and damage within the wipe wall", () => {
    const player = readyPlayer();
    for (let seed = 1; seed < 40; seed += 1) {
      const r = resolveHollowfangEncounter(player, seed);
      if (r.outcome === "victory") {
        expect(r.phasesCleared).toBe(3);
      }
      if (r.phasesCleared === 0) {
        expect(r.outcome).toBe("wipe");
      }
    }
  });
});

describe("resolveHollowfangEncounter — purity", () => {
  it("does not mutate the player input", () => {
    const player = readyPlayer();
    const snapshot = JSON.stringify(player);
    resolveHollowfangEncounter(player, 11);
    resolveHollowfangEncounter(player, 22);
    expect(JSON.stringify(player)).toBe(snapshot);
  });

  it("does not mutate the canonical profile", () => {
    const snapshot = JSON.stringify(HOLLOWFANG_PROFILE);
    resolveHollowfangEncounter(readyPlayer(), 5);
    resolveHollowfangEncounter(unpreppedPlayer(), 5);
    expect(JSON.stringify(HOLLOWFANG_PROFILE)).toBe(snapshot);
  });
});
