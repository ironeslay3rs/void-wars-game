import type { MobAuthoritativeLootLine } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import { isVoidFieldShellBossMobId } from "@/features/void-maps/voidFieldShellMobs";
import { rollVoidFieldLoot } from "@/features/void-maps/rollVoidFieldLoot";
import {
  voidZoneById,
  type VoidZoneId,
  type VoidZoneLootTheme,
} from "@/features/void-maps/zoneData";

/**
 * Phase 8 — Realtime mob loot parity.
 *
 * Pure helper: given a `mob_defeated` event from the realtime server,
 * resolve the loot lines that should drop to the player. The server is
 * canonical when it sends `serverLines`; the helper falls back to the
 * exact same `rollVoidFieldLoot()` shell mobs use when the server omits
 * loot. Without this fallback, server-authoritative mobs silently
 * dropped zero loot because the client also skipped its own roll.
 *
 * `seedSuffix` lets callers force a deterministic seed (good for tests).
 */
export type ResolveAuthoritativeMobLootParams = {
  mobEntityId: string;
  mobId: string;
  spawnedAt: number;
  zoneId: VoidZoneId | string | undefined;
  serverLines: MobAuthoritativeLootLine[] | undefined | null;
};

export function resolveAuthoritativeMobLoot(
  params: ResolveAuthoritativeMobLootParams,
): MobAuthoritativeLootLine[] {
  if (params.serverLines && params.serverLines.length > 0) {
    return params.serverLines;
  }

  const zoneId = params.zoneId;
  if (
    !zoneId ||
    !Object.prototype.hasOwnProperty.call(voidZoneById, zoneId as string)
  ) {
    return [];
  }

  const zoneTheme: VoidZoneLootTheme = voidZoneById[zoneId as VoidZoneId]
    .lootTheme;
  const isBoss = isVoidFieldShellBossMobId(params.mobId);
  const rolled = rollVoidFieldLoot({
    zoneLootTheme: zoneTheme,
    mobId: params.mobId,
    isBoss,
    seed: `srv-fallback-${params.mobEntityId}-${params.spawnedAt}`,
  });
  return rolled.map((line) => ({
    resource: line.resource,
    amount: line.amount,
  }));
}
