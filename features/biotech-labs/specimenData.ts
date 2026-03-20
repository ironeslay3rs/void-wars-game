import type { LatestHuntResult } from "@/features/game/gameTypes";

export type BiotechSpecimenDefinition = {
  missionId: string;
  name: string;
  category: string;
  threatLabel: string;
  description: string;
};

const biotechSpecimenDefinitions: Record<string, BiotechSpecimenDefinition> = {
  "bio-hunt-specimen": {
    missionId: "bio-hunt-specimen",
    name: "Thornmaw Stalker",
    category: "Adaptive Predator",
    threatLabel: "Threat Tier Gamma",
    description:
      "A sinew-wrapped wasteland hunter that nests in broken biotech ruins and reacts violently to active signal sweeps.",
  },
};

export function getBiotechSpecimenByMissionId(missionId: string) {
  return biotechSpecimenDefinitions[missionId] ?? null;
}

export function getActiveBiotechSpecimen(hasBiotechSpecimenLead: boolean) {
  if (!hasBiotechSpecimenLead) {
    return null;
  }

  return getBiotechSpecimenByMissionId("bio-hunt-specimen");
}

export function getLatestBiotechSpecimen(result: LatestHuntResult | null) {
  if (!result) {
    return null;
  }

  return getBiotechSpecimenByMissionId(result.missionId);
}
