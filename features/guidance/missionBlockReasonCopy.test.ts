import { describe, expect, it } from "vitest";
import { getMissionQueueBlockHint } from "./missionBlockReasonCopy";

const base = {
  missionTitle: "Test Op",
  pathLabel: "Bio",
  canonLockDetail: "Locked until Book 2.",
  queueLen: 2,
  queueCap: 3,
  launchLockDetail: "Stabilize condition.",
};

describe("getMissionQueueBlockHint", () => {
  it("path-locked", () => {
    expect(
      getMissionQueueBlockHint({ ...base, reason: "path-locked" }),
    ).toContain("Bio");
  });

  it("queue-full", () => {
    expect(
      getMissionQueueBlockHint({ ...base, reason: "queue-full" }),
    ).toContain("2/3");
  });

  it("launch-lock uses doctrine detail", () => {
    expect(
      getMissionQueueBlockHint({ ...base, reason: "launch-lock" }),
    ).toBe("Stabilize condition.");
  });
});
