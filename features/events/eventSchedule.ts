/**
 * Event Schedule — deterministic day → event-window function.
 *
 * For a given YYYY-MM-DD dateKey we derive four anchored event windows
 * (one per anchor, one per kind). Given `now: Date`, return which windows
 * are active and which is next upcoming. Peeks into tomorrow when today
 * has no remaining windows.
 *
 * Pure. Same inputs → same outputs.
 */

import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import { isValidDateKey } from "@/features/daily/huntRotation";
import {
  eventRegistry,
  eventsByKind,
  type EventDefinition,
  type EventKind,
} from "@/features/events/eventRegistry";

export type ScheduledEvent = {
  /** Unique per (dateKey, anchorIdx). */
  instanceId: string;
  dateKey: string;
  anchorIdx: number;
  definition: EventDefinition;
  /** Minutes since UTC midnight of dateKey. */
  startMinuteUtc: number;
  endMinuteUtc: number;
};

export type EventScheduleDay = {
  dateKey: string;
  events: ScheduledEvent[];
};

export type EventScheduleStatus = {
  dateKey: string;
  nowMinuteUtc: number;
  active: ScheduledEvent[];
  /** Next upcoming event (may be in tomorrow's schedule). */
  next: ScheduledEvent | null;
};

/** Four anchors per UTC day — one of each event kind rotates through. */
const ANCHORS_MIN = [
  5 * 60, //  05:00
  11 * 60, // 11:00
  16 * 60, // 16:00
  21 * 60, // 21:00
];

/** Anchor slot → event kind. Rotates daily via hash. */
const KIND_ORDER: EventKind[] = ["bounty", "sale", "loot-boost", "incursion"];

function hashFor(dateKey: string, salt: string): number {
  return voidFieldHashStringToInt(`event-schedule:${dateKey}:${salt}`);
}

function rotatedKind(dateKey: string, anchorIdx: number): EventKind {
  const offset = hashFor(dateKey, "kind-rotation") % KIND_ORDER.length;
  return KIND_ORDER[(anchorIdx + offset) % KIND_ORDER.length];
}

function pickDefinition(
  dateKey: string,
  anchorIdx: number,
  kind: EventKind,
): EventDefinition | null {
  const pool = eventsByKind(kind);
  if (pool.length === 0) return null;
  const idx = hashFor(dateKey, `def:${kind}:${anchorIdx}`) % pool.length;
  return pool[idx];
}

function jitter(dateKey: string, anchorIdx: number): number {
  // ±15 min deterministic jitter.
  return (hashFor(dateKey, `jitter:${anchorIdx}`) % 31) - 15;
}

export function toEventDateKey(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getEventSchedule(dateKey: string): EventScheduleDay {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  if (eventRegistry.length === 0) {
    return { dateKey, events: [] };
  }

  const events: ScheduledEvent[] = [];
  for (let i = 0; i < ANCHORS_MIN.length; i += 1) {
    const kind = rotatedKind(dateKey, i);
    const def = pickDefinition(dateKey, i, kind);
    if (!def) continue;
    const duration = def.durationMinutes;
    const anchorStart = ANCHORS_MIN[i] + jitter(dateKey, i);
    const start = Math.max(0, Math.min(24 * 60 - duration, anchorStart));
    events.push({
      instanceId: `${dateKey}#${i}:${def.id}`,
      dateKey,
      anchorIdx: i,
      definition: def,
      startMinuteUtc: start,
      endMinuteUtc: start + duration,
    });
  }
  events.sort((a, b) => a.startMinuteUtc - b.startMinuteUtc);
  return { dateKey, events };
}

/**
 * Primary entry for UI/tests. Accepts dateKey + now:Date.
 * dateKey is authoritative for schedule derivation; `now` drives
 * active/next resolution. If `now` falls outside `dateKey`'s UTC day,
 * we still evaluate against that day's schedule plus a tomorrow peek.
 */
export function getEventScheduleStatus(
  dateKey: string,
  now: Date,
): EventScheduleStatus {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  const nowKey = toEventDateKey(now);
  const nowMinuteUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const today = getEventSchedule(dateKey);

  // Compare `now`'s absolute minute-since-midnight against dateKey events.
  // Active/next evaluation only makes sense when dateKey === nowKey; if
  // they diverge we still return today's schedule but active is empty.
  const sameDay = nowKey === dateKey;
  const active = sameDay
    ? today.events.filter(
        (e) =>
          nowMinuteUtc >= e.startMinuteUtc && nowMinuteUtc < e.endMinuteUtc,
      )
    : [];

  let next: ScheduledEvent | null = sameDay
    ? today.events.find((e) => e.startMinuteUtc > nowMinuteUtc) ?? null
    : today.events[0] ?? null;

  if (!next && sameDay) {
    const tomorrow = new Date(now.getTime());
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    const nextDay = getEventSchedule(toEventDateKey(tomorrow));
    next = nextDay.events[0] ?? null;
  }

  return { dateKey, nowMinuteUtc, active, next };
}

/** Convenience: status anchored on `now`'s own UTC date key. */
export function getEventScheduleStatusAt(now: Date): EventScheduleStatus {
  return getEventScheduleStatus(toEventDateKey(now), now);
}

/** Produce N consecutive days of schedules. */
export function getEventScheduleWindow(
  dateKey: string,
  days: number,
): EventScheduleDay[] {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid dateKey "${dateKey}" (expected YYYY-MM-DD)`);
  }
  const count = Math.max(0, Math.floor(days));
  if (count === 0) return [];
  const start = new Date(`${dateKey}T00:00:00Z`);
  const out: EventScheduleDay[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getTime());
    d.setUTCDate(start.getUTCDate() + i);
    out.push(getEventSchedule(toEventDateKey(d)));
  }
  return out;
}
