import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import {
  SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD,
  SCHOOL_MASTERY_PASSIVES,
  applySchoolMasteryPassive,
  getActiveSchoolMasteryPassive,
} from "@/features/mastery/schoolMasteryPassives";

const base = initialGameState.player;

function playerWith(overrides: Partial<PlayerState>): PlayerState {
  return { ...base, ...overrides };
}

describe("SCHOOL_MASTERY_PASSIVES table", () => {
  it("has exactly 3 entries (bio, mecha, pure)", () => {
    expect(Object.keys(SCHOOL_MASTERY_PASSIVES)).toHaveLength(3);
  });

  it("every passive has a non-zero delta", () => {
    for (const p of Object.values(SCHOOL_MASTERY_PASSIVES)) {
      expect(p.delta).not.toBe(0);
    }
  });

  it("all deltas are small (within ±5)", () => {
    for (const p of Object.values(SCHOOL_MASTERY_PASSIVES)) {
      expect(Math.abs(p.delta)).toBeLessThanOrEqual(5);
    }
  });
});

describe("getActiveSchoolMasteryPassive", () => {
  it("returns null when player is unbound", () => {
    expect(
      getActiveSchoolMasteryPassive(
        playerWith({ factionAlignment: "unbound" }),
      ),
    ).toBeNull();
  });

  it("returns null when primary school depth is below the threshold", () => {
    expect(
      getActiveSchoolMasteryPassive(
        playerWith({
          factionAlignment: "bio",
          runeMastery: {
            ...base.runeMastery,
            depthBySchool: {
              bio: SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD - 1,
              mecha: 1,
              pure: 1,
            },
          },
        }),
      ),
    ).toBeNull();
  });

  it("returns the bio passive when bio-aligned with 3+ depth", () => {
    const result = getActiveSchoolMasteryPassive(
      playerWith({
        factionAlignment: "bio",
        runeMastery: {
          ...base.runeMastery,
          depthBySchool: {
            bio: SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD,
            mecha: 1,
            pure: 1,
          },
        },
      }),
    );
    expect(result).toMatchObject({ school: "bio", stat: "condition" });
  });

  it("returns the mecha passive when mecha-aligned with 3+ depth", () => {
    const result = getActiveSchoolMasteryPassive(
      playerWith({
        factionAlignment: "mecha",
        runeMastery: {
          ...base.runeMastery,
          depthBySchool: {
            bio: 1,
            mecha: SCHOOL_MASTERY_PASSIVE_DEPTH_THRESHOLD + 1,
            pure: 1,
          },
        },
      }),
    );
    expect(result).toMatchObject({ school: "mecha", stat: "voidInstability" });
  });
});

describe("applySchoolMasteryPassive", () => {
  it("adds condition for bio-aligned players at depth", () => {
    const p = playerWith({
      factionAlignment: "bio",
      condition: 50,
      runeMastery: {
        ...base.runeMastery,
        depthBySchool: { bio: 4, mecha: 1, pure: 1 },
      },
    });
    expect(applySchoolMasteryPassive(p).condition).toBe(53);
  });

  it("reduces void instability for mecha-aligned players at depth", () => {
    const p = playerWith({
      factionAlignment: "mecha",
      voidInstability: 10,
      runeMastery: {
        ...base.runeMastery,
        depthBySchool: { bio: 1, mecha: 3, pure: 1 },
      },
    });
    expect(applySchoolMasteryPassive(p).voidInstability).toBe(8);
  });

  it("adds mana for pure-aligned players at depth", () => {
    const p = playerWith({
      factionAlignment: "pure",
      mana: 30,
      manaMax: 50,
      runeMastery: {
        ...base.runeMastery,
        depthBySchool: { bio: 1, mecha: 1, pure: 5 },
      },
    });
    expect(applySchoolMasteryPassive(p).mana).toBe(33);
  });

  it("returns the same reference when no passive qualifies", () => {
    const p = playerWith({ factionAlignment: "unbound" });
    expect(applySchoolMasteryPassive(p)).toBe(p);
  });

  it("clamps values to valid ranges", () => {
    const p = playerWith({
      factionAlignment: "bio",
      condition: 99,
      runeMastery: {
        ...base.runeMastery,
        depthBySchool: { bio: 4, mecha: 1, pure: 1 },
      },
    });
    expect(applySchoolMasteryPassive(p).condition).toBe(100);
  });
});
