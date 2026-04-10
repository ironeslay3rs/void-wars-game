import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import type { PlayerState } from "@/features/game/gameTypes";
import {
  getFieldLoadoutExposeDamageMult,
  getFieldLoadoutPostureFillMult,
  getFieldLoadoutStrikeMult,
} from "@/features/combat/fieldLoadout";
import {
  getShellMechaVsBulwarkFlatSnap,
  getShellPostureFillSchoolMultSnap,
  getShellStrikeSchoolDamageMultSnap,
} from "@/features/combat/fieldCombatIdentity";
import { getActiveShellDamageBonusPct } from "@/features/combat/shellAbilities";
import {
  getExecutionalTier,
  maxRuneDepthAcrossSchools,
} from "@/features/mastery/runeMasteryLogic";
import { getPrimaryRuneSchool } from "@/features/mastery/runeMasteryTypes";
import {
  strikeSnapshotFromPlayer,
  syntheticRuneMasteryFromSnapshot,
  type StrikeSnapshot,
} from "@/features/combat/strikeSnapshot";

export type ShellArchetype = "skirmisher" | "bulwark" | "volatile" | "apex";

const VOLATILE_POSTURE_MULT = 1.12;
const APEX_HP_MULT = 1.12;

export function archetypeFlatArmor(archetype?: ShellArchetype): number {
  if (archetype === "bulwark") return 5;
  if (archetype === "apex") return 2;
  return 0;
}

export function archetypePostureVictimMul(archetype?: ShellArchetype): number {
  if (archetype === "volatile") return VOLATILE_POSTURE_MULT;
  return 1;
}

export function archetypeHpMul(archetype?: ShellArchetype): number {
  if (archetype === "apex") return APEX_HP_MULT;
  return 1;
}

export type ShellHitOutcome = {
  mob: MobEntity;
  damageDealt: number;
  grantedExpose: boolean;
  hitDuringExpose: boolean;
  contributedExposeCredit: boolean;
};

export function resolveShellHitWithSnapshot(
  mob: MobEntity,
  rawBaseDamage: number,
  snap: StrikeSnapshot,
): ShellHitOutcome {
  const profile = snap.fieldLoadoutProfile ?? "assault";
  const archetype = mob.shellArchetype;
  const rm = syntheticRuneMasteryFromSnapshot(snap);

  // M3: active shell buff damage multiplier (e.g. Surge +50%).
  // Composes multiplicatively BEFORE loadout + school mults so the
  // buff scales with the player's full kit, not just base damage.
  const buffBonusPct = getActiveShellDamageBonusPct(
    snap.activeShellBuffs ?? [],
    Date.now(),
  );
  const buffMult = 1 + buffBonusPct / 100;

  let dmg = Math.max(
    1,
    Math.round(
      rawBaseDamage *
        buffMult *
        getFieldLoadoutStrikeMult(profile) *
        getShellStrikeSchoolDamageMultSnap(snap),
    ),
  );

  if (mob.shellPurePulseNext) {
    dmg = Math.max(1, Math.floor(dmg * 1.1));
  }

  const armor = archetypeFlatArmor(archetype);
  const mechaFlat =
    archetype === "bulwark" ? getShellMechaVsBulwarkFlatSnap(snap) : 0;
  const coreDmg = Math.max(1, dmg - armor + mechaFlat);

  const postureMax = mob.shellPostureMax ?? 0;
  let posture = mob.shellPosture ?? 0;
  let exposedHits = mob.shellExposedHitsRemaining ?? 0;
  const hitDuringExpose = exposedHits > 0;
  let grantedExpose = false;

  if (postureMax > 0) {
    const fillBase =
      coreDmg *
      getFieldLoadoutPostureFillMult(profile) *
      getShellPostureFillSchoolMultSnap(snap) *
      archetypePostureVictimMul(archetype);

    let fill = fillBase;
    if (
      snap.factionAlignment === "bio" &&
      snap.depthBySchool.bio >= 2 &&
      (profile === "assault" || profile === "support")
    ) {
      fill *= 1.1;
    }

    posture += fill;
    if (posture >= postureMax) {
      posture = 0;
      exposedHits = 2;
      grantedExpose = true;
    }
  }

  let finalDmg = coreDmg;
  if (exposedHits > 0) {
    const primary = getPrimaryRuneSchool(snap.factionAlignment);
    const depth = maxRuneDepthAcrossSchools(rm);
    const tier = primary ? getExecutionalTier(rm, primary) : 0;
    if (primary === "bio" && (depth >= 4 || tier >= 1)) {
      finalDmg = Math.max(1, Math.floor(finalDmg * 1.05));
    }

    const expo = getFieldLoadoutExposeDamageMult(profile);
    finalDmg = Math.max(1, Math.floor(finalDmg * expo));
    exposedHits -= 1;
  }

  const hp = Math.max(0, mob.hp - finalDmg);

  const purePulseNext =
    grantedExpose &&
    snap.factionAlignment === "pure" &&
    snap.depthBySchool.pure >= 2;

  const exposeCredit =
    !!(mob.shellKillCreditExposed || (hitDuringExpose && finalDmg > 0));

  const next: MobEntity = {
    ...mob,
    hp,
    shellPosture: postureMax > 0 ? posture : undefined,
    shellPostureMax: postureMax > 0 ? postureMax : undefined,
    shellExposedHitsRemaining: exposedHits > 0 ? exposedHits : undefined,
    shellPurePulseNext: purePulseNext ? true : undefined,
    shellKillCreditExposed: exposeCredit ? true : undefined,
  };

  if (postureMax <= 0) {
    delete next.shellPosture;
    delete next.shellPostureMax;
  }

  return {
    mob: next,
    damageDealt: finalDmg,
    grantedExpose,
    hitDuringExpose,
    contributedExposeCredit: hitDuringExpose && finalDmg > 0,
  };
}

export function resolveShellHit(
  mob: MobEntity,
  rawBaseDamage: number,
  player: PlayerState,
): ShellHitOutcome {
  return resolveShellHitWithSnapshot(
    mob,
    rawBaseDamage,
    strikeSnapshotFromPlayer(player),
  );
}
