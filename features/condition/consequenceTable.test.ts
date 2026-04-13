import { describe, expect, it } from "vitest";

import {
  CONDITION_TIER_BREAKS,
  CORRUPTION_TIER_BREAKS,
  conditionTier,
  corruptionTier,
  getCombatDebuffsFromCondition,
  getConsequenceSnapshot,
  getCraftingInstabilityFromCorruption,
} from "@/features/condition/consequenceTable";

type P = { condition: number; voidInstability: number };

function player(condition: number, voidInstability: number): P {
  return { condition, voidInstability };
}

describe("tier break constants", () => {
  it("follow the 70 / 50 / 30 / 10 canon thresholds", () => {
    expect(CONDITION_TIER_BREAKS).toEqual({
      wear: 70,
      strain: 50,
      danger: 30,
      critical: 10,
    });
    expect(CORRUPTION_TIER_BREAKS).toEqual({
      wear: 70,
      strain: 50,
      danger: 30,
      critical: 10,
    });
  });
});

describe("conditionTier — low = bad", () => {
  it("returns 'none' above the wear threshold", () => {
    expect(conditionTier(100)).toBe("none");
    expect(conditionTier(71)).toBe("none");
  });

  it("lands on 'wear' exactly at the wear boundary (<=70)", () => {
    expect(conditionTier(70)).toBe("wear");
  });

  it("lands on 'strain' exactly at the strain boundary (<=50)", () => {
    expect(conditionTier(51)).toBe("wear");
    expect(conditionTier(50)).toBe("strain");
  });

  it("lands on 'danger' exactly at the danger boundary (<=30)", () => {
    expect(conditionTier(31)).toBe("strain");
    expect(conditionTier(30)).toBe("danger");
  });

  it("lands on 'critical' exactly at the critical boundary (<=10)", () => {
    expect(conditionTier(11)).toBe("danger");
    expect(conditionTier(10)).toBe("critical");
    expect(conditionTier(0)).toBe("critical");
  });
});

describe("corruptionTier — high = bad", () => {
  it("returns 'none' below the wear threshold (<30)", () => {
    expect(corruptionTier(0)).toBe("none");
    expect(corruptionTier(29)).toBe("none");
  });

  it("lands on 'wear' exactly at 30 (>=30)", () => {
    expect(corruptionTier(30)).toBe("wear");
    expect(corruptionTier(49)).toBe("wear");
  });

  it("lands on 'strain' exactly at 50 (>=50)", () => {
    expect(corruptionTier(50)).toBe("strain");
    expect(corruptionTier(69)).toBe("strain");
  });

  it("lands on 'danger' exactly at 70 (>=70)", () => {
    expect(corruptionTier(70)).toBe("danger");
    expect(corruptionTier(89)).toBe("danger");
  });

  it("lands on 'critical' at 90+", () => {
    expect(corruptionTier(90)).toBe("critical");
    expect(corruptionTier(100)).toBe("critical");
  });
});

