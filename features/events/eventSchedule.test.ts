import { describe, expect, it } from "vitest";

import {
  eventRegistry,
  getEventDefinition,
} from "@/features/events/eventRegistry";
import {
  getEventSchedule,
  getEventScheduleStatus,
  getEventScheduleStatusAt,
  getEventScheduleWindow,
  toEventDateKey,
  type EventScheduleDay,
} from "@/features/events/eventSchedule";

const BASE_KEY = "2026-04-13";

function weekOfKeys(startKey: string): string[] {
  const start = new Date(`${startKey}T00:00:00Z`);
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start.getTime());
    d.setUTCDate(start.getUTCDate() + i);
    out.push(toEventDateKey(d));
  }
  return out;
}

describe("toEventDateKey", () => {
  it("returns a zero-padded UTC YYYY-MM-DD", () => {
    expect(toEventDateKey(new Date(Date.UTC(2026, 3, 13)))).toBe("2026-04-13");
    expect(toEventDateKey(new Date(Date.UTC(2001, 0, 2)))).toBe("2001-01-02");
  });
});

describe("getEventSchedule — determinism", () => {
  it("returns an equal schedule for the same dateKey", () => {
    const a = getEventSchedule(BASE_KEY);
    const b = getEventSchedule(BASE_KEY);
    expect(a).toEqual(b);
  });

  it("returns four anchored events per day (one per anchor slot)", () => {
    const day = getEventSchedule(BASE_KEY);
    expect(day.events).toHaveLength(4);
    const anchors = day.events.map((e) => e.anchorIdx).sort();
    expect(anchors).toEqual([0, 1, 2, 3]);
  });

  it("events are sorted by startMinuteUtc ascending", () => {
    const day = getEventSchedule(BASE_KEY);
    for (let i = 1; i < day.events.length; i += 1) {
      expect(day.events[i].startMinuteUtc).toBeGreaterThanOrEqual(
        day.events[i - 1].startMinuteUtc,
      );
    }
  });

  it("start/end minutes stay inside the UTC day and respect duration", () => {
    const day = getEventSchedule(BASE_KEY);
    for (const e of day.events) {
      expect(e.startMinuteUtc).toBeGreaterThanOrEqual(0);
      expect(e.endMinuteUtc).toBeLessThanOrEqual(24 * 60);
      expect(e.endMinuteUtc - e.startMinuteUtc).toBe(e.definition.durationMinutes);
    }
  });

  it("throws on malformed dateKey", () => {
    expect(() => getEventSchedule("nope")).toThrow(/Invalid dateKey/);
    expect(() => getEventSchedule("2026-4-13")).toThrow();
  });

  it("every scheduled definition exists in the registry (integrity)", () => {
    for (const key of weekOfKeys(BASE_KEY)) {
      const day = getEventSchedule(key);
      for (const e of day.events) {
        expect(getEventDefinition(e.definition.id)).not.toBeNull();
        expect(eventRegistry).toContain(e.definition);
      }
    }
  });

  it("instanceId encodes dateKey + anchorIdx + defId", () => {
    const day = getEventSchedule(BASE_KEY);
    for (const e of day.events) {
      expect(e.instanceId).toBe(`${BASE_KEY}#${e.anchorIdx}:${e.definition.id}`);
    }
  });
});

describe("getEventSchedule — variety across a week", () => {
  it("produces more than one distinct daily signature across 7 days", () => {
    const signatures = new Set<string>();
    for (const key of weekOfKeys(BASE_KEY)) {
      const day = getEventSchedule(key);
      signatures.add(day.events.map((e) => e.definition.id).join("|"));
    }
    expect(signatures.size).toBeGreaterThan(1);
  });

  it("rotates event kinds so each anchor slot sees variety across a week", () => {
    const slot0 = new Set<string>();
    for (const key of weekOfKeys(BASE_KEY)) {
      const day = getEventSchedule(key);
      const at0 = day.events.find((e) => e.anchorIdx === 0);
      if (at0) slot0.add(at0.definition.kind);
    }
    expect(slot0.size).toBeGreaterThan(1);
  });
});

