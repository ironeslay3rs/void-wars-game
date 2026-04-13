/**
 * Daily Hunt Rotation — deterministic date-keyed zone + mob-pool rotation.
 *
 * Pure functions. Given a YYYY-MM-DD date string, produces the same hunt
 * every time. Reuses VoidZone + MobSpawnEntry types from features/void-maps.
 */

import {
  voidZones,
  type VoidZone,
  type VoidZoneId,
  type VoidZoneLootTheme,
} from "@/features/void-maps/zoneData";
import {
  voidZoneSpawnTables,
  type MobSpawnEntry,
} from "@/features/void-maps/spawnTables";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";

export type DailyHuntDifficulty = "standard" | "elite" | "apex";

export type DailyHunt = {
  /** YYYY-MM-DD key used to derive this hunt. */
  dateKey: string;
  zoneId: VoidZoneId;
  zoneLabel: string;
  lootTheme: VoidZoneLootTheme;
  /** Subset of that zone's spawn table featured for the day. */
  featuredMobs: MobSpawnEntry[];
  /** Quota of mobs to clear for full credit. */
  clearQuota: number;
  difficulty: DailyHuntDifficulty;
  /** Flat resource multiplier applied to rewards. */
  rewardMultiplier: number;
};

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(dateKey: string): boolean {
  return DATE_KEY_RE.test(dateKey);
}

/** Convert a Date to a UTC YYYY-MM-DD key. */
export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashFor(dateKey: string, salt: string): number {
  return voidFieldHashStringToInt(`daily-hunt:${dateKey}:${salt}`);
}

function pickIndex(dateKey: string, salt: string, length: number): number {
  if (length <= 0) return 0;
  return hashFor(dateKey, salt) % length;
}

function pickDifficulty(dateKey: string, zone: VoidZone): DailyHuntDifficulty {
  // Boss-enabled or high-threat zones bias toward harder difficulties,
  // but the draw is still deterministic off the date hash.
  const roll = hashFor(dateKey, "difficulty") % 100;
  if (zone.bossEnabled || zone.threatLevel >= 3) {
    if (roll < 55) return "apex";
    if (roll < 90) return "elite";
    return "standard";
  }
  if (zone.threatLevel >= 2) {
    if (roll < 25) return "apex";
    if (roll < 70) return "elite";
    return "standard";
  }
  if (roll < 10) return "apex";
  if (roll < 45) return "elite";
  return "standard";
}

function difficultyMultiplier(d: DailyHuntDifficulty): number {
  switch (d) {
    case "standard":
      return 1;
    case "elite":
      return 1.35;
    case "apex":
      return 1.8;
  }
}

function difficultyQuota(d: DailyHuntDifficulty, zoneThreat: number): number {
  const base = 6 + zoneThreat * 2; // 8..14
  switch (d) {
    case "standard":
      return base;
    case "elite":
      return base + 4;
    case "apex":
      return base + 8;
  }
}

/** Deterministically rotate featured mobs: always 2 of 3 picks from the zone. */
function pickFeaturedMobs(
  dateKey: string,
  zoneId: VoidZoneId,
): MobSpawnEntry[] {
  const table = voidZoneSpawnTables[zoneId];
  if (!table || table.length === 0) return [];
  if (table.length <= 2) return [...table];
  const dropIdx = pickIndex(dateKey, `drop:${zoneId}`, table.length);
  return table.filter((_, i) => i !== dropIdx);
}

/** Main entry — fully deterministic hunt for a given date. */
export function getDailyHunt(dateKey: string): DailyHunt {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  if (voidZones.length === 0) {
    throw new Error("No void zones defined");
  }
  const zoneIdx = pickIndex(dateKey, "zone", voidZones.length);
  const zone = voidZones[zoneIdx];
  const difficulty = pickDifficulty(dateKey, zone);
  const featuredMobs = pickFeaturedMobs(dateKey, zone.id);
  return {
    dateKey,
    zoneId: zone.id,
    zoneLabel: zone.label,
    lootTheme: zone.lootTheme,
    featuredMobs,
    clearQuota: difficultyQuota(difficulty, zone.threatLevel),
    difficulty,
    rewardMultiplier: difficultyMultiplier(difficulty),
  };
}

/** Produce the next N days of hunts starting at `dateKey` (inclusive). */
export function getDailyHuntWindow(
  dateKey: string,
  days: number,
): DailyHunt[] {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  const count = Math.max(0, Math.floor(days));
  if (count === 0) return [];
  const start = new Date(`${dateKey}T00:00:00Z`);
  const out: DailyHunt[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getTime());
    d.setUTCDate(start.getUTCDate() + i);
    out.push(getDailyHunt(toDateKey(d)));
  }
  return out;
}
