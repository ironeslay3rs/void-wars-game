/**
 * Daily Boss Schedule — time-of-day gated boss spawn windows.
 *
 * Pure: for a given dateKey (YYYY-MM-DD) and clock time, tells you which
 * (if any) scheduled boss window is currently open and when the next one
 * begins. Deterministic: the same dateKey always yields the same windows.
 *
 * "Scheduled" bosses are the cadence-driven layer on top of the zone-level
 * random boss spawn (`voidZones[i].bossSpawn`). During an open window the
 * zone's boss is guaranteed to be up for challenge.
 */

import {
  voidZones,
  type VoidZone,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import { isValidDateKey } from "@/features/daily/huntRotation";

export type BossWindow = {
  /** Zone whose boss is guaranteed during this window. */
  zoneId: VoidZoneId;
  zoneLabel: string;
  /** Minutes since UTC midnight of the dateKey. */
  startMinuteUtc: number;
  /** Minutes since UTC midnight (startMinuteUtc + durationMinutes). */
  endMinuteUtc: number;
  durationMinutes: number;
  /** "apex" windows pay more (see rewardTiers). */
  tier: "standard" | "apex";
};

export type BossScheduleDay = {
  dateKey: string;
  windows: BossWindow[];
};

export type BossScheduleStatus = {
  dateKey: string;
  nowMinuteUtc: number;
  activeWindow: BossWindow | null;
  nextWindow: BossWindow | null;
};

/** Anchor times (UTC minutes past midnight) we schedule around. */
const DAILY_ANCHOR_MINUTES = [
  6 * 60, // 06:00
  12 * 60, // 12:00
  18 * 60, // 18:00
  22 * 60, // 22:00
];

const BASE_WINDOW_MINUTES = 30;
const APEX_WINDOW_MINUTES = 45;

function hashFor(dateKey: string, salt: string): number {
  return voidFieldHashStringToInt(`boss-schedule:${dateKey}:${salt}`);
}

function bossZones(): VoidZone[] {
  return voidZones.filter((z) => z.bossEnabled);
}

function pickZone(dateKey: string, anchorIdx: number): VoidZone | null {
  const zones = bossZones();
  if (zones.length === 0) return null;
  const idx = hashFor(dateKey, `zone:${anchorIdx}`) % zones.length;
  return zones[idx];
}

function pickTier(dateKey: string, anchorIdx: number): "standard" | "apex" {
  // One apex window per day, deterministically picked.
  const apexIdx = hashFor(dateKey, "apex-anchor") % DAILY_ANCHOR_MINUTES.length;
  return anchorIdx === apexIdx ? "apex" : "standard";
}

function jitterForAnchor(dateKey: string, anchorIdx: number): number {
  // ±20 minutes deterministic jitter so windows don't land on round numbers.
  return (hashFor(dateKey, `jitter:${anchorIdx}`) % 41) - 20;
}

export function getBossSchedule(dateKey: string): BossScheduleDay {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  const windows: BossWindow[] = [];
  for (let i = 0; i < DAILY_ANCHOR_MINUTES.length; i += 1) {
    const zone = pickZone(dateKey, i);
    if (!zone) continue;
    const tier = pickTier(dateKey, i);
    const duration =
      tier === "apex" ? APEX_WINDOW_MINUTES : BASE_WINDOW_MINUTES;
    const start = Math.max(
      0,
      Math.min(
        24 * 60 - duration,
        DAILY_ANCHOR_MINUTES[i] + jitterForAnchor(dateKey, i),
      ),
    );
    windows.push({
      zoneId: zone.id,
      zoneLabel: zone.label,
      startMinuteUtc: start,
      endMinuteUtc: start + duration,
      durationMinutes: duration,
      tier,
    });
  }
  // Stable order by start time.
  windows.sort((a, b) => a.startMinuteUtc - b.startMinuteUtc);
  return { dateKey, windows };
}

function dateToUtcDateKey(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getBossScheduleStatusAt(now: Date): BossScheduleStatus {
  const dateKey = dateToUtcDateKey(now);
  const nowMinuteUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const today = getBossSchedule(dateKey);

  const active =
    today.windows.find(
      (w) =>
        nowMinuteUtc >= w.startMinuteUtc && nowMinuteUtc < w.endMinuteUtc,
    ) ?? null;

  let next: BossWindow | null =
    today.windows.find((w) => w.startMinuteUtc > nowMinuteUtc) ?? null;

  if (!next) {
    // Peek tomorrow for upcoming window display.
    const tomorrow = new Date(now.getTime());
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    const nextDay = getBossSchedule(dateToUtcDateKey(tomorrow));
    next = nextDay.windows[0] ?? null;
  }

  return { dateKey, nowMinuteUtc, activeWindow: active, nextWindow: next };
}

/** Is the zone's scheduled boss window currently open? */
export function isScheduledBossActive(
  zoneId: VoidZoneId,
  now: Date,
): boolean {
  const status = getBossScheduleStatusAt(now);
  return status.activeWindow?.zoneId === zoneId;
}
