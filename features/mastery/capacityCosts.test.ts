import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import {
  DEEP_INSTALL_DEPTH_THRESHOLD,
  DEEP_INSTALL_SURCHARGE,
  canAffordCapacityCost,
  computeCapacityCost,
  getCapacityAffordability,
  getCapacitySnapshots,
  isHybridInstall,
  totalPlanCost,
} from "@/features/mastery/capacityCosts";

function masteryWith(
  patch: Partial<PlayerRuneMasteryState>,
): PlayerRuneMasteryState {
  return {
    ...initialGameState.player.runeMastery,
    ...patch,
    capacity: {
      ...initialGameState.player.runeMastery.capacity,
      ...patch.capacity,
    },
    capacityMax: {
      ...initialGameState.player.runeMastery.capacityMax,
      ...patch.capacityMax,
    },
  };
}

function playerWith(
  alignment: PlayerState["factionAlignment"],
  masteryPatch: Partial<PlayerRuneMasteryState> = {},
): PlayerState {
  return {
    ...initialGameState.player,
    factionAlignment: alignment,
    runeMastery: masteryWith(masteryPatch),
  };
}

describe("computeCapacityCost — base (no depth)", () => {
  it("primary on-path install charges +2 primary pool only", () => {
    expect(
      computeCapacityCost({ alignment: "bio", school: "bio" }),
    ).toEqual({ blood: 2, frame: 0, resonance: 0 });
    expect(
      computeCapacityCost({ alignment: "mecha", school: "mecha" }),
    ).toEqual({ blood: 0, frame: 2, resonance: 0 });
    expect(
      computeCapacityCost({ alignment: "pure", school: "pure" }),
    ).toEqual({ blood: 0, frame: 0, resonance: 2 });
  });

  it("hybrid off-path install charges +3 target pool and +1 to each other", () => {
    expect(
      computeCapacityCost({ alignment: "bio", school: "mecha" }),
    ).toEqual({ blood: 1, frame: 3, resonance: 1 });
    expect(
      computeCapacityCost({ alignment: "pure", school: "bio" }),
    ).toEqual({ blood: 3, frame: 1, resonance: 1 });
  });

  it("unbound alignment treats every install as neutral (no cross-pool tax)", () => {
    const c = computeCapacityCost({ alignment: "unbound", school: "pure" });
    expect(c.resonance).toBe(2);
    expect(c.blood + c.frame).toBe(0);
  });
});

describe("computeCapacityCost — depth surcharge", () => {
  it("does NOT apply surcharge below threshold", () => {
    const c = computeCapacityCost({
      alignment: "bio",
      school: "bio",
      currentDepth: DEEP_INSTALL_DEPTH_THRESHOLD - 1,
    });
    expect(c).toEqual({ blood: 2, frame: 0, resonance: 0 });
  });

  it("applies +1 primary pool surcharge at the threshold exactly", () => {
    const c = computeCapacityCost({
      alignment: "bio",
      school: "bio",
      currentDepth: DEEP_INSTALL_DEPTH_THRESHOLD,
    });
    expect(c.blood).toBe(2 + DEEP_INSTALL_SURCHARGE);
  });

  it("surcharge targets the INSTALL school pool, even on hybrid", () => {
    const c = computeCapacityCost({
      alignment: "bio",
      school: "mecha",
      currentDepth: DEEP_INSTALL_DEPTH_THRESHOLD,
    });
    // hybrid base: blood 1 / frame 3 / resonance 1, +1 frame (install school = mecha)
    expect(c).toEqual({ blood: 1, frame: 3 + DEEP_INSTALL_SURCHARGE, resonance: 1 });
  });

  it("omitting currentDepth skips surcharge regardless of depth semantics", () => {
    const a = computeCapacityCost({ alignment: "pure", school: "pure" });
    const b = computeCapacityCost({
      alignment: "pure",
      school: "pure",
      currentDepth: 0,
    });
    expect(a).toEqual(b);
  });
});

describe("isHybridInstall", () => {
  it("false when install school matches primary", () => {
    expect(isHybridInstall("bio", "bio")).toBe(false);
  });

  it("true when install school differs from primary", () => {
    expect(isHybridInstall("bio", "mecha")).toBe(true);
  });

  it("unbound primary (null) returns false — no primary to deviate from", () => {
    expect(isHybridInstall("unbound", "pure")).toBe(false);
  });
});

