import { describe, expect, it } from "vitest";

import {
  BIO_DEFAULT_PROFILE,
  MECHA_DEFAULT_PROFILE,
  PURE_DEFAULT_PROFILE,
  SCHOOL_DEFAULT_PROFILES,
  applyTriggerShifts,
  getDefaultProfile,
  shouldTriggerFire,
  tuneProfile,
  type BehaviorProfile,
} from "@/features/arena/behaviorProfile";

describe("SCHOOL_DEFAULT_PROFILES", () => {
  it("maps every school to its canonical default", () => {
    expect(SCHOOL_DEFAULT_PROFILES.bio).toBe(BIO_DEFAULT_PROFILE);
    expect(SCHOOL_DEFAULT_PROFILES.mecha).toBe(MECHA_DEFAULT_PROFILE);
    expect(SCHOOL_DEFAULT_PROFILES.pure).toBe(PURE_DEFAULT_PROFILE);
  });

  it("never uses the legacy Spirit label", () => {
    for (const profile of Object.values(SCHOOL_DEFAULT_PROFILES)) {
      expect(profile.school).not.toBe("spirit");
      expect(profile.label.toLowerCase()).not.toContain("spirit");
    }
  });

  it("tags every school with its canon identity keywords", () => {
    // Bio teaches through instinct — aggressive + adaptive.
    expect(BIO_DEFAULT_PROFILE.temperament.aggression).toBeGreaterThan(
      BIO_DEFAULT_PROFILE.temperament.caution,
    );
    expect(BIO_DEFAULT_PROFILE.temperament.adaptability).toBeGreaterThan(0.6);

    // Mecha teaches through comprehension — focused + systemic.
    expect(MECHA_DEFAULT_PROFILE.temperament.focus).toBeGreaterThanOrEqual(0.75);
    expect(MECHA_DEFAULT_PROFILE.priorities[0]).toBe("disrupt-setup");

    // Pure teaches through wisdom — patient + committed.
    expect(PURE_DEFAULT_PROFILE.temperament.patience).toBeGreaterThanOrEqual(
      0.8,
    );
    expect(PURE_DEFAULT_PROFILE.temperament.focus).toBeGreaterThanOrEqual(0.85);
  });

  it("keeps all temperament axes in [0, 1]", () => {
    for (const profile of Object.values(SCHOOL_DEFAULT_PROFILES)) {
      for (const value of Object.values(profile.temperament)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("getDefaultProfile", () => {
  it("returns a deep copy that doesn't alias the canonical object", () => {
    const a = getDefaultProfile("bio");
    const b = getDefaultProfile("bio");
    expect(a).not.toBe(BIO_DEFAULT_PROFILE);
    expect(a.temperament).not.toBe(BIO_DEFAULT_PROFILE.temperament);
    expect(a.priorities).not.toBe(BIO_DEFAULT_PROFILE.priorities);
    expect(a.triggers).not.toBe(BIO_DEFAULT_PROFILE.triggers);
    // separate copies are independent
    expect(a.triggers).not.toBe(b.triggers);
  });

  it("survives local mutation without touching the canon", () => {
    const copy = getDefaultProfile("mecha");
    copy.temperament.aggression = 0.01;
    copy.priorities.push("pressure-steady");
    copy.triggers[0]!.aggressionShift = 99;

    expect(MECHA_DEFAULT_PROFILE.temperament.aggression).toBe(0.5);
    expect(MECHA_DEFAULT_PROFILE.priorities).toHaveLength(6);
    expect(MECHA_DEFAULT_PROFILE.triggers[0]!.aggressionShift).toBe(-0.1);
  });

  it("preserves school + label across all three schools", () => {
    expect(getDefaultProfile("bio").school).toBe("bio");
    expect(getDefaultProfile("mecha").school).toBe("mecha");
    expect(getDefaultProfile("pure").school).toBe("pure");
  });
});

describe("tuneProfile", () => {
  it("does not mutate the input profile", () => {
    const base = getDefaultProfile("pure");
    const before = JSON.stringify(base);
    const tuned = tuneProfile(base, { aggression: 0.99, patience: 0.1 });
    expect(JSON.stringify(base)).toBe(before);
    expect(tuned).not.toBe(base);
    expect(tuned.temperament).not.toBe(base.temperament);
  });

  it("applies overrides and leaves untouched axes intact", () => {
    const base = getDefaultProfile("bio");
    const tuned = tuneProfile(base, { caution: 0.8 });
    expect(tuned.temperament.caution).toBe(0.8);
    expect(tuned.temperament.aggression).toBe(base.temperament.aggression);
    expect(tuned.temperament.focus).toBe(base.temperament.focus);
  });

  it("clamps out-of-range overrides into [0, 1]", () => {
    const base = getDefaultProfile("mecha");
    const tuned = tuneProfile(base, {
      aggression: 5,
      caution: -1,
      patience: 1.5,
      focus: -0.3,
      adaptability: 2,
    });
    expect(tuned.temperament.aggression).toBe(1);
    expect(tuned.temperament.caution).toBe(0);
    expect(tuned.temperament.patience).toBe(1);
    expect(tuned.temperament.focus).toBe(0);
    expect(tuned.temperament.adaptability).toBe(1);
  });

  it("copies priorities and triggers so caller mutation is safe", () => {
    const base = getDefaultProfile("bio");
    const tuned = tuneProfile(base, {});
    const baseLen = base.priorities.length;
    const baseFirstShift = base.triggers[0]!.aggressionShift;
    tuned.priorities.push("stall-cooldowns");
    tuned.triggers[0]!.aggressionShift = 99;
    expect(base.priorities).toHaveLength(baseLen);
    expect(base.triggers[0]!.aggressionShift).toBe(baseFirstShift);
  });
});

describe("applyTriggerShifts", () => {
  it("returns unchanged weights when no triggers fire", () => {
    const base = getDefaultProfile("pure").temperament;
    const out = applyTriggerShifts(base, []);
    expect(out.aggression).toBe(base.aggression);
    expect(out.caution).toBe(base.caution);
  });

  it("clamps shifts into [0, 1]", () => {
    const base = getDefaultProfile("bio").temperament;
    const out = applyTriggerShifts(base, [
      { id: "foe-hp-below-30", aggressionShift: 5, cautionShift: -5 },
    ]);
    expect(out.aggression).toBe(1);
    expect(out.caution).toBe(0);
  });
});

describe("shouldTriggerFire", () => {
  const ctx = {
    selfHpPct: 0.5,
    foeHpPct: 0.5,
    foeTelegraphing: false,
    turnsSinceLastHit: 0,
  };

  it("fires self-hp-below-40 only under threshold", () => {
    expect(shouldTriggerFire("self-hp-below-40", { ...ctx, selfHpPct: 0.39 })).toBe(true);
    expect(shouldTriggerFire("self-hp-below-40", { ...ctx, selfHpPct: 0.4 })).toBe(false);
  });

  it("fires foe-hp-below-30 under threshold only", () => {
    expect(shouldTriggerFire("foe-hp-below-30", { ...ctx, foeHpPct: 0.25 })).toBe(true);
    expect(shouldTriggerFire("foe-hp-below-30", { ...ctx, foeHpPct: 0.3 })).toBe(false);
  });

  it("fires stall trigger after 3+ stalled turns", () => {
    expect(shouldTriggerFire("stall-over-threshold", { ...ctx, turnsSinceLastHit: 3 })).toBe(true);
    expect(shouldTriggerFire("stall-over-threshold", { ...ctx, turnsSinceLastHit: 2 })).toBe(false);
  });

  it("fires burst-telegraphed when foe telegraphs", () => {
    expect(
      shouldTriggerFire("foe-burst-telegraphed", { ...ctx, foeTelegraphing: true }),
    ).toBe(true);
    expect(
      shouldTriggerFire("foe-burst-telegraphed", { ...ctx, foeTelegraphing: false }),
    ).toBe(false);
  });
});

describe("profile typing", () => {
  it("BehaviorProfile exposes the expected fields", () => {
    const p: BehaviorProfile = getDefaultProfile("bio");
    expect(p).toHaveProperty("school");
    expect(p).toHaveProperty("label");
    expect(p).toHaveProperty("temperament");
    expect(p).toHaveProperty("priorities");
    expect(p).toHaveProperty("triggers");
  });
});
