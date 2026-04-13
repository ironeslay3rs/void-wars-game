import { describe, expect, it } from "vitest";

import { eventRegistry } from "@/features/events/eventRegistry";
import type { EventDefinition } from "@/features/events/eventRegistry";
import {
  mergeResourceGrants,
  resolveEventReward,
  resolveScheduledReward,
  type EventResolvedReward,
} from "@/features/events/eventRewards";
import { getEventSchedule } from "@/features/events/eventSchedule";

function defById(id: string): EventDefinition {
  const d = eventRegistry.find((e) => e.id === id);
  if (!d) throw new Error(`missing fixture ${id}`);
  return d;
}

describe("resolveEventReward — bounty-pool scaling", () => {
  const def = defById("bounty.ember-heretic"); // pool: credits 150, emberCore 2

  it("full participation + no objectives yields floor(pool * 1)", () => {
    const out = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
    });
    expect(out.resourceGrants.credits).toBe(150);
    expect(out.resourceGrants.emberCore).toBe(2);
    expect(out.lootMultiplier).toBe(1);
    expect(out.discountPct).toBe(0);
  });

  it("no participation data at all defaults to scalar 1 (backwards-compat)", () => {
    const out = resolveEventReward(def, {});
    expect(out.resourceGrants.credits).toBe(150);
    expect(out.resourceGrants.emberCore).toBe(2);
  });

  it("tiny participation floors to a 25% minimum scalar", () => {
    const out = resolveEventReward(def, { participationMinutes: 1 });
    // 25% of 150 = 37.5 -> floor 37. emberCore: 0.25*2 = 0.5 -> floor 0, dropped.
    expect(out.resourceGrants.credits).toBe(37);
    expect(out.resourceGrants.emberCore).toBeUndefined();
  });

  it("zero participation produces empty grants and a clean summary", () => {
    const out = resolveEventReward(def, { participationMinutes: 0 });
    expect(out.resourceGrants).toEqual({});
    expect(out.summary).toBe("No reward");
  });

  it("objectives cleared boosts +10% each up to +100%", () => {
    const base = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
    });
    const withFive = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
      objectivesCleared: 5,
    });
    // 1.5x: credits 225
    expect(withFive.resourceGrants.credits).toBe(225);
    expect(withFive.resourceGrants.credits!).toBeGreaterThan(
      base.resourceGrants.credits!,
    );
  });

  it("objective boost caps at +100% (never higher)", () => {
    const ten = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
      objectivesCleared: 10,
    });
    const twenty = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
      objectivesCleared: 20,
    });
    expect(twenty.resourceGrants.credits).toBe(ten.resourceGrants.credits);
    // 2x cap: 150*2 = 300
    expect(twenty.resourceGrants.credits).toBe(300);
  });

  it("caps rewardMultiplier at 5", () => {
    const huge = resolveEventReward(def, {
      participationMinutes: def.durationMinutes,
      rewardMultiplier: 99,
    });
    // 5x cap: 150*5 = 750
    expect(huge.resourceGrants.credits).toBe(750);
  });

  it("non-finite or non-positive rewardMultiplier falls back to 1", () => {
    for (const m of [0, -3, Number.NaN, Number.POSITIVE_INFINITY]) {
      const out = resolveEventReward(def, {
        participationMinutes: def.durationMinutes,
        rewardMultiplier: m,
      });
      expect(out.resourceGrants.credits).toBe(150);
    }
  });
});

describe("resolveEventReward — multiplier + discount hints are stateless", () => {
  it("loot-boost surfaces lootMultiplier and no resource grants", () => {
    const def = defById("loot.double-drop");
    const out = resolveEventReward(def, {
      participationMinutes: 5,
      objectivesCleared: 3,
      rewardMultiplier: 4,
    });
    expect(out.lootMultiplier).toBe(2);
    expect(out.resourceGrants).toEqual({});
    expect(out.discountPct).toBe(0);
    expect(out.summary).toBe("Loot x2");
  });

  it("sale surfaces discountPct and no resource grants", () => {
    const def = defById("sale.broker-flash");
    const out = resolveEventReward(def, {});
    expect(out.discountPct).toBeCloseTo(0.2, 5);
    expect(out.lootMultiplier).toBe(1);
    expect(out.resourceGrants).toEqual({});
    expect(out.summary).toBe("20% off");
  });
});

