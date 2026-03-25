import type { LatestHuntResult } from "@/features/game/gameTypes";
import { assets } from "@/lib/assets";

export type BiotechSpecimenDefinition = {
  missionId: string;
  name: string;
  category: string;
  threatLabel: string;
  description: string;
  creatureAsset: string;
  bossAsset: string;
};

const biotechSpecimenDefinitions: Record<string, BiotechSpecimenDefinition> = {
  "voidfield-prowl": {
    missionId: "voidfield-prowl",
    name: "Voidfield Prowler",
    category: "Neutral Predator",
    threatLabel: "Threat Tier Beta",
    description:
      "A perimeter scavenger that hunts the dead edges around the citadel and leaves behind salvageable residue, shard dust, and torn tissue.",
    creatureAsset: assets.creatures.shadowWolf,
    bossAsset: assets.bosses.voidMaw,
  },
  "bio-hunt-specimen": {
    missionId: "bio-hunt-specimen",
    name: "Thornmaw Stalker",
    category: "Adaptive Predator",
    threatLabel: "Threat Tier Gamma",
    description:
      "A sinew-wrapped wasteland hunter that nests in broken biotech ruins and reacts violently to active signal sweeps.",
    creatureAsset: assets.creatures.shadowWolf,
    bossAsset: assets.bosses.voidMaw,
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
