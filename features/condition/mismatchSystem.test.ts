import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import {
  classifyInstallMismatch,
  empireLabel,
  getInstallMismatchPenalty,
  getLoadoutMismatchDmgMult,
  getLoadoutMismatchReport,
} from "@/features/condition/mismatchSystem";

type MismatchPlayer = Pick<PlayerState, "factionAlignment" | "runeMastery">;

function mkPlayer(
  alignment: FactionAlignment,
  depths: Partial<Record<RuneSchool, number>> = {},
): MismatchPlayer {
  const base = initialGameState.player;
  return {
    factionAlignment: alignment,
    runeMastery: {
      ...base.runeMastery,
      depthBySchool: {
        ...base.runeMastery.depthBySchool,
        bio: depths.bio ?? 0,
        mecha: depths.mecha ?? 0,
        pure: depths.pure ?? 0,
      },
    },
  };
}

describe("empireLabel — canonical empire names", () => {
  it("bio maps to Verdant Coil", () => {
    expect(empireLabel("bio")).toBe("Verdant Coil");
  });

  it("mecha maps to Chrome Synod", () => {
    expect(empireLabel("mecha")).toBe("Chrome Synod");
  });

  it("pure maps to Ember Vault (Pure, never Spirit)", () => {
    expect(empireLabel("pure")).toBe("Ember Vault");
  });
});

describe("classifyInstallMismatch", () => {
  it("returns 'none' for unbound alignment regardless of school", () => {
    expect(classifyInstallMismatch("unbound", "bio")).toBe("none");
    expect(classifyInstallMismatch("unbound", "mecha")).toBe("none");
    expect(classifyInstallMismatch("unbound", "pure")).toBe("none");
  });

  it("returns 'none' when installing into the primary school", () => {
    expect(classifyInstallMismatch("bio", "bio")).toBe("none");
    expect(classifyInstallMismatch("mecha", "mecha")).toBe("none");
    expect(classifyInstallMismatch("pure", "pure")).toBe("none");
  });

  it("returns 'major' for Bio ↔ Mecha opposed pairs", () => {
    expect(classifyInstallMismatch("bio", "mecha")).toBe("major");
    expect(classifyInstallMismatch("mecha", "bio")).toBe("major");
  });

  it("returns 'minor' for Pure-adjacent mismatches", () => {
    expect(classifyInstallMismatch("bio", "pure")).toBe("minor");
    expect(classifyInstallMismatch("mecha", "pure")).toBe("minor");
    expect(classifyInstallMismatch("pure", "bio")).toBe("minor");
    expect(classifyInstallMismatch("pure", "mecha")).toBe("minor");
  });
});

describe("getInstallMismatchPenalty", () => {
  it("returns neutral penalty for aligned installs", () => {
    const p = getInstallMismatchPenalty("bio", "bio");
    expect(p.severity).toBe("none");
    expect(p.dmgMult).toBe(1);
    expect(p.craftSuccessMult).toBe(1);
    expect(p.corruptionPerInstall).toBe(0);
    expect(p.label).toBe("Aligned");
  });

  it("minor hybrid tax has meaningful but recoverable cost", () => {
    const p = getInstallMismatchPenalty("bio", "pure");
    expect(p.severity).toBe("minor");
    expect(p.dmgMult).toBeLessThan(1);
    expect(p.craftSuccessMult).toBeLessThan(1);
    expect(p.corruptionPerInstall).toBeGreaterThan(0);
    expect(p.label).toContain("Ember Vault");
  });

  it("major opposed tax is strictly harsher than minor", () => {
    const minor = getInstallMismatchPenalty("bio", "pure");
    const major = getInstallMismatchPenalty("bio", "mecha");
    expect(major.severity).toBe("major");
    expect(major.dmgMult).toBeLessThan(minor.dmgMult);
    expect(major.craftSuccessMult).toBeLessThan(minor.craftSuccessMult);
    expect(major.corruptionPerInstall).toBeGreaterThan(minor.corruptionPerInstall);
    expect(major.label).toContain("Chrome Synod");
  });

  it("unbound players incur no penalty", () => {
    const p = getInstallMismatchPenalty("unbound", "mecha");
    expect(p.severity).toBe("none");
    expect(p.dmgMult).toBe(1);
  });
});

