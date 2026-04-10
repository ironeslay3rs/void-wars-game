import { describe, expect, it } from "vitest";

import {
  SIN_ABILITIES,
  SIN_ABILITY_ORDER,
} from "@/features/sins/sinAbilityTypes";
import { SCHOOLS, SCHOOL_ORDER } from "@/features/schools/schoolData";

describe("SIN_ABILITIES scaffold", () => {
  it("has exactly 7 entries — one per canonical sin", () => {
    expect(SIN_ABILITY_ORDER).toHaveLength(7);
    expect(Object.keys(SIN_ABILITIES)).toHaveLength(7);
  });

  it("every ability maps to a unique sin (no duplicates)", () => {
    const sins = SIN_ABILITY_ORDER.map((id) => SIN_ABILITIES[id].sin);
    expect(new Set(sins).size).toBe(7);
  });

  it("every ability's sin exists in the school data (sin ↔ school join holds)", () => {
    for (const id of SIN_ABILITY_ORDER) {
      const ability = SIN_ABILITIES[id];
      const school = SCHOOL_ORDER.map((sid) => SCHOOLS[sid]).find(
        (s) => s.sin === ability.sin,
      );
      expect(school).toBeDefined();
    }
  });

  it("every ability's pressure matches the school's pressure identity", () => {
    for (const id of SIN_ABILITY_ORDER) {
      const ability = SIN_ABILITIES[id];
      const school = SCHOOL_ORDER.map((sid) => SCHOOLS[sid]).find(
        (s) => s.sin === ability.sin,
      )!;
      expect(ability.pressure).toBe(school.pressure);
    }
  });

  it("every ability is flagged as placeholder (no mechanics yet)", () => {
    for (const id of SIN_ABILITY_ORDER) {
      expect(SIN_ABILITIES[id].placeholder).toBe(true);
    }
  });

  it("every ability has non-empty lore fields", () => {
    for (const id of SIN_ABILITY_ORDER) {
      const a = SIN_ABILITIES[id];
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(20);
      expect(a.longForm.length).toBeGreaterThan(50);
    }
  });
});
