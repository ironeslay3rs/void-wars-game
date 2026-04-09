/**
 * School selectors — resolve schools from lanes, origin tags, empires, and zones.
 *
 * The fundamental joins:
 *  - lane → school (1:1)
 *  - origin tag → school (1:1, occasionally many tags map to one school)
 *  - empire → schools (1:many)
 *  - school → empire (many:1)
 *  - zone → school[] (zone doctrine pressure resolves to dominant school)
 */

import type { Empire, EmpireId } from "@/features/empires/empireTypes";
import { getEmpireById } from "@/features/empires/empireSelectors";
import type {
  FactionAlignment,
  MissionOriginTagId,
} from "@/features/game/gameTypes";
import { SCHOOLS, SCHOOL_ORDER } from "@/features/schools/schoolData";
import type {
  BlackMarketLaneId,
  School,
  SchoolId,
  SinId,
} from "@/features/schools/schoolTypes";

export function getSchoolById(id: SchoolId): School {
  return SCHOOLS[id];
}

export function getAllSchools(): School[] {
  return SCHOOL_ORDER.map((id) => SCHOOLS[id]);
}

export function getSchoolsByEmpire(empireId: EmpireId): School[] {
  return SCHOOL_ORDER.map((id) => SCHOOLS[id]).filter(
    (s) => s.empireId === empireId,
  );
}

/** Schools the player is currently aligned with by faction (1-3 of them). */
export function getSchoolsForPlayerAlignment(
  alignment: FactionAlignment,
): School[] {
  if (alignment === "unbound") return [];
  return getSchoolsByEmpire(alignment);
}

export function getSchoolForLane(
  laneId: BlackMarketLaneId,
): School | undefined {
  return getAllSchools().find((s) => s.laneId === laneId);
}

/**
 * Resolve a black market lane route (e.g. "/bazaar/black-market/feast-hall")
 * to its open-face school. Returns undefined for unmapped routes.
 */
export function getSchoolForLaneRoute(route: string): School | undefined {
  return getAllSchools().find((s) => s.laneRoute === route);
}

export function getSchoolForOriginTag(
  tagId: MissionOriginTagId,
): School | undefined {
  return getAllSchools().find((s) => s.originTagIds.includes(tagId));
}

export function getSchoolBySin(sin: SinId): School | undefined {
  return getAllSchools().find((s) => s.sin === sin);
}

/**
 * Resolve the empire for a given school via the school → empire join.
 * Convenience wrapper so callers don't need to import empire selectors.
 */
export function getEmpireForSchoolId(schoolId: SchoolId): Empire | undefined {
  const school = SCHOOLS[schoolId];
  if (!school) return undefined;
  return getEmpireById(school.empireId);
}

/**
 * Build the route for a school HQ page.
 */
export function getSchoolRoute(schoolId: SchoolId): string {
  return `/schools/${schoolId}`;
}

/**
 * Build the route for an empire detail page.
 */
export function getEmpireRoute(empireId: EmpireId): string {
  return `/empires/${empireId}`;
}
