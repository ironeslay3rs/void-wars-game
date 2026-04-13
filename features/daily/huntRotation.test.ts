import { describe, expect, it } from "vitest";

import {
  getDailyHunt,
  getDailyHuntWindow,
  isValidDateKey,
  toDateKey,
  type DailyHunt,
  type DailyHuntDifficulty,
} from "@/features/daily/huntRotation";
import { voidZones } from "@/features/void-maps/zoneData";

const DIFFICULTIES: DailyHuntDifficulty[] = ["standard", "elite", "apex"];

describe("isValidDateKey", () => {
  it("accepts YYYY-MM-DD form", () => {
    expect(isValidDateKey("2026-04-13")).toBe(true);
    expect(isValidDateKey("0001-01-01")).toBe(true);
    expect(isValidDateKey("9999-12-31")).toBe(true);
  });

  it("rejects malformed inputs", () => {
    expect(isValidDateKey("")).toBe(false);
    expect(isValidDateKey("2026-4-13")).toBe(false);
    expect(isValidDateKey("26-04-13")).toBe(false);
    expect(isValidDateKey("2026/04/13")).toBe(false);
    expect(isValidDateKey("2026-04-13T00:00:00Z")).toBe(false);
    expect(isValidDateKey("tomorrow")).toBe(false);
    expect(isValidDateKey("2026-04-1a")).toBe(false);
  });
});

describe("toDateKey", () => {
  it("returns a zero-padded UTC YYYY-MM-DD", () => {
    expect(toDateKey(new Date(Date.UTC(2026, 3, 13)))).toBe("2026-04-13");
    expect(toDateKey(new Date(Date.UTC(2001, 0, 2)))).toBe("2001-01-02");
  });

  it("round-trips through isValidDateKey", () => {
    const key = toDateKey(new Date(Date.UTC(2026, 6, 4)));
    expect(isValidDateKey(key)).toBe(true);
  });
});

describe("getDailyHunt — determinism + shape", () => {
  it("returns the same hunt for the same dateKey", () => {
    const a = getDailyHunt("2026-04-13");
    const b = getDailyHunt("2026-04-13");
    expect(a).toEqual(b);
  });

  it("does not mutate inputs across calls (pure function)", () => {
    const key = "2026-04-13";
    const frozenKey = Object.freeze({ value: key });
    const a = getDailyHunt(frozenKey.value);
    const b = getDailyHunt(frozenKey.value);
    // Mutating returned arrays should not poison subsequent calls.
    a.featuredMobs.push(...a.featuredMobs);
    const c = getDailyHunt(frozenKey.value);
    expect(c).toEqual(b);
  });

  it("picks a zone that exists in voidZones", () => {
    const hunt = getDailyHunt("2026-04-13");
    const ids = voidZones.map((z) => z.id);
    expect(ids).toContain(hunt.zoneId);
  });

  it("carries matching loot theme + zone label from voidZones", () => {
    const hunt = getDailyHunt("2026-04-13");
    const zone = voidZones.find((z) => z.id === hunt.zoneId);
    expect(zone).toBeDefined();
    expect(hunt.zoneLabel).toBe(zone!.label);
    expect(hunt.lootTheme).toBe(zone!.lootTheme);
  });

  it("produces a difficulty in the DailyHuntDifficulty union", () => {
    const hunt = getDailyHunt("2026-04-13");
    expect(DIFFICULTIES).toContain(hunt.difficulty);
  });

  it("produces a positive clearQuota and reward multiplier ≥ 1 for standard+ difficulties", () => {
    const hunt = getDailyHunt("2026-04-13");
    expect(hunt.clearQuota).toBeGreaterThan(0);
    expect(hunt.rewardMultiplier).toBeGreaterThan(0);
    if (hunt.difficulty === "standard") expect(hunt.rewardMultiplier).toBe(1);
    if (hunt.difficulty === "elite") expect(hunt.rewardMultiplier).toBeCloseTo(1.35, 5);
    if (hunt.difficulty === "apex") expect(hunt.rewardMultiplier).toBeCloseTo(1.8, 5);
  });

  it("throws on invalid dateKey input", () => {
    expect(() => getDailyHunt("not-a-date")).toThrow(/Invalid dateKey/);
    expect(() => getDailyHunt("2026-4-13")).toThrow();
  });
});

describe("getDailyHunt — rotation variety across a week", () => {
  const week: DailyHunt[] = [];
  const base = new Date(Date.UTC(2026, 3, 13));
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(base.getTime());
    d.setUTCDate(base.getUTCDate() + i);
    week.push(getDailyHunt(toDateKey(d)));
  }

  it("covers more than one zone across a 7-day window", () => {
    const uniqueZones = new Set(week.map((h) => h.zoneId));
    expect(uniqueZones.size).toBeGreaterThan(1);
  });

  it("produces more than one distinct signature across 7 days", () => {
    const signatures = new Set(
      week.map((h) => `${h.zoneId}:${h.difficulty}:${h.clearQuota}`),
    );
    expect(signatures.size).toBeGreaterThan(1);
  });

  it("every hunt's dateKey matches its slot", () => {
    for (let i = 0; i < week.length; i += 1) {
      const d = new Date(base.getTime());
      d.setUTCDate(base.getUTCDate() + i);
      expect(week[i].dateKey).toBe(toDateKey(d));
    }
  });
});

describe("getDailyHuntWindow", () => {
  it("returns an empty array for 0 days", () => {
    expect(getDailyHuntWindow("2026-04-13", 0)).toEqual([]);
  });

  it("returns an empty array for negative days", () => {
    expect(getDailyHuntWindow("2026-04-13", -5)).toEqual([]);
  });

  it("floors fractional day counts", () => {
    expect(getDailyHuntWindow("2026-04-13", 3.9)).toHaveLength(3);
  });

  it("produces N hunts whose dateKeys are consecutive UTC days", () => {
    const window = getDailyHuntWindow("2026-04-13", 5);
    expect(window).toHaveLength(5);
    expect(window[0].dateKey).toBe("2026-04-13");
    expect(window[1].dateKey).toBe("2026-04-14");
    expect(window[4].dateKey).toBe("2026-04-17");
  });

  it("each entry matches getDailyHunt for its own dateKey", () => {
    const window = getDailyHuntWindow("2026-04-13", 4);
    for (const h of window) {
      expect(h).toEqual(getDailyHunt(h.dateKey));
    }
  });

  it("throws on invalid start dateKey", () => {
    expect(() => getDailyHuntWindow("bad", 3)).toThrow(/Invalid dateKey/);
  });
});
