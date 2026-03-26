import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import type { ShellArchetype } from "@/features/combat/shellHitResolution";
import { archetypeHpMul } from "@/features/combat/shellHitResolution";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export const VOID_FIELD_SHELL_MOB_PREFIX = "void-shell";
export const VOID_FIELD_SHELL_BOSS_MOB_PREFIX = "void-shell-boss";

/** Base per-hit damage before loadout / passives (VoidFieldScreen applies stim + career %). */
export const VOID_FIELD_SHELL_STRIKE_DAMAGE = 18;

export function isVoidFieldShellMobId(mobEntityId: string): boolean {
  return mobEntityId.startsWith(VOID_FIELD_SHELL_MOB_PREFIX);
}

export function isVoidFieldShellBossMobId(mobEntityId: string): boolean {
  return mobEntityId.startsWith(VOID_FIELD_SHELL_BOSS_MOB_PREFIX);
}

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

type ShellSpawnRow = {
  x: number;
  y: number;
  label: string;
  lootProfileId: string;
  hp: number;
  archetype: ShellArchetype;
  /** 0 = no posture layer (HP only). */
  postureMax: number;
};

function rowsForZone(zoneId: VoidZoneId): ShellSpawnRow[] {
  switch (zoneId) {
    case "howling-scar":
      return [
        {
          x: 26,
          y: 34,
          label: "Hollowfang Dredger",
          lootProfileId: "hollowfang",
          hp: 155,
          archetype: "apex",
          postureMax: 100,
        },
        {
          x: 70,
          y: 30,
          label: "Spore Drudge",
          lootProfileId: "field-strain",
          hp: 88,
          archetype: "skirmisher",
          postureMax: 72,
        },
        {
          x: 48,
          y: 54,
          label: "Mire Stalker",
          lootProfileId: "rift-leech",
          hp: 118,
          archetype: "bulwark",
          postureMax: 64,
        },
        {
          x: 34,
          y: 66,
          label: "Brood Runner",
          lootProfileId: "echo-skulk",
          hp: 92,
          archetype: "volatile",
          postureMax: 68,
        },
      ];
    case "ash-relay":
      return [
        {
          x: 28,
          y: 32,
          label: "Cinder Drone",
          lootProfileId: "ash-stalker",
          hp: 102,
          archetype: "skirmisher",
          postureMax: 70,
        },
        {
          x: 68,
          y: 28,
          label: "Plate Husk",
          lootProfileId: "relay-husk",
          hp: 128,
          archetype: "bulwark",
          postureMax: 58,
        },
        {
          x: 50,
          y: 56,
          label: "Arc Scrapper",
          lootProfileId: "ash-scavenger",
          hp: 95,
          archetype: "volatile",
          postureMax: 74,
        },
        {
          x: 38,
          y: 68,
          label: "Ash Gnat",
          lootProfileId: "ash-stalker",
          hp: 84,
          archetype: "skirmisher",
          postureMax: 0,
        },
      ];
    case "echo-ruins":
      return [
        {
          x: 30,
          y: 30,
          label: "Echo Wretch",
          lootProfileId: "void-stalker",
          hp: 98,
          archetype: "volatile",
          postureMax: 78,
        },
        {
          x: 66,
          y: 32,
          label: "Memory Shard",
          lootProfileId: "echo-skulk",
          hp: 110,
          archetype: "bulwark",
          postureMax: 52,
        },
        {
          x: 48,
          y: 54,
          label: "Stillborn Choir",
          lootProfileId: "void-stalker",
          hp: 104,
          archetype: "skirmisher",
          postureMax: 76,
        },
        {
          x: 36,
          y: 64,
          label: "Glint Wisp",
          lootProfileId: "rift-leech",
          hp: 86,
          archetype: "skirmisher",
          postureMax: 0,
        },
      ];
    case "rift-maw":
      return [
        {
          x: 27,
          y: 33,
          label: "Maw Feeder",
          lootProfileId: "rift-maw",
          hp: 124,
          archetype: "bulwark",
          postureMax: 62,
        },
        {
          x: 69,
          y: 29,
          label: "Tearling",
          lootProfileId: "rift-maw",
          hp: 108,
          archetype: "volatile",
          postureMax: 80,
        },
        {
          x: 50,
          y: 55,
          label: "Rift Nurse",
          lootProfileId: "void-stalker",
          hp: 114,
          archetype: "apex",
          postureMax: 88,
        },
        {
          x: 35,
          y: 66,
          label: "Coil Breaker",
          lootProfileId: "field-strain",
          hp: 96,
          archetype: "skirmisher",
          postureMax: 70,
        },
      ];
    default:
      return [];
  }
}

export type VoidFieldShellMobTemplates = {
  regular: MobEntity[];
  boss: MobEntity;
};

export function buildVoidFieldShellMobTemplates(
  zoneId: VoidZoneId,
  now = Date.now(),
): VoidFieldShellMobTemplates {
  const rows = rowsForZone(zoneId);

  const regular = rows.map((s, i) => {
    const scaledHp = Math.round(s.hp * archetypeHpMul(s.archetype));
    const mob: MobEntity = {
      mobEntityId: `${VOID_FIELD_SHELL_MOB_PREFIX}-${zoneId}-${i}`,
      zoneId,
      waveIndex: 0,
      mobId: `shell-${zoneId}-${s.lootProfileId}-${i}`,
      mobLabel: s.label,
      packSize: 1,
      spawnedAt: now,
      hp: scaledHp,
      maxHp: scaledHp,
      x: s.x,
      y: s.y,
      shellArchetype: s.archetype,
      shellPosture: 0,
      shellPostureMax: s.postureMax > 0 ? s.postureMax : undefined,
      shellTag: shellTagForArchetype(s.archetype),
    };
    if (s.postureMax <= 0) {
      delete mob.shellPosture;
      delete mob.shellPostureMax;
    }
    return mob;
  });

  const boss: MobEntity = {
    mobEntityId: `${VOID_FIELD_SHELL_BOSS_MOB_PREFIX}-${zoneId}-0`,
    zoneId,
    waveIndex: 0,
    mobId: `shell-boss-${zoneId}-roaming-boss`,
    mobLabel: "Roaming Apex",
    packSize: 1,
    spawnedAt: now,
    hp: 540,
    maxHp: 540,
    x: 50,
    y: 42,
    isBoss: true,
    shellArchetype: "apex",
    shellPosture: 0,
    shellPostureMax: 120,
    shellTag: "BOSS",
  };

  return { regular, boss };
}