describe("resolveEventReward — purity", () => {
  it("does not mutate the definition or the claim context", () => {
    const def = defById("incursion.synod");
    const defSnap = JSON.parse(JSON.stringify(def));
    const claim = { participationMinutes: 20, objectivesCleared: 2 };
    const claimSnap = JSON.parse(JSON.stringify(claim));
    resolveEventReward(def, claim);
    expect(def).toEqual(defSnap);
    expect(claim).toEqual(claimSnap);
  });

  it("is deterministic — equal inputs produce equal outputs", () => {
    const def = defById("bounty.verdant-poacher");
    const claim = { participationMinutes: 40, objectivesCleared: 3 };
    const a = resolveEventReward(def, claim);
    const b = resolveEventReward(def, claim);
    expect(a).toEqual(b);
  });

  it("covers every registry definition without throwing", () => {
    for (const def of eventRegistry) {
      const out: EventResolvedReward = resolveEventReward(def, {
        participationMinutes: def.durationMinutes,
        objectivesCleared: 1,
      });
      expect(out.eventId).toBe(def.id);
      expect(out.kind).toBe(def.kind);
      expect(out.lootMultiplier).toBeGreaterThanOrEqual(1);
      expect(out.discountPct).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("resolveScheduledReward", () => {
  it("delegates to resolveEventReward on the scheduled definition", () => {
    const day = getEventSchedule("2026-04-13");
    const scheduled = day.events[0];
    const claim = { participationMinutes: scheduled.definition.durationMinutes };
    const a = resolveScheduledReward(scheduled, claim);
    const b = resolveEventReward(scheduled.definition, claim);
    expect(a).toEqual(b);
  });

  it("does not mutate the scheduled event", () => {
    const day = getEventSchedule("2026-04-13");
    const scheduled = day.events[0];
    const snap = JSON.parse(JSON.stringify(scheduled));
    resolveScheduledReward(scheduled);
    expect(scheduled).toEqual(snap);
  });
});

describe("mergeResourceGrants", () => {
  function makeReward(
    grants: EventResolvedReward["resourceGrants"],
  ): EventResolvedReward {
    return {
      eventId: "x",
      kind: "bounty",
      resourceGrants: grants,
      lootMultiplier: 1,
      discountPct: 0,
      summary: "",
    };
  }

  it("is additive across overlapping keys", () => {
    const merged = mergeResourceGrants([
      makeReward({ credits: 100, scrapAlloy: 2 }),
      makeReward({ credits: 50, emberCore: 1 }),
    ]);
    expect(merged.credits).toBe(150);
    expect(merged.scrapAlloy).toBe(2);
    expect(merged.emberCore).toBe(1);
  });

  it("returns an empty object when given an empty list", () => {
    expect(mergeResourceGrants([])).toEqual({});
  });

  it("skips rewards with empty grants without error", () => {
    const merged = mergeResourceGrants([
      makeReward({}),
      makeReward({ credits: 10 }),
      makeReward({}),
    ]);
    expect(merged).toEqual({ credits: 10 });
  });

  it("does not mutate input reward objects", () => {
    const a = makeReward({ credits: 100 });
    const b = makeReward({ credits: 50 });
    const aSnap = JSON.parse(JSON.stringify(a));
    const bSnap = JSON.parse(JSON.stringify(b));
    mergeResourceGrants([a, b]);
    expect(a).toEqual(aSnap);
    expect(b).toEqual(bSnap);
  });
});

describe("canon — Pure never Spirit", () => {
  it("resolved summaries never mention Spirit", () => {
    for (const def of eventRegistry) {
      const out = resolveEventReward(def, {
        participationMinutes: def.durationMinutes,
        objectivesCleared: 1,
      });
      expect(out.summary.toLowerCase()).not.toContain("spirit");
    }
  });
});
