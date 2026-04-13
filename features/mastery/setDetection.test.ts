import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import {
  RUNE_SET_TIER_2_THRESHOLD,
  RUNE_SET_TIER_3_THRESHOLD,
  countActiveRuneSets,
  detectPlayerRuneSets,
  detectRuneSets,
  getActiveSetFor,
  getRuneSetRewardMultiplier,
  hasActiveSetFor,
} from "@/features/mastery/setDetection";

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

function playerWith(
  minors: Partial<PlayerRuneMasteryState["minorCountBySchool"]>,
): PlayerState {
  return {
    ...initialGameState.player,
    runeMastery: masteryWith(minors),
  };
}

describe("setDetection facade re-exports", () => {
  it("re-exports the detection primitives unchanged", () => {
    expect(typeof detectRuneSets).toBe("function");
    expect(typeof countActiveRuneSets).toBe("function");
    expect(typeof getRuneSetRewardMultiplier).toBe("function");
    expect(RUNE_SET_TIER_2_THRESHOLD).toBe(2);
    expect(RUNE_SET_TIER_3_THRESHOLD).toBe(3);
  });
});

describe("detectPlayerRuneSets", () => {
  it("returns [] for a pristine player", () => {
    expect(detectPlayerRuneSets(initialGameState.player)).toEqual([]);
  });

  it("matches detectRuneSets(player.runeMastery) exactly", () => {
    const p = playerWith({ bio: 2, mecha: 3 });
    expect(detectPlayerRuneSets(p)).toEqual(detectRuneSets(p.runeMastery));
  });

  it("surfaces tier 3 for a school at 3+ minors", () => {
    const p = playerWith({ pure: 4 });
    const sets = detectPlayerRuneSets(p);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ school: "pure", tier: 3 });
  });
});

describe("hasActiveSetFor", () => {
  it("false when the school has fewer than the tier-2 threshold", () => {
    const m = masteryWith({ bio: 1 });
    expect(hasActiveSetFor(m, "bio")).toBe(false);
  });

  it("true once the school crosses the tier-2 threshold", () => {
    const m = masteryWith({ bio: RUNE_SET_TIER_2_THRESHOLD });
    expect(hasActiveSetFor(m, "bio")).toBe(true);
  });

  it("true at tier-3 threshold", () => {
    const m = masteryWith({ mecha: RUNE_SET_TIER_3_THRESHOLD });
    expect(hasActiveSetFor(m, "mecha")).toBe(true);
  });

  it("reports only the queried school independently", () => {
    const m = masteryWith({ bio: 3 });
    expect(hasActiveSetFor(m, "bio")).toBe(true);
    expect(hasActiveSetFor(m, "mecha")).toBe(false);
    expect(hasActiveSetFor(m, "pure")).toBe(false);
  });
});

describe("getActiveSetFor", () => {
  it("returns null when no set is active for the school", () => {
    expect(getActiveSetFor(masteryWith({}), "bio")).toBeNull();
    expect(getActiveSetFor(masteryWith({ bio: 1 }), "bio")).toBeNull();
  });

  it("returns the tier-2 activation when the school has exactly 2 minors", () => {
    const active = getActiveSetFor(masteryWith({ pure: 2 }), "pure");
    expect(active).not.toBeNull();
    expect(active!.school).toBe("pure");
    expect(active!.tier).toBe(2);
  });

  it("returns the tier-3 activation at 3+ minors (highest tier only)", () => {
    const active = getActiveSetFor(masteryWith({ mecha: 5 }), "mecha");
    expect(active).not.toBeNull();
    expect(active!.tier).toBe(3);
  });

  it("isolates results per school", () => {
    const m = masteryWith({ bio: 3, mecha: 2 });
    expect(getActiveSetFor(m, "bio")!.tier).toBe(3);
    expect(getActiveSetFor(m, "mecha")!.tier).toBe(2);
    expect(getActiveSetFor(m, "pure")).toBeNull();
  });
});
