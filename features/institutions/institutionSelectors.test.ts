/**
 * Tests for sin institution selectors.
 *
 * Pins the canonical 7-institution structure and the institution↔school↔lane↔sin
 * joins so refactors can't silently break the social-spine layer.
 */

import { describe, expect, it } from "vitest";

import {
  getAllInstitutions,
  getInstitutionById,
  getInstitutionForLane,
  getInstitutionForSchool,
  getInstitutionForSin,
} from "@/features/institutions/institutionSelectors";
import { getAllSchools } from "@/features/schools/schoolSelectors";
import type { SinId } from "@/features/schools/schoolTypes";

describe("institutions", () => {
  it("has exactly 7 institutions", () => {
    expect(getAllInstitutions()).toHaveLength(7);
  });

  it("each institution has a unique sin", () => {
    const sins = getAllInstitutions().map((i) => i.sin);
    expect(new Set(sins).size).toBe(7);
  });

  it("each institution has a unique school", () => {
    const schools = getAllInstitutions().map((i) => i.schoolId);
    expect(new Set(schools).size).toBe(7);
  });

  it("each institution has a unique lane", () => {
    const lanes = getAllInstitutions().map((i) => i.laneId);
    expect(new Set(lanes).size).toBe(7);
  });

  it("seven institutions cover all seven capital sins", () => {
    const expected: SinId[] = [
      "wrath",
      "gluttony",
      "envy",
      "lust",
      "greed",
      "pride",
      "sloth",
    ];
    for (const sin of expected) {
      expect(getInstitutionForSin(sin)).toBeDefined();
    }
  });

  it("getInstitutionById returns the canonical entries", () => {
    expect(getInstitutionById("bonehowl-syndicate").sin).toBe("wrath");
    expect(getInstitutionById("inti-court").sin).toBe("gluttony");
    expect(getInstitutionById("olympus-concord").sin).toBe("envy");
    expect(getInstitutionById("astarte-veil").sin).toBe("lust");
    expect(getInstitutionById("vishrava-ledger").sin).toBe("greed");
    expect(getInstitutionById("pharos-conclave").sin).toBe("pride");
    expect(getInstitutionById("mandate-bureau").sin).toBe("sloth");
  });

  it("Bonehowl Syndicate is the only canon-locked entry from the Puppy spinoff", () => {
    expect(getInstitutionById("bonehowl-syndicate").canonSource).toBe(
      "puppy-spinoff",
    );
    // Every other institution is game-specific and tracked in
    // VOID_WARS_CANON_GAPS.md.
    const others = getAllInstitutions().filter(
      (i) => i.id !== "bonehowl-syndicate",
    );
    for (const inst of others) {
      expect(inst.canonSource).toBe("game-specific");
    }
  });

  it("every school resolves to an institution", () => {
    for (const school of getAllSchools()) {
      const inst = getInstitutionForSchool(school.id);
      expect(inst).toBeDefined();
      expect(inst?.sin).toBe(school.sin);
      expect(inst?.laneId).toBe(school.laneId);
    }
  });

  it("every lane resolves to an institution", () => {
    expect(getInstitutionForLane("arena-of-blood")?.sin).toBe("wrath");
    expect(getInstitutionForLane("feast-hall")?.sin).toBe("gluttony");
    expect(getInstitutionForLane("mirror-house")?.sin).toBe("envy");
    expect(getInstitutionForLane("velvet-den")?.sin).toBe("lust");
    expect(getInstitutionForLane("golden-bazaar")?.sin).toBe("greed");
    expect(getInstitutionForLane("ivory-tower")?.sin).toBe("pride");
    expect(getInstitutionForLane("silent-garden")?.sin).toBe("sloth");
  });

  it("school↔institution↔lane round trip is consistent", () => {
    for (const school of getAllSchools()) {
      const inst = getInstitutionForSchool(school.id);
      expect(inst).toBeDefined();
      const laneInst = getInstitutionForLane(inst!.laneId);
      expect(laneInst?.id).toBe(inst!.id);
    }
  });
});
