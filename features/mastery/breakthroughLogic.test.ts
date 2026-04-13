import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  BREAKTHROUGH_BASE_SUCCESS_PCT,
  BREAKTHROUGH_THRESHOLDS,
  attemptBreakthrough,
  canAttemptBreakthrough,
  getApexMaterialForSchool,
  getBreakthroughRequirement,
  rollBreakthroughOutcome,
} from "@/features/mastery/breakthroughLogic";
import { RUNE_DEPTH_MAX } from "@/features/mastery/runeMasteryLogic";

// Seeds determined empirically against the module's seededUnit():
//   seed 1 -> 0.2704 -> SUCCESS
//   seed 3 -> 0.8111 -> FAIL
const SUCCESS_SEED = 1;
const FAIL_SEED = 3;

function loadedPlayer(
  school: RuneSchool,
  overrides: Partial<PlayerRuneMasteryState> = {},
  resourcesOverride: Partial<PlayerState["resources"]> = {},
): PlayerState {
  return {
    ...initialGameState.player,
    factionAlignment: school,
    resources: {
      ...initialGameState.player.resources,
      bloodvein: 10,
      ironHeart: 10,
      ashveil: 10,
      ...resourcesOverride,
    },
    runeMastery: {
      ...initialGameState.player.runeMastery,
      ...overrides,
      depthBySchool: {
        ...initialGameState.player.runeMastery.depthBySchool,
        ...overrides.depthBySchool,
      },
      capacity: {
        blood: 10,
        frame: 10,
        resonance: 10,
        ...overrides.capacity,
      },
      capacityMax: {
        blood: 10,
        frame: 10,
        resonance: 10,
        ...overrides.capacityMax,
      },
    },
  };
}

describe("constants + canon invariants", () => {
  it("exposes the three-wall canon [3, 5, 7]", () => {
    expect(Array.from(BREAKTHROUGH_THRESHOLDS)).toEqual([3, 5, 7]);
  });

  it("base success sits at 70%", () => {
    expect(BREAKTHROUGH_BASE_SUCCESS_PCT).toBe(70);
  });
});

describe("getApexMaterialForSchool", () => {
  it("maps bio -> bloodvein", () => {
    expect(getApexMaterialForSchool("bio")).toBe("bloodvein");
  });

  it("maps mecha -> ironHeart", () => {
    expect(getApexMaterialForSchool("mecha")).toBe("ironHeart");
  });

  it("maps pure -> ashveil (Pure, never Spirit)", () => {
    expect(getApexMaterialForSchool("pure")).toBe("ashveil");
  });
});

describe("getBreakthroughRequirement", () => {
  it("returns null when promotion does NOT cross a wall", () => {
    // fromDepth 1 -> target 2 : not in [3,5,7]
    expect(getBreakthroughRequirement("bio", 1)).toBeNull();
    expect(getBreakthroughRequirement("mecha", 3)).toBeNull(); // target 4
  });

  it("returns apex + headroom cost for each wall", () => {
    const w3 = getBreakthroughRequirement("pure", 2);
    expect(w3).toEqual({
      apexMaterial: "ashveil",
      apexAmount: 1,
      capacityHeadroomNeeded: 2,
    });
    const w5 = getBreakthroughRequirement("mecha", 4);
    expect(w5).toMatchObject({
      apexMaterial: "ironHeart",
      apexAmount: 2,
      capacityHeadroomNeeded: 3,
    });
    const w7 = getBreakthroughRequirement("bio", 6);
    expect(w7).toMatchObject({
      apexMaterial: "bloodvein",
      apexAmount: 3,
      capacityHeadroomNeeded: 4,
    });
  });

  it("returns null past RUNE_DEPTH_MAX", () => {
    expect(getBreakthroughRequirement("bio", RUNE_DEPTH_MAX)).toBeNull();
  });
});

describe("canAttemptBreakthrough", () => {
  it("rejects when current depth does not match fromDepth", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 1, mecha: 1, pure: 1 },
    });
    const r = canAttemptBreakthrough(p, "bio", 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/depth/i);
  });

  it("rejects when no wall sits at the target depth", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 1, mecha: 1, pure: 1 },
    });
    const r = canAttemptBreakthrough(p, "bio", 1); // target 2, no wall
    expect(r.ok).toBe(false);
  });

  it("rejects when apex material is insufficient", () => {
    const p = loadedPlayer(
      "bio",
      { depthBySchool: { bio: 2, mecha: 1, pure: 1 } },
      { bloodvein: 0 },
    );
    const r = canAttemptBreakthrough(p, "bio", 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/bloodvein/);
  });

  it("rejects when capacity headroom is insufficient", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 2, mecha: 1, pure: 1 },
      capacity: { blood: 1, frame: 10, resonance: 10 },
    });
    const r = canAttemptBreakthrough(p, "bio", 2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/capacity/i);
  });

  it("approves when wall, apex and headroom all align", () => {
    const p = loadedPlayer("pure", {
      depthBySchool: { bio: 1, mecha: 1, pure: 2 },
    });
    expect(canAttemptBreakthrough(p, "pure", 2)).toEqual({ ok: true });
  });

  it("rejects at RUNE_DEPTH_MAX", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: RUNE_DEPTH_MAX, mecha: 1, pure: 1 },
    });
    const r = canAttemptBreakthrough(p, "bio", RUNE_DEPTH_MAX);
    expect(r.ok).toBe(false);
  });
});

