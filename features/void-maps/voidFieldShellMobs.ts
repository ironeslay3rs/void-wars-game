import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export const VOID_FIELD_SHELL_MOB_PREFIX = "void-shell";
export const VOID_FIELD_SHELL_BOSS_MOB_PREFIX = "void-shell-boss";

/** Per-hit damage for client-only shell mobs (local practice when hunt/WS idle). */
export const VOID_FIELD_SHELL_STRIKE_DAMAGE = 18;

export function isVoidFieldShellMobId(mobEntityId: string): boolean {
  return mobEntityId.startsWith(VOID_FIELD_SHELL_MOB_PREFIX);
}

export function isVoidFieldShellBossMobId(mobEntityId: string): boolean {
  return mobEntityId.startsWith(VOID_FIELD_SHELL_BOSS_MOB_PREFIX);
}

export type VoidFieldShellMobTemplates = {
  regular: MobEntity[];
  boss: MobEntity;
};

/**
 * Client-only stand-ins when the realtime session has not spawned mobs yet (M1 shell).
 * Not sent to the server; attacks are ignored for these ids.
 */
export function buildVoidFieldShellMobTemplates(
  zoneId: VoidZoneId,
  now = Date.now(),
): VoidFieldShellMobTemplates {
  const spots: Array<{ x: number; y: number; label: string; lootProfileId: string }> = [
    { x: 26, y: 34, label: "Field Strain", lootProfileId: "field-strain" },
    { x: 70, y: 30, label: "Rift Leech", lootProfileId: "rift-leech" },
    { x: 48, y: 54, label: "Echo Skulk", lootProfileId: "echo-skulk" },
    { x: 34, y: 66, label: "Ash Stalker", lootProfileId: "ash-stalker" },
  ];

  const regular = spots.map((s, i) => ({
    mobEntityId: `${VOID_FIELD_SHELL_MOB_PREFIX}-${zoneId}-${i}`,
    zoneId,
    waveIndex: 0,
    mobId: `shell-${zoneId}-${s.lootProfileId}-${i}`,
    mobLabel: s.label,
    packSize: 1,
    spawnedAt: now,
    hp: 100,
    maxHp: 100,
    x: s.x,
    y: s.y,
  }));

  const boss: MobEntity = {
    mobEntityId: `${VOID_FIELD_SHELL_BOSS_MOB_PREFIX}-${zoneId}-0`,
    zoneId,
    waveIndex: 0,
    mobId: `shell-boss-${zoneId}-roaming-boss`,
    mobLabel: "Roaming Boss",
    packSize: 1,
    spawnedAt: now,
    hp: 520,
    maxHp: 520,
    x: 50,
    y: 42,
  };

  return { regular, boss };
}
