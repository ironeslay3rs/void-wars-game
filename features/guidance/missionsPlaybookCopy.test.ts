import { describe, expect, it } from "vitest";
import {
  getMissionConsequenceHint,
  getMissionsPlaybookCallout,
  getMissionsPlaybookLines,
} from "./missionsPlaybookCopy";

describe("missionsPlaybookCopy", () => {
  it("returns three teaching lines", () => {
    expect(getMissionsPlaybookLines().length).toBe(3);
  });

  it("callout when queue empty", () => {
    expect(
      getMissionsPlaybookCallout({
        queueLen: 0,
        queueFull: false,
        launchLocked: false,
        inProgress: 0,
      }),
    ).toContain("Nothing queued");
  });

  it("prioritizes queue full over empty queue", () => {
    expect(
      getMissionsPlaybookCallout({
        queueLen: 3,
        queueFull: true,
        launchLocked: false,
        inProgress: 0,
      }),
    ).toContain("full");
  });

  it("consequence hint reflects vitals bands", () => {
    expect(
      getMissionConsequenceHint({ condition: 20, hunger: 80 }),
    ).toContain("recover clean");
    expect(
      getMissionConsequenceHint({ condition: 40, hunger: 40 }),
    ).toContain("weakened");
    expect(
      getMissionConsequenceHint({ condition: 80, hunger: 80 }),
    ).toContain("for now");
  });
});
