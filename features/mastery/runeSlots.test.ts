import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  SLOT_UNLOCK_RANK_BY_INDEX,
  getAllRuneSlots,
  getRuneSlotsForSchool,
  getSlotUnlockBlocker,
  getTotalUnlockedSlots,
  getUnlockedSlotCount,
  hasAvailableSlot,
} from "@/features/mastery/runeSlots";
import { MAX_MINORS_PER_SCHOOL } from "@/features/mastery/runeMasteryLogic";

function masteryWith(
  patch: Partial<PlayerRuneMasteryState>,
): PlayerRuneMasteryState {
  return {
    ...initialGameState.player.runeMastery,
    ...patch,
    minorCountBySchool: {
      ...initialGameState.player.runeMastery.minorCountBySchool,
      ...patch.minorCountBySchool,
    },
  };
}

function playerWith(
  rankLevel: number,
  minors: Partial<PlayerRuneMasteryState["minorCountBySchool"]> = {},
): PlayerState {
  return {
    ...initialGameState.player,
    rankLevel,
    runeMastery: masteryWith({
      minorCountBySchool: {
        bio: 0,
        mecha: 0,
        pure: 0,
        ...minors,
      },
    }),
  };
}

describe("SLOT_UNLOCK_RANK_BY_INDEX", () => {
  it("matches canon thresholds [1,3,5,7,9,11]", () => {
    expect(Array.from(SLOT_UNLOCK_RANK_BY_INDEX)).toEqual([1, 3, 5, 7, 9, 11]);
  });

  it("has exactly MAX_MINORS_PER_SCHOOL entries", () => {
    expect(SLOT_UNLOCK_RANK_BY_INDEX).toHaveLength(MAX_MINORS_PER_SCHOOL);
  });
});

describe("getUnlockedSlotCount", () => {
  it("unlocks only slot 0 at rank 1", () => {
    expect(getUnlockedSlotCount("bio", 1)).toBe(1);
  });

  it("returns 0 below rank 1 (pre-character, conceptual floor)", () => {
    expect(getUnlockedSlotCount("mecha", 0)).toBe(0);
  });

  it("climbs by 1 at each gate rank boundary", () => {
    expect(getUnlockedSlotCount("pure", 2)).toBe(1);
    expect(getUnlockedSlotCount("pure", 3)).toBe(2);
    expect(getUnlockedSlotCount("pure", 5)).toBe(3);
    expect(getUnlockedSlotCount("pure", 7)).toBe(4);
    expect(getUnlockedSlotCount("pure", 9)).toBe(5);
    expect(getUnlockedSlotCount("pure", 11)).toBe(6);
  });

  it("caps at MAX_MINORS_PER_SCHOOL past rank 11", () => {
    expect(getUnlockedSlotCount("bio", 20)).toBe(MAX_MINORS_PER_SCHOOL);
    expect(getUnlockedSlotCount("mecha", 999)).toBe(MAX_MINORS_PER_SCHOOL);
  });
});

describe("getRuneSlotsForSchool", () => {
  it("marks filled / available / locked correctly at mid-rank", () => {
    const mastery = masteryWith({
      minorCountBySchool: { bio: 1, mecha: 0, pure: 0 },
    });
    const slots = getRuneSlotsForSchool(mastery, "bio", 5);
    // rank 5 -> 3 unlocked; 1 filled, 2 available, 3 locked.
    expect(slots).toHaveLength(MAX_MINORS_PER_SCHOOL);
    expect(slots[0].status).toBe("filled");
    expect(slots[1].status).toBe("available");
    expect(slots[2].status).toBe("available");
    expect(slots[3].status).toBe("locked");
    expect(slots[5].status).toBe("locked");
  });

  it("all locked when rankLevel is 0", () => {
    const mastery = masteryWith({});
    const slots = getRuneSlotsForSchool(mastery, "pure", 0);
    expect(slots.every((s) => s.status === "locked")).toBe(true);
  });

  it("every slot filled once minors reach school cap", () => {
    const mastery = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 6, pure: 0 },
    });
    const slots = getRuneSlotsForSchool(mastery, "mecha", 11);
    expect(slots.every((s) => s.status === "filled")).toBe(true);
  });

  it("attaches the correct rank gate per index", () => {
    const slots = getRuneSlotsForSchool(masteryWith({}), "bio", 1);
    expect(slots.map((s) => s.unlocksAtRank)).toEqual([1, 3, 5, 7, 9, 11]);
  });
});

describe("hasAvailableSlot", () => {
  it("true when unlocked > filled", () => {
    const m = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 0, pure: 0 },
    });
    expect(hasAvailableSlot(m, "bio", 1)).toBe(true);
  });

  it("false when filled fills every unlocked slot", () => {
    const m = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 1, pure: 0 },
    });
    expect(hasAvailableSlot(m, "mecha", 1)).toBe(false);
  });

  it("false at the school minor cap even with high rank", () => {
    const m = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 6, pure: 0 },
    });
    expect(hasAvailableSlot(m, "mecha", 20)).toBe(false);
  });
});

describe("getSlotUnlockBlocker", () => {
  it("returns null when a slot is genuinely open", () => {
    const m = masteryWith({});
    expect(getSlotUnlockBlocker(m, "bio", 1)).toBeNull();
  });

  it("mentions the next rank gate when blocked by rank", () => {
    const m = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 1, pure: 0 },
    });
    const reason = getSlotUnlockBlocker(m, "mecha", 1);
    expect(reason).toMatch(/rank 3/);
    expect(reason).toMatch(/mecha/);
  });

  it("reports school cap when at MAX minors", () => {
    const m = masteryWith({
      minorCountBySchool: { bio: 0, mecha: 0, pure: 6 },
    });
    const reason = getSlotUnlockBlocker(m, "pure", 11);
    expect(reason).toMatch(/cap/i);
  });
});

describe("getTotalUnlockedSlots", () => {
  it("sums unlocked counts across all three schools", () => {
    // rank 3 -> 2 per school -> 6 total
    expect(getTotalUnlockedSlots(3)).toBe(6);
  });

  it("returns 3 at rank 1 (1 per school)", () => {
    expect(getTotalUnlockedSlots(1)).toBe(3);
  });
});

describe("getAllRuneSlots", () => {
  it("returns MAX * 3 entries in RUNE_SCHOOLS order (bio, mecha, pure)", () => {
    const player = playerWith(11);
    const all = getAllRuneSlots(player);
    expect(all).toHaveLength(MAX_MINORS_PER_SCHOOL * 3);
    const schools: RuneSchool[] = ["bio", "mecha", "pure"];
    schools.forEach((school, i) => {
      const slice = all.slice(
        i * MAX_MINORS_PER_SCHOOL,
        (i + 1) * MAX_MINORS_PER_SCHOOL,
      );
      expect(slice.every((s) => s.school === school)).toBe(true);
    });
  });

  it("reflects the player's rank and filled counts", () => {
    const player = playerWith(5, { bio: 2, mecha: 0, pure: 1 });
    const all = getAllRuneSlots(player);
    const bio = all.filter((s) => s.school === "bio");
    expect(bio.filter((s) => s.status === "filled")).toHaveLength(2);
    expect(bio.filter((s) => s.status === "available")).toHaveLength(1);
    expect(bio.filter((s) => s.status === "locked")).toHaveLength(3);
  });
});
