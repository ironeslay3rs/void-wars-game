import { describe, expect, it } from "vitest";

import {
  QUALITY_ORDER,
  averageMaterialQuality,
  deriveOutputQuality,
  qualityLabels,
  type QualityTier,
} from "@/features/crafting/qualitySystem";

describe("QUALITY_ORDER", () => {
  it("lists tiers low→high: rough, standard, refined, exemplary", () => {
    expect(QUALITY_ORDER).toEqual([
      "rough",
      "standard",
      "refined",
      "exemplary",
    ]);
  });

  it("has exactly four tiers", () => {
    expect(QUALITY_ORDER).toHaveLength(4);
  });
});

describe("qualityLabels", () => {
  it("has a non-empty display label for every tier", () => {
    for (const t of QUALITY_ORDER) {
      expect(typeof qualityLabels[t]).toBe("string");
      expect(qualityLabels[t].length).toBeGreaterThan(0);
    }
  });

  it("does not use the word Spirit in any label (canon-naming)", () => {
    for (const t of QUALITY_ORDER) {
      expect(qualityLabels[t].toLowerCase()).not.toContain("spirit");
    }
  });
});

describe("averageMaterialQuality", () => {
  it("empty input defaults to standard", () => {
    expect(averageMaterialQuality([])).toBe("standard");
  });

  it("single material passes its tier through unchanged", () => {
    for (const t of QUALITY_ORDER) {
      expect(averageMaterialQuality([t])).toBe(t);
    }
  });

  it("averages mixed inputs using rounding", () => {
    // rough(0)+exemplary(3) = 1.5 -> round -> 2 -> refined
    expect(averageMaterialQuality(["rough", "exemplary"])).toBe("refined");
    // standard(1)+refined(2) = 1.5 -> 2 -> refined
    expect(averageMaterialQuality(["standard", "refined"])).toBe("refined");
    // rough(0)+rough(0)+standard(1) = 0.33 -> 0 -> rough
    expect(
      averageMaterialQuality(["rough", "rough", "standard"]),
    ).toBe("rough");
  });

  it("uniform input returns that same tier", () => {
    expect(
      averageMaterialQuality(["refined", "refined", "refined"]),
    ).toBe("refined");
  });

  it("does not mutate its input array", () => {
    const mats: QualityTier[] = ["rough", "exemplary"];
    const snapshot = [...mats];
    averageMaterialQuality(mats);
    expect(mats).toEqual(snapshot);
  });
});

describe("deriveOutputQuality — profession bonus", () => {
  it("zero bonus equals raw material average", () => {
    const mats: QualityTier[] = ["standard", "standard"];
    expect(deriveOutputQuality(mats, 0)).toBe(averageMaterialQuality(mats));
  });

  it("+1 bonus lifts standard → refined", () => {
    expect(deriveOutputQuality(["standard"], 1)).toBe("refined");
  });

  it("+2 bonus lifts standard → exemplary", () => {
    expect(deriveOutputQuality(["standard"], 2)).toBe("exemplary");
  });

  it("negative bonus demotes standard → rough", () => {
    expect(deriveOutputQuality(["standard"], -1)).toBe("rough");
  });

  it("empty materials + zero bonus yields standard baseline", () => {
    expect(deriveOutputQuality([], 0)).toBe("standard");
  });

  it("empty materials + large bonus is capped at exemplary", () => {
    expect(deriveOutputQuality([], 99)).toBe("exemplary");
  });

  it("saturates at exemplary when bonus overflows tier cap", () => {
    expect(deriveOutputQuality(["exemplary"], 5)).toBe("exemplary");
  });

  it("saturates at rough when bonus underflows tier floor", () => {
    expect(deriveOutputQuality(["rough"], -5)).toBe("rough");
  });
});

describe("deriveOutputQuality — tier boundaries", () => {
  it("boundary: standard + +1 exactly crosses into refined", () => {
    expect(deriveOutputQuality(["standard"], 1)).toBe("refined");
  });

  it("boundary: refined + +1 exactly crosses into exemplary", () => {
    expect(deriveOutputQuality(["refined"], 1)).toBe("exemplary");
  });

  it("boundary: rough + -1 stays at rough (floor)", () => {
    expect(deriveOutputQuality(["rough"], -1)).toBe("rough");
  });

  it("boundary: exemplary + +1 stays at exemplary (ceil)", () => {
    expect(deriveOutputQuality(["exemplary"], 1)).toBe("exemplary");
  });
});

describe("deriveOutputQuality — purity", () => {
  it("is deterministic across repeated calls with same args", () => {
    const a = deriveOutputQuality(["rough", "refined"], 1);
    const b = deriveOutputQuality(["rough", "refined"], 1);
    expect(a).toBe(b);
  });

  it("does not mutate its materials input", () => {
    const mats: QualityTier[] = ["refined", "refined"];
    const snap = [...mats];
    deriveOutputQuality(mats, 2);
    expect(mats).toEqual(snap);
  });
});