describe("getCombatDebuffsFromCondition — monotonicity (worse → worse)", () => {
  it("healthy, clean player has no combat penalty", () => {
    const d = getCombatDebuffsFromCondition(player(100, 0));
    expect(d.dmgMult).toBe(1);
    expect(d.hitMult).toBe(1);
    expect(d.takeMult).toBe(1);
    expect(d.critChancePenalty).toBe(0);
    expect(d.reasons).toEqual([]);
  });

  it("dmgMult is monotonically non-increasing as condition worsens", () => {
    const a = getCombatDebuffsFromCondition(player(100, 0)).dmgMult;
    const b = getCombatDebuffsFromCondition(player(70, 0)).dmgMult;
    const c = getCombatDebuffsFromCondition(player(50, 0)).dmgMult;
    const d = getCombatDebuffsFromCondition(player(30, 0)).dmgMult;
    const e = getCombatDebuffsFromCondition(player(10, 0)).dmgMult;
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
    expect(c).toBeGreaterThanOrEqual(d);
    expect(d).toBeGreaterThanOrEqual(e);
    expect(e).toBeLessThan(1);
  });

  it("takeMult is monotonically non-decreasing as condition worsens", () => {
    const a = getCombatDebuffsFromCondition(player(100, 0)).takeMult;
    const b = getCombatDebuffsFromCondition(player(70, 0)).takeMult;
    const c = getCombatDebuffsFromCondition(player(50, 0)).takeMult;
    const d = getCombatDebuffsFromCondition(player(30, 0)).takeMult;
    const e = getCombatDebuffsFromCondition(player(10, 0)).takeMult;
    expect(a).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(c);
    expect(c).toBeLessThanOrEqual(d);
    expect(d).toBeLessThanOrEqual(e);
  });

  it("corruption axis independently compounds the penalty", () => {
    const clean = getCombatDebuffsFromCondition(player(100, 0));
    const tainted = getCombatDebuffsFromCondition(player(100, 95));
    expect(tainted.dmgMult).toBeLessThan(clean.dmgMult);
    expect(tainted.takeMult).toBeGreaterThan(clean.takeMult);
    expect(tainted.critChancePenalty).toBeGreaterThan(clean.critChancePenalty);
  });

  it("stacks condition + corruption multiplicatively", () => {
    const both = getCombatDebuffsFromCondition(player(10, 95));
    expect(both.dmgMult).toBeLessThan(0.65);
    expect(both.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("caps critChancePenalty at 0.5 so total annihilation is avoided", () => {
    const worst = getCombatDebuffsFromCondition(player(0, 100));
    expect(worst.critChancePenalty).toBeLessThanOrEqual(0.5);
  });

  it("does not mutate the input", () => {
    const p = player(42, 60);
    const snapshot = { ...p };
    getCombatDebuffsFromCondition(p);
    expect(p).toEqual(snapshot);
  });
});

describe("getCraftingInstabilityFromCorruption — monotonicity", () => {
  it("clean + healthy yields neutral (no misfire possible)", () => {
    const r = getCraftingInstabilityFromCorruption(player(100, 0));
    expect(r.successMult).toBe(1);
    expect(r.sideEffectWeight).toBe(0);
    expect(r.canMisfire).toBe(false);
  });

  it("successMult non-increasing as corruption rises", () => {
    const a = getCraftingInstabilityFromCorruption(player(100, 0)).successMult;
    const b = getCraftingInstabilityFromCorruption(player(100, 30)).successMult;
    const c = getCraftingInstabilityFromCorruption(player(100, 50)).successMult;
    const d = getCraftingInstabilityFromCorruption(player(100, 70)).successMult;
    const e = getCraftingInstabilityFromCorruption(player(100, 90)).successMult;
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
    expect(c).toBeGreaterThanOrEqual(d);
    expect(d).toBeGreaterThanOrEqual(e);
    expect(e).toBeLessThan(1);
  });

  it("sideEffectWeight non-decreasing as corruption rises", () => {
    const a = getCraftingInstabilityFromCorruption(player(100, 0)).sideEffectWeight;
    const b = getCraftingInstabilityFromCorruption(player(100, 30)).sideEffectWeight;
    const c = getCraftingInstabilityFromCorruption(player(100, 50)).sideEffectWeight;
    const d = getCraftingInstabilityFromCorruption(player(100, 70)).sideEffectWeight;
    const e = getCraftingInstabilityFromCorruption(player(100, 90)).sideEffectWeight;
    expect(a).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(c);
    expect(c).toBeLessThanOrEqual(d);
    expect(d).toBeLessThanOrEqual(e);
  });

  it("canMisfire flips true once in wear+ band", () => {
    expect(getCraftingInstabilityFromCorruption(player(100, 30)).canMisfire).toBe(true);
    expect(getCraftingInstabilityFromCorruption(player(100, 90)).canMisfire).toBe(true);
  });

  it("condition strain+ compounds on top of corruption", () => {
    const corrOnly = getCraftingInstabilityFromCorruption(player(100, 50));
    const both = getCraftingInstabilityFromCorruption(player(30, 50));
    expect(both.successMult).toBeLessThan(corrOnly.successMult);
    expect(both.sideEffectWeight).toBeGreaterThan(corrOnly.sideEffectWeight);
  });

  it("clamps sideEffectWeight at 0.95", () => {
    const worst = getCraftingInstabilityFromCorruption(player(0, 100));
    expect(worst.sideEffectWeight).toBeLessThanOrEqual(0.95);
  });

  it("does not mutate the input", () => {
    const p = player(40, 60);
    const snap = { ...p };
    getCraftingInstabilityFromCorruption(p);
    expect(p).toEqual(snap);
  });
});

describe("getConsequenceSnapshot — composite view", () => {
  it("reports tiers + both debuff buckets for a mid-harm player", () => {
    const snap = getConsequenceSnapshot(player(40, 55));
    expect(snap.conditionTier).toBe("strain");
    expect(snap.corruptionTier).toBe("strain");
    expect(snap.combat.dmgMult).toBeLessThan(1);
    expect(snap.crafting.canMisfire).toBe(true);
  });

  it("returns neutral values for a pristine player", () => {
    const snap = getConsequenceSnapshot(player(100, 0));
    expect(snap.conditionTier).toBe("none");
    expect(snap.corruptionTier).toBe("none");
    expect(snap.combat.dmgMult).toBe(1);
    expect(snap.crafting.canMisfire).toBe(false);
  });
});
