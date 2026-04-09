import { describe, expect, it } from "vitest";
import {
  deriveActiveRuns,
  getRunPressureLine,
  getRunPressureState,
} from "./runPressure";
import { initialGameState } from "@/features/game/initialGameState";

describe("getRunPressureState", () => {
  it("critical when vitals are very low", () => {
    expect(
      getRunPressureState({ condition: 20, hunger: 80, activeRuns: 0 }),
    ).toBe("critical");
    expect(
      getRunPressureState({ condition: 80, hunger: 25, activeRuns: 0 }),
    ).toBe("critical");
  });

  it("danger when vitals are low but not critical", () => {
    expect(
      getRunPressureState({ condition: 40, hunger: 60, activeRuns: 0 }),
    ).toBe("danger");
  });

  it("strained when multiple runs stack without vital danger", () => {
    expect(
      getRunPressureState({ condition: 80, hunger: 80, activeRuns: 2 }),
    ).toBe("strained");
  });

  it("vital thresholds override strained", () => {
    expect(
      getRunPressureState({ condition: 40, hunger: 80, activeRuns: 3 }),
    ).toBe("danger");
  });

  it("stable otherwise", () => {
    expect(
      getRunPressureState({ condition: 80, hunger: 80, activeRuns: 0 }),
    ).toBe("stable");
  });
});

describe("getRunPressureLine", () => {
  it("returns a line per state", () => {
    expect(getRunPressureLine("stable").length).toBeGreaterThan(0);
    expect(getRunPressureLine("critical")).toContain("mistake");
  });
});

describe("deriveActiveRuns", () => {
  it("counts queue entries and optional field thread", () => {
    const base = initialGameState.player;
    expect(deriveActiveRuns(base)).toEqual([]);

    const oneQueued = {
      ...base,
      missionQueue: [
        {
          queueId: "q1",
          missionId: "m1",
          queuedAt: 0,
          startsAt: 0,
          endsAt: 1,
          completedAt: null,
        },
      ],
    };
    expect(deriveActiveRuns(oneQueued)).toEqual(["queue:q1"]);

    const queuedPlusField = {
      ...oneQueued,
      voidRealtimeBinding: {
        zoneId: "howling-scar",
        sessionBucketId: 1,
        clientId: "c1",
      },
    };
    expect(deriveActiveRuns(queuedPlusField)).toEqual(["queue:q1", "field"]);
  });
});
