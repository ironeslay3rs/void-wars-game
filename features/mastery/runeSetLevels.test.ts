/**
 * Canon rune set levels tests.
 *
 * Canon: Rune System.md — "Level 1 standard, Level 2 Executional,
 * Level 3 rare." L1/L2 map to existing tier detection; L3 fires on
 * hybrid progression across all three schools.
 */
import { describe, expect, it } from "vitest";
import {
  detectRuneSetLevels,
  getRuneSetLevelRewardMultiplier,
  isRareRuneSetActive,
  RUNE_SET_LEVEL_3_BONUS_PCT,
  RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
} from "@/features/mastery/runeSetLevels";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";

function masteryWith(
  counts: Partial<Record<"bio" | "mecha" | "pure", number>>,
): PlayerRuneMasteryState {
  return {
    minorCountBySchool: {
      bio: counts.bio ?? 0,
      mecha: counts.mecha ?? 0,
      pure: counts.pure ?? 0,
    },
    depthBySchool: { bio: 0, mecha: 0, pure: 0 },
    capacity: { blood: 0, frame: 0, resonance: 0 },
    hybridDrainStacks: 0,
  } as PlayerRuneMasteryState;
}

describe("detectRuneSetLevels", () => {
  it("returns empty when no school qualifies for any level", () => {
    const result = detectRuneSetLevels(masteryWith({}));
    expect(result).toEqual([]);
  });

  it("maps 2-set to canon L1 Standard War", () => {
    const result = detectRuneSetLevels(masteryWith({ bio: 2 }));
    const l1 = result.filter((l) => l.level === 1);
    expect(l1.length).toBe(1);
    expect(l1[0].label).toBe("Standard War");
    expect(l1[0].school).toBe("bio");
  });

  it("maps 3-set to canon L2 Executional", () => {
    const result = detectRuneSetLevels(masteryWith({ mecha: 3 }));
    const l2 = result.filter((l) => l.level === 2);
    expect(l2.length).toBe(1);
    expect(l2[0].label).toBe("Executional");
    expect(l2[0].school).toBe("mecha");
  });

  it("fires L3 Rare when all 3 schools have >= threshold minors", () => {
    const result = detectRuneSetLevels(
      masteryWith({
        bio: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
        mecha: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
        pure: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
      }),
    );
    const l3 = result.find((l) => l.level === 3);
    expect(l3).toBeDefined();
    expect(l3!.label).toBe("Rare");
    expect(l3!.school).toBeNull();
    expect(l3!.bonusPct).toBe(RUNE_SET_LEVEL_3_BONUS_PCT);
  });

  it("does NOT fire L3 when any school is below threshold", () => {
    const result = detectRuneSetLevels(
      masteryWith({ bio: 5, mecha: 5, pure: 1 }),
    );
    expect(result.some((l) => l.level === 3)).toBe(false);
  });

  it("L3 and L2 can coexist (specialization plus hybrid)", () => {
    const result = detectRuneSetLevels(
      masteryWith({ bio: 3, mecha: 2, pure: 2 }),
    );
    expect(result.some((l) => l.level === 2 && l.school === "bio")).toBe(true);
    expect(result.some((l) => l.level === 3)).toBe(true);
  });
});

describe("getRuneSetLevelRewardMultiplier", () => {
  it("returns 1 when no levels grant a bonus (L1/L2 are label-only)", () => {
    expect(getRuneSetLevelRewardMultiplier(masteryWith({ bio: 3 }))).toBe(1);
  });

  it("adds L3 bonus when Rare fires", () => {
    const mult = getRuneSetLevelRewardMultiplier(
      masteryWith({
        bio: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
        mecha: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
        pure: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
      }),
    );
    expect(mult).toBeCloseTo(1 + RUNE_SET_LEVEL_3_BONUS_PCT / 100);
  });
});

describe("isRareRuneSetActive", () => {
  it("false when not all schools qualify", () => {
    expect(isRareRuneSetActive(masteryWith({ bio: 3, mecha: 3 }))).toBe(false);
  });

  it("true at exactly the threshold", () => {
    expect(
      isRareRuneSetActive(
        masteryWith({
          bio: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
          mecha: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
          pure: RUNE_SET_LEVEL_3_MINORS_PER_SCHOOL,
        }),
      ),
    ).toBe(true);
  });
});