describe("rollBreakthroughOutcome — deterministic seeds", () => {
  it("success seed resolves to success", () => {
    expect(rollBreakthroughOutcome(SUCCESS_SEED).success).toBe(true);
  });

  it("fail seed resolves to failure", () => {
    expect(rollBreakthroughOutcome(FAIL_SEED).success).toBe(false);
  });

  it("same seed always yields the same outcome (pure)", () => {
    const a = rollBreakthroughOutcome(42);
    const b = rollBreakthroughOutcome(42);
    expect(a).toEqual(b);
  });

  it("handles the zero-seed fallback path without throwing", () => {
    const out = rollBreakthroughOutcome(0);
    expect(typeof out.success).toBe("boolean");
  });
});

describe("attemptBreakthrough — success", () => {
  it("consumes full apex and advances depth", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 2, mecha: 1, pure: 1 },
    });
    const r = attemptBreakthrough(p, "bio", 2, SUCCESS_SEED);
    expect(r.outcome).toBe("success");
    expect(r.apexConsumed).toBe(1);
    expect(r.player.runeMastery.depthBySchool.bio).toBe(3);
    expect(r.player.resources.bloodvein).toBe(9);
  });

  it("returns a new PlayerState (no mutation of input)", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 2, mecha: 1, pure: 1 },
    });
    const r = attemptBreakthrough(p, "bio", 2, SUCCESS_SEED);
    expect(r.player).not.toBe(p);
    expect(p.runeMastery.depthBySchool.bio).toBe(2);
    expect(p.resources.bloodvein).toBe(10);
  });

  it("clamps depth at RUNE_DEPTH_MAX on success", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 6, mecha: 1, pure: 1 },
    });
    const r = attemptBreakthrough(p, "bio", 6, SUCCESS_SEED);
    expect(r.outcome).toBe("success");
    expect(r.player.runeMastery.depthBySchool.bio).toBe(RUNE_DEPTH_MAX);
  });
});

describe("attemptBreakthrough — failure", () => {
  it("leaves depth unchanged and consumes half-apex (min 1) at wall 3", () => {
    const p = loadedPlayer("mecha", {
      depthBySchool: { bio: 1, mecha: 2, pure: 1 },
    });
    const r = attemptBreakthrough(p, "mecha", 2, FAIL_SEED);
    expect(r.outcome).toBe("fail");
    // apexAmount at wall 3 = 1 -> floor(1/2)=0 -> clamped to 1
    expect(r.apexConsumed).toBe(1);
    expect(r.player.runeMastery.depthBySchool.mecha).toBe(2);
    expect(r.player.resources.ironHeart).toBe(9);
  });

  it("consumes floor(apexAmount/2) on higher walls (wall 5 -> 1)", () => {
    const p = loadedPlayer("mecha", {
      depthBySchool: { bio: 1, mecha: 4, pure: 1 },
    });
    const r = attemptBreakthrough(p, "mecha", 4, FAIL_SEED);
    expect(r.outcome).toBe("fail");
    expect(r.apexConsumed).toBe(1); // floor(2/2) = 1
    expect(r.player.resources.ironHeart).toBe(9);
  });

  it("consumes floor(apexAmount/2) on wall 7 -> 1 (floor(3/2))", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 6, mecha: 1, pure: 1 },
    });
    const r = attemptBreakthrough(p, "bio", 6, FAIL_SEED);
    expect(r.outcome).toBe("fail");
    expect(r.apexConsumed).toBe(1);
    expect(r.player.runeMastery.depthBySchool.bio).toBe(6);
  });
});

describe("attemptBreakthrough — gated failures", () => {
  it("returns input unchanged + outcome 'fail' with 0 apex consumed when gate fails", () => {
    const p = loadedPlayer(
      "bio",
      { depthBySchool: { bio: 2, mecha: 1, pure: 1 } },
      { bloodvein: 0 },
    );
    const r = attemptBreakthrough(p, "bio", 2, SUCCESS_SEED);
    expect(r.outcome).toBe("fail");
    expect(r.apexConsumed).toBe(0);
    expect(r.player).toBe(p);
  });

  it("returns fail + 0 apex when requested depth has no wall", () => {
    const p = loadedPlayer("bio", {
      depthBySchool: { bio: 1, mecha: 1, pure: 1 },
    });
    const r = attemptBreakthrough(p, "bio", 1, SUCCESS_SEED);
    expect(r.outcome).toBe("fail");
    expect(r.apexConsumed).toBe(0);
  });
});
