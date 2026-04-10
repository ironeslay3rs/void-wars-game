import { describe, expect, it } from "vitest";

import {
  PANTHEONS,
  PANTHEON_ORDER,
} from "@/features/pantheons/pantheonData";
import {
  getAllPantheons,
  getPantheonById,
  getPantheonByDisplayName,
  getPantheonForSchool,
  getPantheonRoute,
  getPantheonsForEmpire,
} from "@/features/pantheons/pantheonSelectors";
import { SCHOOLS, SCHOOL_ORDER } from "@/features/schools/schoolData";

describe("pantheon data structure", () => {
  it("contains exactly 7 pantheons matching the canonical order length", () => {
    expect(PANTHEON_ORDER.length).toBe(7);
    expect(Object.keys(PANTHEONS).length).toBe(7);
  });

  it("every pantheon id is unique and has matching record entry", () => {
    const seen = new Set<string>();
    for (const id of PANTHEON_ORDER) {
      expect(seen.has(id)).toBe(false);
      seen.add(id);
      expect(PANTHEONS[id]).toBeDefined();
      expect(PANTHEONS[id].id).toBe(id);
    }
  });

  it("each pantheon points to a real school via schoolId", () => {
    for (const pantheon of getAllPantheons()) {
      expect(SCHOOLS[pantheon.schoolId]).toBeDefined();
    }
  });

  it("school <-> pantheon is a 1:1 join: every school resolves to exactly one pantheon", () => {
    for (const schoolId of SCHOOL_ORDER) {
      const pantheon = getPantheonForSchool(schoolId);
      expect(pantheon).toBeDefined();
      expect(pantheon!.schoolId).toBe(schoolId);
    }
  });

  it("each pantheon has non-empty lore fields", () => {
    for (const pantheon of getAllPantheons()) {
      expect(pantheon.name.length).toBeGreaterThan(0);
      expect(pantheon.region.length).toBeGreaterThan(0);
      expect(pantheon.era.length).toBeGreaterThan(0);
      expect(pantheon.domain.length).toBeGreaterThan(0);
      expect(pantheon.remnant.length).toBeGreaterThan(0);
      expect(pantheon.longForm.length).toBeGreaterThan(50);
      expect(pantheon.accentHex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("each pantheon's accent matches its linked school's accent", () => {
    for (const pantheon of getAllPantheons()) {
      const school = SCHOOLS[pantheon.schoolId];
      expect(pantheon.accentHex.toLowerCase()).toBe(school.accentHex.toLowerCase());
    }
  });
});

describe("pantheon selectors", () => {
  it("getPantheonById returns the same record indexed by id", () => {
    expect(getPantheonById("norse").schoolId).toBe("bonehowl-of-fenrir");
    expect(getPantheonById("inca").schoolId).toBe("mouth-of-inti");
    expect(getPantheonById("egyptian").schoolId).toBe("divine-pharos-of-ra");
  });

  it("getPantheonsForEmpire returns the right child pantheons per empire", () => {
    const bio = getPantheonsForEmpire("bio");
    expect(bio.map((p) => p.id).sort()).toEqual(
      ["canaanite", "greek", "norse"].sort(),
    );
    const mecha = getPantheonsForEmpire("mecha");
    expect(mecha.map((p) => p.id).sort()).toEqual(["chinese", "egyptian"].sort());
    const pure = getPantheonsForEmpire("pure");
    expect(pure.map((p) => p.id).sort()).toEqual(["hindu", "inca"].sort());
  });

  it("empire pantheon counts add up to 7 across the 3 empires", () => {
    const total =
      getPantheonsForEmpire("bio").length +
      getPantheonsForEmpire("mecha").length +
      getPantheonsForEmpire("pure").length;
    expect(total).toBe(7);
  });

  it("getPantheonRoute builds /pantheons/<id>", () => {
    expect(getPantheonRoute("norse")).toBe("/pantheons/norse");
    expect(getPantheonRoute("chinese")).toBe("/pantheons/chinese");
  });

  it("getPantheonByDisplayName matches case-insensitively against canon labels", () => {
    expect(getPantheonByDisplayName("Norse")?.id).toBe("norse");
    expect(getPantheonByDisplayName("hindu")?.id).toBe("hindu");
    expect(getPantheonByDisplayName("CANAANITE")?.id).toBe("canaanite");
    expect(getPantheonByDisplayName("Atlantean")).toBeUndefined();
  });

  it("every school's pantheon display string resolves to a canonical pantheon", () => {
    for (const schoolId of SCHOOL_ORDER) {
      const school = SCHOOLS[schoolId];
      const pantheon = getPantheonByDisplayName(school.pantheon);
      expect(pantheon).toBeDefined();
      // And the resolved pantheon's schoolId must round-trip back.
      expect(pantheon!.schoolId).toBe(schoolId);
    }
  });
});
