import { describe, expect, it } from "vitest";

import {
  getBossSchedule,
  getBossScheduleStatusAt,
  isScheduledBossActive,
  type BossWindow,
} from "@/features/daily/bossSchedule";
import { voidZones } from "@/features/void-maps/zoneData";

const DAY_KEY = "2026-04-13";
const BOSS_ZONES = voidZones.filter((z) => z.bossEnabled);

function atUtc(dateKey: string, minute: number): Date {
  const [y, m, d] = dateKey.split("-").map((s) => parseInt(s, 10));
  const hh = Math.floor(minute / 60);
  const mm = minute % 60;
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
}

describe("getBossSchedule — determinism + shape", () => {
  it("returns the same schedule for the same dateKey", () => {
    const a = getBossSchedule(DAY_KEY);
    const b = getBossSchedule(DAY_KEY);
    expect(a).toEqual(b);
  });

  it("does not mutate the returned schedule across calls", () => {
    const a = getBossSchedule(DAY_KEY);
    a.windows.push({
      zoneId: a.windows[0].zoneId,
      zoneLabel: a.windows[0].zoneLabel,
      startMinuteUtc: 0,
      endMinuteUtc: 1,
      durationMinutes: 1,
      tier: "standard",
    });
    const b = getBossSchedule(DAY_KEY);
    expect(b.windows.length).toBeLessThan(a.windows.length);
  });

  it("carries the requested dateKey back on the result", () => {
    expect(getBossSchedule(DAY_KEY).dateKey).toBe(DAY_KEY);
  });

  it("throws on invalid dateKey", () => {
    expect(() => getBossSchedule("bogus")).toThrow(/Invalid dateKey/);
  });

  it("windows are sorted by startMinuteUtc", () => {
    const { windows } = getBossSchedule(DAY_KEY);
    for (let i = 1; i < windows.length; i += 1) {
      expect(windows[i].startMinuteUtc).toBeGreaterThanOrEqual(
        windows[i - 1].startMinuteUtc,
      );
    }
  });

  it("every window has a boss-enabled zone and a valid duration", () => {
    const { windows } = getBossSchedule(DAY_KEY);
    const bossIds = new Set(BOSS_ZONES.map((z) => z.id));
    for (const w of windows) {
      expect(bossIds.has(w.zoneId)).toBe(true);
      expect(w.endMinuteUtc - w.startMinuteUtc).toBe(w.durationMinutes);
      expect(w.durationMinutes).toBeGreaterThan(0);
      expect(w.startMinuteUtc).toBeGreaterThanOrEqual(0);
      expect(w.endMinuteUtc).toBeLessThanOrEqual(24 * 60);
    }
  });

  it("exposes at most one apex window per day", () => {
    const { windows } = getBossSchedule(DAY_KEY);
    const apexCount = windows.filter((w) => w.tier === "apex").length;
    expect(apexCount).toBeLessThanOrEqual(1);
  });

  it("produces different windows on different dates", () => {
    const a = getBossSchedule("2026-04-13");
    const b = getBossSchedule("2026-04-20");
    // Not strictly guaranteed to differ, but across a week sample
    // at least one anchor should move or change zone/tier.
    const sigA = a.windows.map((w) => `${w.zoneId}:${w.startMinuteUtc}:${w.tier}`).join("|");
    const sigB = b.windows.map((w) => `${w.zoneId}:${w.startMinuteUtc}:${w.tier}`).join("|");
    expect(sigA).not.toBe(sigB);
  });
});

describe("getBossScheduleStatusAt — window transitions", () => {
  const schedule = getBossSchedule(DAY_KEY);
  const firstWindow = schedule.windows[0] as BossWindow | undefined;

  it("reports dateKey + nowMinuteUtc derived from the UTC clock", () => {
    const status = getBossScheduleStatusAt(atUtc(DAY_KEY, 7 * 60 + 15));
    expect(status.dateKey).toBe(DAY_KEY);
    expect(status.nowMinuteUtc).toBe(7 * 60 + 15);
  });

  it("reports no active window BEFORE the first window opens", () => {
    if (!firstWindow) return;
    // Any time before the first window start: use minute 0 for deterministic cover.
    const before = atUtc(DAY_KEY, Math.max(0, firstWindow.startMinuteUtc - 1));
    if (firstWindow.startMinuteUtc === 0) return; // no "before" slot.
    const status = getBossScheduleStatusAt(before);
    expect(status.activeWindow).toBeNull();
    expect(status.nextWindow).not.toBeNull();
    expect(status.nextWindow!.startMinuteUtc).toBeGreaterThan(status.nowMinuteUtc);
  });

  it("reports the active window DURING its open range (inclusive start)", () => {
    if (!firstWindow) return;
    const duringStart = atUtc(DAY_KEY, firstWindow.startMinuteUtc);
    const midpoint = Math.floor(
      (firstWindow.startMinuteUtc + firstWindow.endMinuteUtc) / 2,
    );
    const duringMid = atUtc(DAY_KEY, midpoint);

    const startStatus = getBossScheduleStatusAt(duringStart);
    expect(startStatus.activeWindow?.zoneId).toBe(firstWindow.zoneId);
    expect(startStatus.activeWindow?.startMinuteUtc).toBe(firstWindow.startMinuteUtc);

    const midStatus = getBossScheduleStatusAt(duringMid);
    expect(midStatus.activeWindow?.zoneId).toBe(firstWindow.zoneId);
  });

  it("reports no active window AT the exclusive end boundary", () => {
    if (!firstWindow) return;
    // endMinuteUtc is exclusive per the implementation.
    const atEnd = atUtc(DAY_KEY, firstWindow.endMinuteUtc);
    const status = getBossScheduleStatusAt(atEnd);
    expect(status.activeWindow?.zoneId === firstWindow.zoneId).toBe(false);
  });

  it("peeks tomorrow's first window when today's have all passed", () => {
    const lastWindow = schedule.windows[schedule.windows.length - 1];
    if (!lastWindow) return;
    const afterAll = atUtc(DAY_KEY, Math.min(24 * 60 - 1, lastWindow.endMinuteUtc + 1));
    const status = getBossScheduleStatusAt(afterAll);
    if (status.activeWindow === null) {
      // nextWindow may come from tomorrow: start minute resets from 0..24h range.
      expect(status.nextWindow).not.toBeNull();
    }
  });
});

describe("isScheduledBossActive", () => {
  const schedule = getBossSchedule(DAY_KEY);
  const firstWindow = schedule.windows[0] as BossWindow | undefined;

  it("returns true only for the active window's zone", () => {
    if (!firstWindow) return;
    const midpoint = Math.floor(
      (firstWindow.startMinuteUtc + firstWindow.endMinuteUtc) / 2,
    );
    const now = atUtc(DAY_KEY, midpoint);
    expect(isScheduledBossActive(firstWindow.zoneId, now)).toBe(true);

    for (const z of BOSS_ZONES) {
      if (z.id === firstWindow.zoneId) continue;
      // For non-matching zones, scheduled boss should not be active
      // unless the schedule happens to have an overlapping concurrent window —
      // which it cannot, since the status picks exactly one active window.
      expect(isScheduledBossActive(z.id, now)).toBe(false);
    }
  });

  it("returns false at the end boundary", () => {
    if (!firstWindow) return;
    expect(
      isScheduledBossActive(firstWindow.zoneId, atUtc(DAY_KEY, firstWindow.endMinuteUtc)),
    ).toBe(false);
  });
});
