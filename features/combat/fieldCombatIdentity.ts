import type { PlayerState } from "@/features/game/gameTypes";
import type { StrikeSnapshot } from "@/features/combat/strikeSnapshot";
import { syntheticRuneMasteryFromSnapshot } from "@/features/combat/strikeSnapshot";
import {
  getExecutionalTier,
  maxRuneDepthAcrossSchools,
} from "@/features/mastery/runeMasteryLogic";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { getPrimaryRuneSchool } from "@/features/mastery/runeMasteryTypes";

export type SchoolCombatPassive = {
  id: string;
  school: RuneSchool | "neutral";
  label: string;
  effectLine: string;
  active: boolean;
};

export function getVisibleStrikeSchool(
  player: PlayerState,
): "bio" | "mecha" | "pure" | "neutral" {
  const primary = getPrimaryRuneSchool(player.factionAlignment);
  if (primary) return primary;
  return "neutral";
}

/**
 * Shell “skill tree” — passives derived from primary path, depth, Executional tier, loadout.
 */
export function getSchoolCombatPassives(player: PlayerState): SchoolCombatPassive[] {
  const primary = getPrimaryRuneSchool(player.factionAlignment);
  if (!primary) {
    return [
      {
        id: "neutral-foundation",
        school: "neutral",
        label: "Open alignment",
        effectLine:
          "Bind a path on Character to unlock school passives on the field.",
        active: true,
      },
    ];
  }

  const depth = maxRuneDepthAcrossSchools(player.runeMastery);
  const tier = getExecutionalTier(player.runeMastery, primary);
  const schoolDepth = player.runeMastery.depthBySchool[primary];
  const deepOk = depth >= 4 || tier >= 1;

  if (primary === "bio") {
    return [
      {
        id: "bio-serrate",
        school: "bio",
        label: "Serrate rhythm",
        effectLine:
          "Depth 2+: +10% posture pressure with Assault or Breacher loadout.",
        active:
          schoolDepth >= 2 &&
          (player.fieldLoadoutProfile === "assault" ||
            player.fieldLoadoutProfile === "support"),
      },
      {
        id: "bio-bloom",
        school: "bio",
        label: "Bloom fracture",
        effectLine:
          "Depth 4+ or Executional L2+: exposed targets take +5% extra strike damage.",
        active: deepOk,
      },
    ];
  }

  if (primary === "mecha") {
    return [
      {
        id: "mecha-penetrator",
        school: "mecha",
        label: "Penetrator plates",
        effectLine: "Depth 2+: +4 damage vs armored shell targets.",
        active: schoolDepth >= 2,
      },
      {
        id: "mecha-overclock",
        school: "mecha",
        label: "Overclock clause",
        effectLine: "Depth 4+ or Executional L2+: +3% strike damage.",
        active: deepOk,
      },
    ];
  }

  return [
    {
      id: "pure-pulse",
      school: "pure",
      label: "Pulse cadence",
      effectLine: "Depth 2+: first strike after a posture break +10% damage.",
      active: schoolDepth >= 2,
    },
    {
      id: "pure-lattice",
      school: "pure",
      label: "Lattice echo",
      effectLine: "Depth 4+ or Executional L2+: +8% posture fill.",
      active: deepOk,
    },
  ];
}

export function getShellPostureFillSchoolMult(player: PlayerState): number {
  const school = getPrimaryRuneSchool(player.factionAlignment);
  if (school !== "pure") return 1;
  const depth = maxRuneDepthAcrossSchools(player.runeMastery);
  const tier = getExecutionalTier(player.runeMastery, "pure");
  if (depth >= 4 || tier >= 1) return 1.08;
  return 1;
}

export function getShellStrikeSchoolDamageMult(
  player: PlayerState,
): number {
  const school = getPrimaryRuneSchool(player.factionAlignment);
  if (!school) return 1;
  const depth = maxRuneDepthAcrossSchools(player.runeMastery);
  const tier = getExecutionalTier(player.runeMastery, school);
  let m = 1;
  if (
    school === "bio" &&
    (player.fieldLoadoutProfile === "assault" ||
      player.fieldLoadoutProfile === "support")
  ) {
    if (player.runeMastery.depthBySchool.bio >= 2) m *= 1.05;
  }
  if (school === "bio" && (depth >= 4 || tier >= 1)) {
    m *= 1.05;
  }
  if (school === "mecha" && (depth >= 4 || tier >= 1)) {
    m *= 1.03;
  }
  return m;
}

export function getShellMechaVsBulwarkFlat(player: PlayerState): number {
  const school = getPrimaryRuneSchool(player.factionAlignment);
  if (school !== "mecha") return 0;
  if (player.runeMastery.depthBySchool.mecha < 2) return 0;
  return 4;
}

function strikeShim(s: StrikeSnapshot): PlayerState {
  return {
    factionAlignment: s.factionAlignment,
    fieldLoadoutProfile: s.fieldLoadoutProfile,
    runeMastery: syntheticRuneMasteryFromSnapshot(s),
  } as PlayerState;
}

export function getShellPostureFillSchoolMultSnap(s: StrikeSnapshot): number {
  return getShellPostureFillSchoolMult(strikeShim(s));
}

export function getShellStrikeSchoolDamageMultSnap(s: StrikeSnapshot): number {
  return getShellStrikeSchoolDamageMult(strikeShim(s));
}

export function getShellMechaVsBulwarkFlatSnap(s: StrikeSnapshot): number {
  return getShellMechaVsBulwarkFlat(strikeShim(s));
}