describe("getEventScheduleStatus — active/upcoming split", () => {
  it("before the first anchor: nothing active, next is the first event", () => {
    const day = getEventSchedule(BASE_KEY);
    const first = day.events[0];
    const before = new Date(Date.UTC(2026, 3, 13, 0, 0));
    const status = getEventScheduleStatus(BASE_KEY, before);
    expect(status.active).toEqual([]);
    expect(status.next?.instanceId).toBe(first.instanceId);
  });

  it("between two anchors: nothing active, next points to the upcoming event", () => {
    const day = getEventSchedule(BASE_KEY);
    const a = day.events[0];
    const b = day.events[1];
    // pick a minute strictly after a.end and strictly before b.start
    const gapMin = Math.floor((a.endMinuteUtc + b.startMinuteUtc) / 2);
    expect(gapMin).toBeGreaterThan(a.endMinuteUtc);
    expect(gapMin).toBeLessThan(b.startMinuteUtc);
    const now = new Date(
      Date.UTC(2026, 3, 13, Math.floor(gapMin / 60), gapMin % 60),
    );
    const status = getEventScheduleStatus(BASE_KEY, now);
    expect(status.active).toEqual([]);
    expect(status.next?.instanceId).toBe(b.instanceId);
  });

  it("inside an event window: that event is active, next is the following one", () => {
    const day = getEventSchedule(BASE_KEY);
    const target = day.events[1];
    const insideMin = target.startMinuteUtc + 1;
    const now = new Date(
      Date.UTC(2026, 3, 13, Math.floor(insideMin / 60), insideMin % 60),
    );
    const status = getEventScheduleStatus(BASE_KEY, now);
    expect(status.active.map((e) => e.instanceId)).toContain(target.instanceId);
    if (status.next) {
      expect(status.next.startMinuteUtc).toBeGreaterThan(insideMin);
    }
  });

  it("after the last event of the day: next peeks into tomorrow", () => {
    const day = getEventSchedule(BASE_KEY);
    const last = day.events[day.events.length - 1];
    const afterMin = last.endMinuteUtc + 5;
    const now = new Date(
      Date.UTC(2026, 3, 13, Math.floor(afterMin / 60), afterMin % 60),
    );
    const status = getEventScheduleStatus(BASE_KEY, now);
    expect(status.active).toEqual([]);
    expect(status.next).not.toBeNull();
    expect(status.next!.dateKey).toBe("2026-04-14");
  });

  it("when nowKey diverges from dateKey, active is empty and next is the first of that day", () => {
    const day = getEventSchedule(BASE_KEY);
    const distantNow = new Date(Date.UTC(2026, 5, 1, 12, 0));
    const status = getEventScheduleStatus(BASE_KEY, distantNow);
    expect(status.active).toEqual([]);
    expect(status.next?.instanceId).toBe(day.events[0].instanceId);
  });

  it("is deterministic — same (dateKey, now) gives equal results", () => {
    const now = new Date(Date.UTC(2026, 3, 13, 11, 30));
    const a = getEventScheduleStatus(BASE_KEY, now);
    const b = getEventScheduleStatus(BASE_KEY, now);
    expect(a).toEqual(b);
  });

  it("throws on malformed dateKey", () => {
    expect(() => getEventScheduleStatus("bad", new Date())).toThrow();
  });
});

describe("getEventScheduleStatusAt", () => {
  it("uses now's own UTC date key", () => {
    const now = new Date(Date.UTC(2026, 3, 13, 14, 0));
    const status = getEventScheduleStatusAt(now);
    expect(status.dateKey).toBe(BASE_KEY);
  });

  it("matches getEventScheduleStatus(toEventDateKey(now), now)", () => {
    const now = new Date(Date.UTC(2026, 3, 13, 14, 0));
    const direct = getEventScheduleStatusAt(now);
    const explicit = getEventScheduleStatus(toEventDateKey(now), now);
    expect(direct).toEqual(explicit);
  });
});

describe("getEventScheduleWindow", () => {
  it("returns empty for 0 or negative days", () => {
    expect(getEventScheduleWindow(BASE_KEY, 0)).toEqual([]);
    expect(getEventScheduleWindow(BASE_KEY, -3)).toEqual([]);
  });

  it("floors fractional day counts", () => {
    const window: EventScheduleDay[] = getEventScheduleWindow(BASE_KEY, 3.9);
    expect(window).toHaveLength(3);
  });

  it("produces N consecutive UTC dateKeys starting at dateKey", () => {
    const window = getEventScheduleWindow(BASE_KEY, 5);
    expect(window).toHaveLength(5);
    expect(window[0].dateKey).toBe("2026-04-13");
    expect(window[1].dateKey).toBe("2026-04-14");
    expect(window[4].dateKey).toBe("2026-04-17");
  });

  it("each entry matches getEventSchedule for its own dateKey", () => {
    const window = getEventScheduleWindow(BASE_KEY, 4);
    for (const d of window) {
      expect(d).toEqual(getEventSchedule(d.dateKey));
    }
  });

  it("throws on malformed start dateKey", () => {
    expect(() => getEventScheduleWindow("bad", 3)).toThrow(/Invalid dateKey/);
  });
});

describe("getEventSchedule — purity", () => {
  it("mutating returned events does not poison subsequent calls", () => {
    const a = getEventSchedule(BASE_KEY);
    a.events.length = 0;
    const b = getEventSchedule(BASE_KEY);
    expect(b.events.length).toBeGreaterThan(0);
  });
});
