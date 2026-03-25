import { voidZoneSpawnTables, type MobSpawnEntry } from "@/features/void-maps/spawnTables";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type SpawnEncounter = {
  zoneId: VoidZoneId;
  mobId: string;
  mobLabel: string;
  packSize: number;
  spawnedAt: number;
};

function rollWeightedEntry(entries: MobSpawnEntry[]): MobSpawnEntry {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  const safeTotal = total > 0 ? total : entries.length;
  let roll = Math.random() * safeTotal;

  for (const entry of entries) {
    const weight = total > 0 ? Math.max(0, entry.weight) : 1;
    roll -= weight;
    if (roll <= 0) {
      return entry;
    }
  }

  return entries[entries.length - 1];
}

function rollPackSize(entry: MobSpawnEntry): number {
  const min = Math.max(1, Math.floor(entry.minPack));
  const max = Math.max(min, Math.floor(entry.maxPack));
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function buildSpawnEncounter(zoneId: VoidZoneId, now: number): SpawnEncounter {
  const table = voidZoneSpawnTables[zoneId];
  const selected = rollWeightedEntry(table);

  return {
    zoneId,
    mobId: selected.id,
    mobLabel: selected.label,
    packSize: rollPackSize(selected),
    spawnedAt: now,
  };
}
