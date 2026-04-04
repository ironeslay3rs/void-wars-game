import { describe, expect, it } from "vitest";
import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import {
  computeInstallCost,
  getExecutionalTier,
  tryInstallMinorRune,
} from "@/features/mastery/runeMasteryLogic";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";

function playerWithMastery(
  mastery: Partial<PlayerRuneMasteryState>,
  alignment: PlayerState["factionAlignment"] = "mecha",
): PlayerState {
  return {
    ...initialGameState.player,
    factionAlignment: alignment,
    runeMastery: {
      ...initialGameState.player.runeMastery,
      ...mastery,
      depthBySchool: {
        ...initialGameState.player.runeMastery.depthBySchool,
        ...mastery.depthBySchool,
      },
      minorCountBySchool: {
        ...initialGameState.player.runeMastery.minorCountBySchool,
        ...mastery.minorCountBySchool,
      },
      capacity: {
        ...initialGameState.player.runeMastery.capacity,
        ...mastery.capacity,
      },
      capacityMax: {
        ...initialGameState.player.runeMastery.capacityMax,
        ...mastery.capacityMax,
      },
    },
  };
}

describe("computeInstallCost", () => {
  it("charges primary pool only for on-path install", () => {
    expect(
      computeInstallCost({ alignment: "bio", school: "bio" }),
    ).toEqual({ blood: 2, frame: 0, resonance: 0 });
  });

  it("charges cross-pool tax for off-primary (dabble) install", () => {
    expect(
      computeInstallCost({ alignment: "bio", school: "mecha" }),
    ).toEqual({ blood: 1, frame: 3, resonance: 1 });
  });

  it("uses neutral curve when unbound", () => {
    const c = computeInstallCost({ alignment: "unbound", school: "pure" });
    expect(c.resonance).toBe(2);
    expect(c.blood + c.frame).toBe(0);
  });
});

describe("getExecutionalTier", () => {
  it("returns 0 below three minors", () => {
    const m = initialGameState.player.runeMastery;
    expect(getExecutionalTier(m, "mecha")).toBe(0);
  });

  it("returns 1 from three to four minors", () => {
    const m = playerWithMastery({
      minorCountBySchool: { bio: 0, mecha: 3, pure: 0 },
    }).runeMastery;
    expect(getExecutionalTier(m, "mecha")).toBe(1);
  });

  it("returns 2 at five or more minors", () => {
    const m = playerWithMastery({
      minorCountBySchool: { bio: 0, mecha: 5, pure: 0 },
    }).runeMastery;
    expect(getExecutionalTier(m, "mecha")).toBe(2);
  });
});

describe("tryInstallMinorRune", () => {
  it("fails when capacity cannot pay", () => {
    const p = playerWithMastery({
      capacity: { blood: 0, frame: 0, resonance: 0 },
    });
    const r = tryInstallMinorRune(p, "mecha");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toMatch(/capacity/i);
    }
  });

  it("fails at per-school minor cap", () => {
    const p = playerWithMastery({
      minorCountBySchool: { bio: 0, mecha: 6, pure: 0 },
      depthBySchool: { bio: 1, mecha: 7, pure: 1 },
      capacity: { blood: 10, frame: 10, resonance: 10 },
    });
    const r = tryInstallMinorRune(p, "mecha");
    expect(r.ok).toBe(false);
  });

  it("spends capacity and increments hybrid stacks off-primary", () => {
    const p = playerWithMastery(
      {
        minorCountBySchool: { bio: 0, mecha: 0, pure: 0 },
        hybridDrainStacks: 0,
      },
      "bio",
    );
    const r = tryInstallMinorRune(p, "mecha");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.player.runeMastery.hybridDrainStacks).toBe(1);
      expect(r.player.runeMastery.minorCountBySchool.mecha).toBe(1);
      expect(r.player.runeMastery.capacity.frame).toBe(7);
    }
  });
});
