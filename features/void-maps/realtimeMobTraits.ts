import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import type { ShellArchetype } from "@/features/combat/shellHitResolution";
import { archetypeHpMul } from "@/features/combat/shellHitResolution";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

function shellTagForArchetype(a: ShellArchetype): string {
  switch (a) {
    case "bulwark":
      return "ARMOR";
    case "volatile":
      return "VOL";
    case "apex":
      return "APEX";
    default:
      return "SKIRM";
  }
}

/**
 * Assign M4 archetype + posture layer to WS-spawned mobs (variety by zone + wave).
 */
export function enrichRealtimeMobWithM4Traits(params: {
  mob: MobEntity;
  zoneId: VoidZoneId;
  waveIndex: number;
  isBoss: boolean;
}): MobEntity {
  const { mob, zoneId, waveIndex, isBoss } = params;

  if (isBoss) {
    const maxHp = Math.round(mob.maxHp * archetypeHpMul("apex"));
    return {
      ...mob,
      maxHp,
      hp: maxHp,
      isBoss: true,
      shellArchetype: "apex",
      shellPosture: 0,
      shellPostureMax: 120,
      shellTag: "BOSS",
    };
  }

  const zoneKey =
    zoneId === "howling-scar"
      ? 0
      : zoneId === "ash-relay"
        ? 1
        : zoneId === "echo-ruins"
          ? 2
          : 3;

  const table: ShellArchetype[] = [
    "skirmisher",
    "bulwark",
    "volatile",
    "skirmisher",
  ];
  const archetype = table[(zoneKey + waveIndex) % table.length];

  const postureBase = archetype === "bulwark" ? 52 : archetype === "volatile" ? 78 : 68;
  const postureMax = Math.round(postureBase + (waveIndex % 3) * 6);

  const maxHp = Math.round(mob.maxHp * archetypeHpMul(archetype));

  /** Howling Scar: periodic Hollowfang-style apex scout */
  const hollowfangWave =
    zoneId === "howling-scar" && waveIndex > 0 && waveIndex % 5 === 0;
  if (hollowfangWave) {
    const fh = Math.round(mob.maxHp * archetypeHpMul("apex") * 1.12);
    return {
      ...mob,
      mobLabel: "Hollowfang Scout",
      maxHp: fh,
      hp: fh,
      shellArchetype: "apex",
      shellPosture: 0,
      shellPostureMax: 95,
      shellTag: "APEX",
    };
  }

  const out: MobEntity = {
    ...mob,
    maxHp,
    hp: maxHp,
    shellArchetype: archetype,
    shellPosture: 0,
    shellPostureMax: postureMax,
    shellTag: shellTagForArchetype(archetype),
  };

  return out;
}