describe("getCapacityAffordability", () => {
  it("reports hasCapacity true with zero shortfall when pools cover cost", () => {
    const m = masteryWith({
      capacity: { blood: 10, frame: 10, resonance: 10 },
    });
    const r = getCapacityAffordability(m, {
      alignment: "bio",
      school: "bio",
    });
    expect(r.hasCapacity).toBe(true);
    expect(r.shortfall).toEqual({ blood: 0, frame: 0, resonance: 0 });
    expect(r.cost.blood).toBe(2);
  });

  it("reports exact per-pool deficit when pools cannot pay", () => {
    const m = masteryWith({
      capacity: { blood: 0, frame: 2, resonance: 0 },
    });
    // hybrid into mecha: blood 1 / frame 3 / resonance 1
    const r = getCapacityAffordability(m, {
      alignment: "bio",
      school: "mecha",
    });
    expect(r.hasCapacity).toBe(false);
    expect(r.shortfall).toEqual({ blood: 1, frame: 1, resonance: 1 });
  });

  it("folds depth surcharge into affordability", () => {
    const m = masteryWith({
      capacity: { blood: 2, frame: 0, resonance: 0 },
    });
    const r = getCapacityAffordability(m, {
      alignment: "bio",
      school: "bio",
      currentDepth: DEEP_INSTALL_DEPTH_THRESHOLD,
    });
    expect(r.cost.blood).toBe(3);
    expect(r.hasCapacity).toBe(false);
    expect(r.shortfall.blood).toBe(1);
  });
});

describe("canAffordCapacityCost (re-exported)", () => {
  it("returns true when capacity >= cost on every pool", () => {
    expect(
      canAffordCapacityCost(
        { blood: 2, frame: 0, resonance: 0 },
        { blood: 2, frame: 0, resonance: 0 },
      ),
    ).toBe(true);
  });

  it("returns false when any pool is short", () => {
    expect(
      canAffordCapacityCost(
        { blood: 1, frame: 10, resonance: 10 },
        { blood: 2, frame: 0, resonance: 0 },
      ),
    ).toBe(false);
  });
});

describe("getCapacitySnapshots", () => {
  it("returns one snapshot per pool in blood/frame/resonance order", () => {
    const snaps = getCapacitySnapshots(initialGameState.player);
    expect(snaps.map((s) => s.pool)).toEqual(["blood", "frame", "resonance"]);
  });

  it("headroom = max - current (fresh player is fully stocked)", () => {
    const snaps = getCapacitySnapshots(initialGameState.player);
    for (const s of snaps) {
      expect(s.headroom).toBe(s.max - s.current);
      expect(s.headroom).toBeGreaterThanOrEqual(0);
    }
  });

  it("spentPct is 0 for a pristine player", () => {
    const snaps = getCapacitySnapshots(initialGameState.player);
    expect(snaps.every((s) => s.spentPct === 0)).toBe(true);
  });

  it("spentPct tracks used capacity when partially drained", () => {
    const p = playerWith("bio", {
      capacity: { blood: 5, frame: 10, resonance: 10 },
    });
    const snaps = getCapacitySnapshots(p);
    const blood = snaps.find((s) => s.pool === "blood")!;
    expect(blood.spentPct).toBe(50);
  });
});

describe("totalPlanCost", () => {
  it("sums a single-step plan identically to computeCapacityCost", () => {
    const plan = [{ school: "bio" as const, startingDepth: 1 }];
    expect(totalPlanCost("bio", plan)).toEqual({
      blood: 2,
      frame: 0,
      resonance: 0,
    });
  });

  it("applies depth surcharge from the first step past threshold", () => {
    const plan = [
      { school: "bio" as const, startingDepth: DEEP_INSTALL_DEPTH_THRESHOLD },
    ];
    expect(totalPlanCost("bio", plan)).toEqual({
      blood: 2 + DEEP_INSTALL_SURCHARGE,
      frame: 0,
      resonance: 0,
    });
  });

  it("increments simulated depth per same-school step", () => {
    // first step at depth 3 (no surcharge), second step at simulated depth 4 -> surcharge hits.
    const plan = [
      { school: "bio" as const, startingDepth: 3 },
      { school: "bio" as const, startingDepth: 3 },
    ];
    const total = totalPlanCost("bio", plan);
    // step 1: {blood:2} | step 2: {blood:2+1}
    expect(total.blood).toBe(2 + (2 + DEEP_INSTALL_SURCHARGE));
  });

  it("tracks depth independently per school", () => {
    const plan = [
      { school: "bio" as const, startingDepth: 1 },
      { school: "mecha" as const, startingDepth: 1 },
    ];
    // primary bio: blood+2; hybrid mecha from a bio player: blood+1, frame+3, resonance+1
    expect(totalPlanCost("bio", plan)).toEqual({
      blood: 3,
      frame: 3,
      resonance: 1,
    });
  });

  it("empty plan costs nothing", () => {
    expect(totalPlanCost("bio", [])).toEqual({
      blood: 0,
      frame: 0,
      resonance: 0,
    });
  });
});
