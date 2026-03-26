import { creatures } from "@/features/combat/creatureData";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import {
  VOID_FIELD_SHELL_MOB_PREFIX,
} from "@/features/void-maps/voidFieldShellMobs";
import {
  voidFieldHashStringToInt,
  voidFieldClamp,
} from "@/features/void-maps/voidFieldUtils";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

function seed01(seed: string): number {
  return (voidFieldHashStringToInt(seed) % 1000) / 1000;
}

/**
 * Step 12 foundation spawner: 3-5 local shell mobs built from creatureData.
 * Used for deploy-layer fallback when realtime mobs are unavailable.
 */
export function spawnFieldMobsFromCreatures(
  zoneId: VoidZoneId,
  spawnedAt = Date.now(),
): MobEntity[] {
  const pool = creatures.filter((c) => c.zoneId === "any" || c.zoneId === zoneId);
  const fallback = creatures[0];
  const count = 3 + (voidFieldHashStringToInt(`${zoneId}-count`) % 3); // 3..5

  return Array.from({ length: count }).map((_, i) => {
    const pick = pool[i % pool.length] ?? fallback;
    const x = voidFieldClamp(14 + seed01(`${zoneId}-${i}-x`) * 72, 6, 94);
    const y = voidFieldClamp(18 + seed01(`${zoneId}-${i}-y`) * 64, 8, 92);
    const baseHp = Math.max(18, pick.hp);

    return {
      mobEntityId: `${VOID_FIELD_SHELL_MOB_PREFIX}-${zoneId}-${i}`,
      zoneId,
      waveIndex: 0,
      mobId: pick.id,
      mobLabel: pick.name,
      packSize: 1,
      spawnedAt,
      hp: baseHp,
      maxHp: baseHp,
      x,
      y,
      shellArchetype: "skirmisher",
      shellPosture: 0,
      shellPostureMax: 40,
      shellTag: "SKIRM",
    };
  });
}

