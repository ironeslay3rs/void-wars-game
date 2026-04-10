import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import { PANTHEON_ORDER } from "@/features/pantheons/pantheonData";
import {
  ALLIED_PANTHEON_VISIT_MANA_BONUS,
  getBlessingManaSurcharge,
  getPantheonRelationship,
  OPPOSED_BLESSING_MANA_COST,
  PANTHEON_RELATIONSHIPS,
} from "@/features/pantheons/pantheonRelationships";

const base = initialGameState.player;

describe("PANTHEON_RELATIONSHIPS table", () => {
  it("has exactly 7 entries matching the canonical order", () => {
    expect(Object.keys(PANTHEON_RELATIONSHIPS)).toHaveLength(7);
    for (const id of PANTHEON_ORDER) {
      expect(PANTHEON_RELATIONSHIPS[id]).toBeDefined();
    }
  });

  it("every relationship points to real pantheon ids", () => {
    for (const rel of Object.values(PANTHEON_RELATIONSHIPS)) {
      expect(PANTHEON_ORDER).toContain(rel.allied);
      expect(PANTHEON_ORDER).toContain(rel.opposed);
    }
  });

  it("no pantheon is allied or opposed to itself", () => {
    for (const [id, rel] of Object.entries(PANTHEON_RELATIONSHIPS)) {
      expect(rel.allied).not.toBe(id);
      expect(rel.opposed).not.toBe(id);
    }
  });

  it("allied is always within the same empire (Bio↔Bio, Mecha↔Mecha, Pure↔Pure)", () => {
    // Map pantheon → empire for verification
    const empireOf: Record<string, string> = {
      norse: "bio", greek: "bio", canaanite: "bio",
      inca: "pure", hindu: "pure",
      egyptian: "mecha", chinese: "mecha",
    };
    for (const [id, rel] of Object.entries(PANTHEON_RELATIONSHIPS)) {
      expect(empireOf[id]).toBe(empireOf[rel.allied]);
    }
  });

  it("opposed is always a different empire", () => {
    const empireOf: Record<string, string> = {
      norse: "bio", greek: "bio", canaanite: "bio",
      inca: "pure", hindu: "pure",
      egyptian: "mecha", chinese: "mecha",
    };
    for (const [id, rel] of Object.entries(PANTHEON_RELATIONSHIPS)) {
      expect(empireOf[id]).not.toBe(empireOf[rel.opposed]);
    }
  });
});

describe("getPantheonRelationship", () => {
  it("returns 'self' when the target is the player's own pantheon", () => {
    expect(
      getPantheonRelationship(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "norse",
      ),
    ).toBe("self");
  });

  it("returns 'allied' when the target is the allied pantheon", () => {
    expect(
      getPantheonRelationship(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "greek", // norse allied = greek
      ),
    ).toBe("allied");
  });

  it("returns 'opposed' when the target is the opposed pantheon", () => {
    expect(
      getPantheonRelationship(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "hindu", // norse opposed = hindu
      ),
    ).toBe("opposed");
  });

  it("returns 'neutral' for an unaffiliated pantheon", () => {
    expect(
      getPantheonRelationship(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "egyptian", // not self, not allied, not opposed
      ),
    ).toBe("neutral");
  });

  it("returns 'neutral' when player has no affinity", () => {
    expect(
      getPantheonRelationship(
        { ...base, affinitySchoolId: null },
        "norse",
      ),
    ).toBe("neutral");
  });
});

describe("getBlessingManaSurcharge", () => {
  it("returns 0 for self/allied/neutral", () => {
    expect(
      getBlessingManaSurcharge(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "norse",
      ),
    ).toBe(0);
    expect(
      getBlessingManaSurcharge(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "greek",
      ),
    ).toBe(0);
    expect(
      getBlessingManaSurcharge(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "egyptian",
      ),
    ).toBe(0);
  });

  it("returns the surcharge for opposed", () => {
    expect(
      getBlessingManaSurcharge(
        { ...base, affinitySchoolId: "bonehowl-of-fenrir" },
        "hindu",
      ),
    ).toBe(OPPOSED_BLESSING_MANA_COST);
  });

  it("surcharge and allied bonus are both positive small values", () => {
    expect(OPPOSED_BLESSING_MANA_COST).toBeGreaterThan(0);
    expect(OPPOSED_BLESSING_MANA_COST).toBeLessThanOrEqual(10);
    expect(ALLIED_PANTHEON_VISIT_MANA_BONUS).toBeGreaterThan(0);
    expect(ALLIED_PANTHEON_VISIT_MANA_BONUS).toBeLessThanOrEqual(5);
  });
});
