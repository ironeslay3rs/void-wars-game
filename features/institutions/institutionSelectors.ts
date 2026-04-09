/**
 * Sin institution selectors — derive institution identity from any of the
 * world's join keys (sin, school, lane).
 *
 * Each institution is one-to-one with its sin, school, and lane, so every
 * lookup is total (returns Institution, not Institution | undefined) when
 * the input is a valid canonical id. Selectors that take generic strings
 * fall back to undefined.
 */

import {
  INSTITUTION_ORDER,
  INSTITUTIONS,
} from "@/features/institutions/institutionData";
import type {
  Institution,
  InstitutionId,
} from "@/features/institutions/institutionTypes";
import type {
  BlackMarketLaneId,
  SchoolId,
  SinId,
} from "@/features/schools/schoolTypes";

export function getInstitutionById(id: InstitutionId): Institution {
  return INSTITUTIONS[id];
}

export function getAllInstitutions(): Institution[] {
  return INSTITUTION_ORDER.map((id) => INSTITUTIONS[id]);
}

export function getInstitutionForSchool(
  schoolId: SchoolId,
): Institution | undefined {
  return getAllInstitutions().find((i) => i.schoolId === schoolId);
}

export function getInstitutionForLane(
  laneId: BlackMarketLaneId,
): Institution | undefined {
  return getAllInstitutions().find((i) => i.laneId === laneId);
}

export function getInstitutionForSin(
  sin: SinId,
): Institution | undefined {
  return getAllInstitutions().find((i) => i.sin === sin);
}
