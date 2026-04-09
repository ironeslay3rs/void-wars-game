import { describe, expect, it } from "vitest";
import {
  futureUpgradeBeats,
  upgradeDesignPillarCopy,
} from "./upgradeRoadmapData";
import type { UpgradeDesignPillar } from "./upgradeTypes";

describe("upgradeRoadmapData", () => {
  it("uses unique stable ids", () => {
    const ids = futureUpgradeBeats.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references every design pillar key in copy record", () => {
    const pillars = futureUpgradeBeats.map((b) => b.pillar);
    const unique = [...new Set(pillars)] as UpgradeDesignPillar[];
    for (const p of unique) {
      expect(upgradeDesignPillarCopy[p]).toBeDefined();
      expect(upgradeDesignPillarCopy[p].label.length).toBeGreaterThan(2);
    }
  });
});
