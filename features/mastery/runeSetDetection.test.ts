import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import {
  RUNE_SET_REWARD_BONUS_MAX_PCT,
  RUNE_SET_TIER_2_REWARD_BONUS_PCT,
  RUNE_SET_TIER_3_REWARD_BONUS_PCT,
  countActiveRuneSets,
  detectRuneSets,
  getRuneSetRewardMultiplier,
} from "@/features/mastery/runeSetDetection";

function masteryWith(
  minors: Partial<PlayerRuneMasteryState["minorCountBySchool"]>,
): PlayerRuneMasteryState {
  return {
    ...initialGameState.player.runeMastery,
    minorCountBySchool: {
      bio: 0,
      mecha: 0,
      pure: 0,
      ...minors,
    },
  };
}

describe("detectRuneSets", () => {
  it("returns no sets when every school has fewer than 2 minors", () => {
    expect(detectRuneSets(masteryWith({}))).toEqual([]);
    expect(
      detectRuneSets(masteryWith({ bio: 1, mecha: 1, pure: 1 })),
    ).toEqual([]);
  });

  it("detects a single 2-set when one school has exactly 2 minors", () => {
    const sets = detectRuneSets(masteryWith({ bio: 2 }));
    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ school: "bio", tier: 2 });
  });

  it("promotes a school with 3+ minors to a 3-set (no double-count with 2-set)", () => {
    const sets = detectRuneSets(masteryWith({ mecha: 3 }));
    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ school: "mecha", tier: 3 });
  });

  it("each school contributes at most one set entry, highest tier only", () => {
    const sets = detectRuneSets(masteryWith({ pure: 5 }));
    expect(sets).toHaveLength(1);
    expect(sets[0].tier).toBe(3);
  });

  it("can return multiple sets across different schools", () => {
    const sets = detectRuneSets(
      masteryWith({ bio: 2, mecha: 3, pure: 1 }),
    );
    expect(sets).toHaveLength(2);
    const schools = sets.map((s) => s.school).sort();
    expect(schools).toEqual(["bio", "mecha"]);
  });
});

describe("getRuneSetRewardMultiplier", () => {
  it("returns 1 when no sets are active", () => {
    expect(getRuneSetRewardMultiplier(masteryWith({}))).toBe(1);
  });

  it("returns 1 + (tier 2 bonus / 100) when one 2-set is active", () => {
    expect(
      getRuneSetRewardMultiplier(masteryWith({ bio: 2 })),
    ).toBeCloseTo(1 + RUNE_SET_TIER_2_REWARD_BONUS_PCT / 100);
  });

  it("returns 1 + (tier 3 bonus / 100) when one 3-set is active", () => {
    expect(
      getRuneSetRewardMultiplier(masteryWith({ mecha: 3 })),
    ).toBeCloseTo(1 + RUNE_SET_TIER_3_REWARD_BONUS_PCT / 100);
  });

  it("sums set bonuses across multiple schools", () => {
    const expected =
      1 +
      (RUNE_SET_TIER_2_REWARD_BONUS_PCT +
        RUNE_SET_TIER_3_REWARD_BONUS_PCT) /
        100;
    expect(
      getRuneSetRewardMultiplier(masteryWith({ bio: 2, mecha: 3 })),
    ).toBeCloseTo(expected);
  });

  it("caps the combined bonus at RUNE_SET_REWARD_BONUS_MAX_PCT", () => {
    const fullSets = masteryWith({ bio: 5, mecha: 5, pure: 5 });
    const mult = getRuneSetRewardMultiplier(fullSets);
    expect(mult).toBeCloseTo(1 + RUNE_SET_REWARD_BONUS_MAX_PCT / 100);
  });
});

describe("countActiveRuneSets", () => {
  it("returns zero counts when no sets are active", () => {
    expect(countActiveRuneSets(masteryWith({}))).toEqual({
      twoSets: 0,
      threeSets: 0,
      total: 0,
    });
  });

  it("counts each tier separately", () => {
    expect(
      countActiveRuneSets(masteryWith({ bio: 2, mecha: 3, pure: 4 })),
    ).toEqual({ twoSets: 1, threeSets: 2, total: 3 });
  });
});

describe("Set bonus tier ordering invariants", () => {
  it("tier 3 bonus is strictly larger than tier 2 bonus", () => {
    expect(RUNE_SET_TIER_3_REWARD_BONUS_PCT).toBeGreaterThan(
      RUNE_SET_TIER_2_REWARD_BONUS_PCT,
    );
  });

  it("max combined cap is exactly 3 × tier 3 bonus", () => {
    expect(RUNE_SET_REWARD_BONUS_MAX_PCT).toBe(
      3 * RUNE_SET_TIER_3_REWARD_BONUS_PCT,
    );
  });
});
