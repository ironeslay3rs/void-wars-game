/**
 * Tests for school + empire selectors.
 *
 * These tests pin the canonical 7-school structure so refactors can't
 * silently break the dual-face joins.
 */

import { describe, expect, it } from "vitest";

import {
  getAllEmpires,
  getEmpireById,
  getEmpireForPlayerAlignment,
  getEmpireForSchool,
} from "@/features/empires/empireSelectors";
import {
  getAllSchools,
  getEmpireForSchoolId,
  getEmpireRoute,
  getSchoolBySin,
  getSchoolById,
  getSchoolForLane,
  getSchoolForLaneRoute,
  getSchoolForOriginTag,
  getSchoolRoute,
  getSchoolsByEmpire,
  getSchoolsForPlayerAlignment,
} from "@/features/schools/schoolSelectors";
import type { SchoolId, SinId } from "@/features/schools/schoolTypes";

describe("empires", () => {
  it("has exactly 3 empires", () => {
    expect(getAllEmpires()).toHaveLength(3);
  });

  it("returns each empire by id", () => {
    expect(getEmpireById("bio").name).toBe("Bio Empire");
    expect(getEmpireById("mecha").name).toBe("Mecha Empire");
    expect(getEmpireById("pure").name).toBe("Pure Empire");
  });

  it("resolves empire from player alignment", () => {
    expect(getEmpireForPlayerAlignment("bio")?.id).toBe("bio");
    expect(getEmpireForPlayerAlignment("mecha")?.id).toBe("mecha");
    expect(getEmpireForPlayerAlignment("pure")?.id).toBe("pure");
    expect(getEmpireForPlayerAlignment("unbound")).toBeUndefined();
  });

  it("each empire owns at least 2 schools and at most 3", () => {
    for (const empire of getAllEmpires()) {
      expect(empire.schoolIds.length).toBeGreaterThanOrEqual(2);
      expect(empire.schoolIds.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("schools", () => {
  it("has exactly 7 schools", () => {
    expect(getAllSchools()).toHaveLength(7);
  });

  it("each school has a unique sin", () => {
    const sins = getAllSchools().map((s) => s.sin);
    expect(new Set(sins).size).toBe(7);
  });

  it("each school has a unique lane", () => {
    const lanes = getAllSchools().map((s) => s.laneId);
    expect(new Set(lanes).size).toBe(7);
  });

  it("seven schools cover all seven capital sins", () => {
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
      expect(getSchoolBySin(sin)).toBeDefined();
    }
  });

  it("getSchoolById returns the canonical entry", () => {
    expect(getSchoolById("bonehowl-of-fenrir").nation).toBe("Norway");
    expect(getSchoolById("mouth-of-inti").nation).toBe("Peru");
    expect(getSchoolById("flesh-thrones-of-olympus").nation).toBe("Greece");
    expect(getSchoolById("crimson-altars-of-astarte").nation).toBe("Lebanon");
    expect(getSchoolById("thousand-hands-of-vishrava").nation).toBe("India");
    expect(getSchoolById("divine-pharos-of-ra").nation).toBe("Egypt");
    expect(getSchoolById("clockwork-mandate-of-heaven").nation).toBe("China");
  });

  it("schools resolve to canonical empires", () => {
    expect(getEmpireForSchoolId("bonehowl-of-fenrir")?.id).toBe("bio");
    expect(getEmpireForSchoolId("flesh-thrones-of-olympus")?.id).toBe("bio");
    expect(getEmpireForSchoolId("crimson-altars-of-astarte")?.id).toBe("bio");
    expect(getEmpireForSchoolId("mouth-of-inti")?.id).toBe("pure");
    expect(getEmpireForSchoolId("thousand-hands-of-vishrava")?.id).toBe("pure");
    expect(getEmpireForSchoolId("divine-pharos-of-ra")?.id).toBe("mecha");
    expect(getEmpireForSchoolId("clockwork-mandate-of-heaven")?.id).toBe(
      "mecha",
    );
  });

  it("getEmpireForSchool matches getEmpireForSchoolId", () => {
    for (const school of getAllSchools()) {
      expect(getEmpireForSchool(school.id)?.id).toBe(school.empireId);
    }
  });

  it("Bio empire owns 3 schools, Mecha 2, Pure 2", () => {
    expect(getSchoolsByEmpire("bio")).toHaveLength(3);
    expect(getSchoolsByEmpire("mecha")).toHaveLength(2);
    expect(getSchoolsByEmpire("pure")).toHaveLength(2);
  });

  it("empire schoolIds match selector results", () => {
    for (const empire of getAllEmpires()) {
      const fromSelector = getSchoolsByEmpire(empire.id).map((s) => s.id);
      expect(new Set(fromSelector)).toEqual(new Set(empire.schoolIds));
    }
  });

  it("getSchoolForLane resolves all 7 lanes", () => {
    expect(getSchoolForLane("arena-of-blood")?.sin).toBe("wrath");
    expect(getSchoolForLane("feast-hall")?.sin).toBe("gluttony");
    expect(getSchoolForLane("mirror-house")?.sin).toBe("envy");
    expect(getSchoolForLane("velvet-den")?.sin).toBe("lust");
    expect(getSchoolForLane("golden-bazaar")?.sin).toBe("greed");
    expect(getSchoolForLane("ivory-tower")?.sin).toBe("pride");
    expect(getSchoolForLane("silent-garden")?.sin).toBe("sloth");
  });

  it("getSchoolForLaneRoute resolves the live black market routes", () => {
    expect(getSchoolForLaneRoute("/bazaar/black-market/feast-hall")?.id).toBe(
      "mouth-of-inti",
    );
    expect(
      getSchoolForLaneRoute("/bazaar/black-market/golden-bazaar")?.id,
    ).toBe("thousand-hands-of-vishrava");
    expect(
      getSchoolForLaneRoute("/bazaar/black-market/ivory-tower")?.id,
    ).toBe("divine-pharos-of-ra");
    expect(
      getSchoolForLaneRoute("/bazaar/black-market/silent-garden")?.id,
    ).toBe("clockwork-mandate-of-heaven");
  });

  it("getSchoolForOriginTag matches mission origin tags from M2", () => {
    expect(getSchoolForOriginTag("bonehowl-remnant")?.id).toBe(
      "bonehowl-of-fenrir",
    );
    expect(getSchoolForOriginTag("mouth-of-inti-relic")?.id).toBe(
      "mouth-of-inti",
    );
    expect(getSchoolForOriginTag("olympus-castoff")?.id).toBe(
      "flesh-thrones-of-olympus",
    );
    expect(getSchoolForOriginTag("crimson-altar-contraband")?.id).toBe(
      "crimson-altars-of-astarte",
    );
    expect(getSchoolForOriginTag("thousand-hands-fragment")?.id).toBe(
      "thousand-hands-of-vishrava",
    );
    expect(getSchoolForOriginTag("pharos-surplus")?.id).toBe(
      "divine-pharos-of-ra",
    );
    expect(getSchoolForOriginTag("mandate-salvage")?.id).toBe(
      "clockwork-mandate-of-heaven",
    );
  });

  it("getSchoolForOriginTag returns undefined for the catch-all local tag", () => {
    expect(getSchoolForOriginTag("black-market-local")).toBeUndefined();
  });

  it("getSchoolsForPlayerAlignment returns schools for the empire", () => {
    expect(getSchoolsForPlayerAlignment("bio")).toHaveLength(3);
    expect(getSchoolsForPlayerAlignment("mecha")).toHaveLength(2);
    expect(getSchoolsForPlayerAlignment("pure")).toHaveLength(2);
    expect(getSchoolsForPlayerAlignment("unbound")).toHaveLength(0);
  });

  it("route helpers produce expected URLs", () => {
    const id: SchoolId = "bonehowl-of-fenrir";
    expect(getSchoolRoute(id)).toBe("/schools/bonehowl-of-fenrir");
    expect(getEmpireRoute("bio")).toBe("/empires/bio");
  });
});
