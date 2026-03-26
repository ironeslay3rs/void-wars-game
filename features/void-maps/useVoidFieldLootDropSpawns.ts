"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import {
  createVoidFieldLootDropVfx,
  type VoidFieldLootDropVfx,
} from "@/features/void-maps/voidFieldLootDrops";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { isVoidFieldShellBossMobId } from "@/features/void-maps/voidFieldShellMobs";
import { rollVoidFieldLoot } from "@/features/void-maps/rollVoidFieldLoot";

const MAX_DROPS = 10;

type MobSnap = { hp: number; x: number; y: number };

/**
 * When mob HP hits 0 (or mob disappears while alive), spawn a client-only loot VFX token.
 * No inventory / server coupling.
 */
export function useVoidFieldLootDropSpawns(
  mobsForField: MobEntity[],
  zoneId: VoidZoneId,
) {
  const [drops, setDrops] = useState<VoidFieldLootDropVfx[]>([]);
  const prevRef = useRef<Map<string, MobSnap>>(new Map());

  useEffect(() => {
    const zone = voidZoneById[zoneId];
    const prev = prevRef.current;
    const seen = new Set<string>();
    const additions: VoidFieldLootDropVfx[] = [];

    for (const mob of mobsForField) {
      seen.add(mob.mobEntityId);
      const old = prev.get(mob.mobEntityId);
      if (old !== undefined && old.hp > 0 && mob.hp <= 0) {
        const isBoss = mob.isBoss ?? isVoidFieldShellBossMobId(mob.mobEntityId);
        const rolled = rollVoidFieldLoot({
          zoneLootTheme: zone.lootTheme,
          mobId: mob.mobId,
          isBoss,
          seed: `death-${mob.mobEntityId}-${mob.spawnedAt}`,
        });
        rolled.forEach((line, idx) => {
          additions.push(
            createVoidFieldLootDropVfx(
              mob.x,
              mob.y,
              line.resource,
              line.amount,
              `death-${mob.mobEntityId}-${mob.spawnedAt}-${idx}`,
            ),
          );
        });
      }
    }

    for (const [id, old] of prev) {
      if (!seen.has(id) && old.hp > 0) {
        // If a mob disappears while alive, still emit a small normal drop.
        // We don't know mobId here; treat as generic normal.
        const rolled = rollVoidFieldLoot({
          zoneLootTheme: zone.lootTheme,
          mobId: "unknown",
          isBoss: false,
          seed: `despawn-${id}`,
        });
        rolled.forEach((line, idx) => {
          additions.push(
            createVoidFieldLootDropVfx(
              old.x,
              old.y,
              line.resource,
              line.amount,
              `despawn-${id}-${idx}`,
            ),
          );
        });
      }
    }

    const next = new Map<string, MobSnap>();
    for (const mob of mobsForField) {
      next.set(mob.mobEntityId, { hp: mob.hp, x: mob.x, y: mob.y });
    }
    prevRef.current = next;

    if (additions.length === 0) return;

    const raf = requestAnimationFrame(() => {
      setDrops((d) => [...additions, ...d].slice(0, MAX_DROPS));
    });
    return () => cancelAnimationFrame(raf);
  }, [mobsForField, zoneId]);

  const removeDrop = useCallback((id: string) => {
    setDrops((d) => d.filter((x) => x.id !== id));
  }, []);

  return { drops, removeDrop };
}
