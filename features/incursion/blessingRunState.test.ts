import { describe, it, expect } from "vitest";
import {
  addBlessing,
  clearBlessings,
  createActiveBlessingSet,
  hasBlessing,
  listBlessings,
  summarizeActiveBlessings,
} from "./blessingRunState";
import type {
  ActiveBlessing,
  Blessing,
  FusionBlessing,
} from "./blessingTypes";

/**
 * Run-state stacking + summary. Canon anchor:
 * lore-canon/14 TaskQueue/Block-4-New-Mechanics.md §4.1 — blessings stack
 * per-run; corruption/condition costs carry back; capacity stress is tracked
 * per Blood/Frame/Resonance pool.
 */
const bioBlessing: Blessing = {
  id: "bio.test",
  name: "Bio Test",
  school: "bio",
  flavor: "Verdant Coil flavor.",
  effect: { damagePct: 10, regenPerSec: 1 },
  cost: { kind: "condition", amount: 5 },
  rarity: "common",
};

const mechaBlessing: Blessing = {
  id: "mecha.test",
  name: "Mecha Test",
  school: "mecha",
  flavor: "Chrome Synod flavor.",
  effect: { shieldPct: 20, precisionPct: 5 },
  cost: { kind: "capacity", amount: 3, pool: "frame" },
  rarity: "common",
};

const pureBlessing: Blessing = {
  id: "pure.test",
  name: "Pure Test",
  school: "pure",
  flavor: "Ember Vault flavor.",
  effect: { manaBonus: 10, damagePct: 5 },
  cost: { kind: "corruption", amount: 4 },
  rarity: "common",
};

const fusion: FusionBlessing = {
  id: "fusion.test",
  name: "Fusion Test",
  flavor: "Black City flavor.",
  pair: "bio+mecha",
  effect: { damagePct: 30, shieldPct: 10 },
  costs: [
    { kind: "condition", amount: 7 },
    { kind: "capacity", amount: 2, pool: "blood" },
  ],
  rarity: "fusion",
};

function wrap(b: Blessing | FusionBlessing, acceptedAt = 0): ActiveBlessing {
  if (b.rarity === "fusion") {
    return { kind: "fusion", blessing: b, acceptedAt };
  }
  return { kind: "school", blessing: b, acceptedAt };
}

describe("blessingRunState: create/add/clear", () => {
  it("creates empty sets tagged with the runId", () => {
    const set = createActiveBlessingSet("run-1");
    expect(set.runId).toBe("run-1");
    expect(set.entries).toEqual([]);
  });

  it("addBlessing appends without mutating the original", () => {
    const a = createActiveBlessingSet("run-2");
    const b = addBlessing(a, wrap(bioBlessing));
    expect(a.entries).toHaveLength(0);
    expect(b.entries).toHaveLength(1);
    expect(b.runId).toBe("run-2");
  });

  it("clearBlessings wipes a fresh set for the given runId", () => {
    const seeded = addBlessing(
      createActiveBlessingSet("run-3"),
      wrap(bioBlessing),
    );
    const cleared = clearBlessings("run-3");
    expect(cleared.entries).toEqual([]);
    expect(cleared.runId).toBe("run-3");
    // original untouched
    expect(seeded.entries).toHaveLength(1);
  });

  it("listBlessings returns the current entry order", () => {
    const s0 = createActiveBlessingSet("run-4");
    const s1 = addBlessing(s0, wrap(bioBlessing));
    const s2 = addBlessing(s1, wrap(mechaBlessing));
    const listed = listBlessings(s2);
    expect(listed.map((e) => e.blessing.id)).toEqual([
      bioBlessing.id,
      mechaBlessing.id,
    ]);
  });

  it("hasBlessing checks by id", () => {
    const s = addBlessing(
      createActiveBlessingSet("run-5"),
      wrap(bioBlessing),
    );
    expect(hasBlessing(s, bioBlessing.id)).toBe(true);
    expect(hasBlessing(s, "nope")).toBe(false);
  });
});

describe("summarizeActiveBlessings", () => {
  it("zeros across all effect keys for an empty set", () => {
    const summary = summarizeActiveBlessings(createActiveBlessingSet("r"));
    expect(summary.count).toBe(0);
    expect(summary.corruptionPaid).toBe(0);
    expect(summary.conditionPaid).toBe(0);
    expect(summary.capacityStress).toEqual({
      blood: 0,
      frame: 0,
      resonance: 0,
    });
    expect(summary.totals.damagePct).toBe(0);
    expect(summary.totals.regenPerSec).toBe(0);
    expect(summary.totals.manaBonus).toBe(0);
  });

  it("aggregates effects additively across stacked blessings", () => {
    let set = createActiveBlessingSet("run-agg");
    set = addBlessing(set, wrap(bioBlessing));
    set = addBlessing(set, wrap(mechaBlessing));
    set = addBlessing(set, wrap(pureBlessing));
    const s = summarizeActiveBlessings(set);
    expect(s.count).toBe(3);
    expect(s.totals.damagePct).toBe(15); // 10 + 0 + 5
    expect(s.totals.regenPerSec).toBe(1);
    expect(s.totals.shieldPct).toBe(20);
    expect(s.totals.precisionPct).toBe(5);
    expect(s.totals.manaBonus).toBe(10);
  });

  it("folds costs into corruption/condition/capacityStress totals", () => {
    let set = createActiveBlessingSet("run-costs");
    set = addBlessing(set, wrap(bioBlessing)); // condition 5
    set = addBlessing(set, wrap(mechaBlessing)); // capacity frame 3
    set = addBlessing(set, wrap(pureBlessing)); // corruption 4
    set = addBlessing(set, wrap(fusion)); // condition 7 + capacity blood 2
    const s = summarizeActiveBlessings(set);
    expect(s.corruptionPaid).toBe(4);
    expect(s.conditionPaid).toBe(12);
    expect(s.capacityStress.frame).toBe(3);
    expect(s.capacityStress.blood).toBe(2);
    expect(s.capacityStress.resonance).toBe(0);
  });

  it("includes fusion effect contributions alongside school ones", () => {
    let set = createActiveBlessingSet("run-fusion");
    set = addBlessing(set, wrap(bioBlessing));
    set = addBlessing(set, wrap(fusion));
    const s = summarizeActiveBlessings(set);
    expect(s.count).toBe(2);
    expect(s.totals.damagePct).toBe(40); // 10 + 30
    expect(s.totals.shieldPct).toBe(10);
  });

  it("is pure — calling it twice yields equal summaries", () => {
    let set = createActiveBlessingSet("run-pure");
    set = addBlessing(set, wrap(bioBlessing));
    set = addBlessing(set, wrap(fusion));
    expect(summarizeActiveBlessings(set)).toEqual(
      summarizeActiveBlessings(set),
    );
  });
});
