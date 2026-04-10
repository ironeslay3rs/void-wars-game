/**
 * Pantheon selectors — read-only joins.
 *
 * Joins:
 *  - id → pantheon (1:1)
 *  - schoolId → pantheon (1:1)
 *  - empireId → pantheon[] (1:many, via the school → empire join)
 *
 * Routes:
 *  - getPantheonRoute(id) → "/pantheons/<id>"
 */

import type { EmpireId } from "@/features/empires/empireTypes";
import {
  PANTHEONS,
  PANTHEON_ORDER,
} from "@/features/pantheons/pantheonData";
import type {
  Pantheon,
  PantheonId,
} from "@/features/pantheons/pantheonTypes";
import { SCHOOLS } from "@/features/schools/schoolData";
import type { SchoolId } from "@/features/schools/schoolTypes";

export function getPantheonById(id: PantheonId): Pantheon {
  return PANTHEONS[id];
}

export function getAllPantheons(): Pantheon[] {
  return PANTHEON_ORDER.map((id) => PANTHEONS[id]);
}

export function getPantheonForSchool(schoolId: SchoolId): Pantheon | undefined {
  return getAllPantheons().find((p) => p.schoolId === schoolId);
}

export function getPantheonsForEmpire(empireId: EmpireId): Pantheon[] {
  return getAllPantheons().filter((p) => {
    const school = SCHOOLS[p.schoolId];
    return school?.empireId === empireId;
  });
}

export function getPantheonRoute(id: PantheonId): string {
  return `/pantheons/${id}`;
}

/**
 * Convenience: resolve a pantheon by its display string from `school.pantheon`
 * (which historically held a free-form label like "Norse"). Used by code
 * paths that already have the school but want the canonical pantheon entry.
 */
export function getPantheonByDisplayName(name: string): Pantheon | undefined {
  const lowered = name.toLowerCase();
  return getAllPantheons().find((p) => p.name.toLowerCase() === lowered);
}