describe("getLoadoutMismatchReport", () => {
  it("pristine aligned loadout has no pressure", () => {
    const p = mkPlayer("bio", { bio: 3 });
    const r = getLoadoutMismatchReport(p);
    expect(r.hybridDepth).toBe(0);
    expect(r.opposedDepth).toBe(0);
    expect(r.penalty.severity).toBe("none");
    expect(r.penalty.dmgMult).toBe(1);
  });

  it("counts off-school depth as hybrid pressure", () => {
    const p = mkPlayer("bio", { bio: 2, pure: 2 });
    const r = getLoadoutMismatchReport(p);
    expect(r.hybridDepth).toBe(2);
    expect(r.opposedDepth).toBe(0);
    expect(r.penalty.severity).toBe("minor");
    expect(r.penalty.dmgMult).toBeLessThan(1);
  });

  it("counts opposed-school depth with 2× pressure weight", () => {
    const mixed = mkPlayer("bio", { bio: 1, mecha: 1 });
    const hybrid = mkPlayer("bio", { bio: 1, pure: 1 });
    const rMixed = getLoadoutMismatchReport(mixed);
    const rHybrid = getLoadoutMismatchReport(hybrid);
    expect(rMixed.opposedDepth).toBe(1);
    expect(rMixed.penalty.severity).toBe("major");
    expect(rMixed.penalty.dmgMult).toBeLessThan(rHybrid.penalty.dmgMult);
  });

  it("clamps severe loadouts at the floor (0.7 dmgMult)", () => {
    const p = mkPlayer("bio", { bio: 0, mecha: 10, pure: 10 });
    const r = getLoadoutMismatchReport(p);
    expect(r.penalty.dmgMult).toBeGreaterThanOrEqual(0.7);
    expect(r.penalty.craftSuccessMult).toBeGreaterThanOrEqual(0.7);
  });

  it("unbound player has no mismatch penalty (null alignment)", () => {
    const p = mkPlayer("unbound", { bio: 3, mecha: 3, pure: 3 });
    const r = getLoadoutMismatchReport(p);
    expect(r.hybridDepth).toBe(0);
    expect(r.opposedDepth).toBe(0);
    expect(r.penalty.severity).toBe("none");
  });

  it("label names the empires when severe", () => {
    const p = mkPlayer("mecha", { bio: 2, pure: 1 });
    const r = getLoadoutMismatchReport(p);
    expect(r.penalty.severity).toBe("major");
    expect(r.penalty.label).toMatch(/opposed/i);
  });

  it("does not mutate the player input", () => {
    const p = mkPlayer("bio", { bio: 2, mecha: 2, pure: 1 });
    const snapshotDepth = { ...p.runeMastery.depthBySchool };
    getLoadoutMismatchReport(p);
    expect(p.runeMastery.depthBySchool).toEqual(snapshotDepth);
  });
});

describe("getLoadoutMismatchDmgMult", () => {
  it("matches the report penalty exactly", () => {
    const p = mkPlayer("mecha", { mecha: 2, pure: 2 });
    const r = getLoadoutMismatchReport(p);
    expect(getLoadoutMismatchDmgMult(p)).toBe(r.penalty.dmgMult);
  });

  it("returns 1 when the loadout is aligned", () => {
    const p = mkPlayer("pure", { pure: 4 });
    expect(getLoadoutMismatchDmgMult(p)).toBe(1);
  });

  it("returns the clamped floor for extreme mismatches", () => {
    const p = mkPlayer("pure", { bio: 10, mecha: 10 });
    expect(getLoadoutMismatchDmgMult(p)).toBeGreaterThanOrEqual(0.7);
    expect(getLoadoutMismatchDmgMult(p)).toBeLessThan(1);
  });
});
