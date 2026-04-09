/**
 * Empire selectors — derive empire identity from various world references.
 */

import { EMPIRES, EMPIRE_ORDER } from "@/features/empires/empireData";
import type { Empire, EmpireId } from "@/features/empires/empireTypes";
import type { FactionAlignment } from "@/features/game/gameTypes";
import type { SchoolId } from "@/features/schools/schoolTypes";
import { SCHOOLS } from "@/features/schools/schoolData";

export function getEmpireById(id: EmpireId): Empire {
  return EMPIRES[id];
}

export function getAllEmpires(): Empire[] {
  return EMPIRE_ORDER.map((id) => EMPIRES[id]);
}

export function getEmpireForSchool(schoolId: SchoolId): Empire | undefined {
  const school = SCHOOLS[schoolId];
  if (!school) return undefined;
  return EMPIRES[school.empireId];
}

export function getEmpireForPlayerAlignment(
  alignment: FactionAlignment,
): Empire | undefined {
  if (alignment === "unbound") return undefined;
  return EMPIRES[alignment];
}

/** Empire id from a player alignment, treating "unbound" as no parent. */
export function empireIdForAlignment(
  alignment: FactionAlignment,
): EmpireId | undefined {
  if (alignment === "unbound") return undefined;
  return alignment;
}
