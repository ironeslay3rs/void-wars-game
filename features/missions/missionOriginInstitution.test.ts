/**
 * Tests for mission origin tag ↔ sin institution joins.
 *
 * Phase 9 unlock 2: each sin-aligned mission origin tag carries an
 * `institutionId` naming the operating org the contract leaked from.
 * These tests pin every join so the rumor-board narrative can't drift
 * silently.
 */

import { describe, expect, it } from "vitest";

import { getInstitutionById } from "@/features/institutions/institutionSelectors";
import type { InstitutionId } from "@/features/institutions/institutionTypes";
import {
  getOriginTag,
  missionOriginTags,
  type MissionOriginTagId,
} from "@/features/missions/missionOriginTags";
import {
  getSchoolForOriginTag,
  getSchoolsByEmpire,
} from "@/features/schools/schoolSelectors";

const INSTITUTION_BY_TAG: Record<MissionOriginTagId, InstitutionId | null> = {
  "bonehowl-remnant": "bonehowl-syndicate",
  "olympus-castoff": "olympus-concord",
  "crimson-altar-contraband": "astarte-veil",
  "pharos-surplus": "pharos-conclave",
  "mandate-salvage": "mandate-bureau",
  "mouth-of-inti-relic": "inti-court",
  "thousand-hands-fragment": "vishrava-ledger",
  "black-market-local": null,
};

describe("mission origin ↔ institution joins", () => {
  it("every origin tag has an institutionId field set (id or null)", () => {
    const allIds = Object.keys(missionOriginTags) as MissionOriginTagId[];
    for (const id of allIds) {
      const tag = getOriginTag(id);
      expect("institutionId" in tag).toBe(true);
      expect(tag.institutionId !== undefined).toBe(true);
    }
  });

  it("each origin tag maps to its expected institution (7 affiliated, 1 null)", () => {
    const allIds = Object.keys(missionOriginTags) as MissionOriginTagId[];
    for (const id of allIds) {
      const tag = getOriginTag(id);
      expect(tag.institutionId).toBe(INSTITUTION_BY_TAG[id]);
    }
  });

  it("exactly 7 origin tags are affiliated and 1 (black-market-local) is null", () => {
    const allTags = Object.values(missionOriginTags);
    const affiliated = allTags.filter((t) => t.institutionId !== null);
    const factionless = allTags.filter((t) => t.institutionId === null);
    expect(affiliated).toHaveLength(7);
    expect(factionless).toHaveLength(1);
    expect(factionless[0].id).toBe("black-market-local");
  });

  it("every affiliated origin tag resolves to a real institution", () => {
    for (const tag of Object.values(missionOriginTags)) {
      if (!tag.institutionId) continue;
      const inst = getInstitutionById(tag.institutionId);
      expect(inst).toBeDefined();
      expect(inst.id).toBe(tag.institutionId);
    }
  });

  it("each origin tag's institution sin matches the tag's school sin", () => {
    // Closes the rumor-board contract: an origin tag resolves to a
    // school AND an institution, and both must agree on which sin they
    // embody. Guards against accidentally tagging Bonehowl loot with
    // the Inti Court.
    for (const tag of Object.values(missionOriginTags)) {
      if (!tag.institutionId) continue;
      const school = getSchoolForOriginTag(tag.id);
      expect(school).toBeDefined();
      const inst = getInstitutionById(tag.institutionId);
      expect(inst.sin).toBe(school!.sin);
      expect(inst.schoolId).toBe(school!.id);
    }
  });

  it("the canon-locked Bonehowl Syndicate owns the bonehowl-remnant tag", () => {
    expect(missionOriginTags["bonehowl-remnant"].institutionId).toBe(
      "bonehowl-syndicate",
    );
    const inst = getInstitutionById("bonehowl-syndicate");
    expect(inst.canonSource).toBe("puppy-spinoff");
  });

  it("every empire's schools are represented by at least one origin tag's institution", () => {
    // Sanity: the 7 affiliated tags should hit all 7 schools across the
    // 3 empires. If any empire is missing an origin tag, the rumor board
    // can't surface contracts from one whole branch of the world.
    const tagInstitutionIds = Object.values(missionOriginTags)
      .map((t) => t.institutionId)
      .filter((id): id is InstitutionId => id !== null);
    const tagInstitutionSchools = new Set(
      tagInstitutionIds.map((id) => getInstitutionById(id).schoolId),
    );

    for (const empire of ["bio", "mecha", "pure"] as const) {
      const empireSchoolIds = getSchoolsByEmpire(empire).map((s) => s.id);
      const covered = empireSchoolIds.some((sid) =>
        tagInstitutionSchools.has(sid),
      );
      expect(covered).toBe(true);
    }
  });
});
