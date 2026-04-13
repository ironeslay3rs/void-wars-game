import { describe, it, expect } from "vitest";
import {
  ALL_SCHOOL_BLESSINGS,
  BLACK_CITY_FUSION_BLESSINGS,
  CHROME_SYNOD_BLESSINGS,
  EMBER_VAULT_BLESSINGS,
  VERDANT_COIL_BLESSINGS,
  blessingsForSchool,
  getBlessingById,
} from "./blessingRegistry";
import type { BlessingFusionPair, BlessingSchool } from "./blessingTypes";

/**
 * Registry integrity — 4/4/4 commons, 3 fusions, unique ids, canon flavor.
 * Canon anchor: lore-canon/CLAUDE.md — "Pure" never "Spirit"; empire names
 * (Verdant Coil / Chrome Synod / Ember Vault / Black City) in flavor.
 */
describe("blessingRegistry: counts + id uniqueness", () => {
  it("has exactly 4 blessings per school and 3 fusion blessings", () => {
    expect(VERDANT_COIL_BLESSINGS).toHaveLength(4);
    expect(CHROME_SYNOD_BLESSINGS).toHaveLength(4);
    expect(EMBER_VAULT_BLESSINGS).toHaveLength(4);
    expect(BLACK_CITY_FUSION_BLESSINGS).toHaveLength(3);
    expect(ALL_SCHOOL_BLESSINGS).toHaveLength(12);
  });

  it("assigns unique ids across schools + fusions", () => {
    const ids = [
      ...ALL_SCHOOL_BLESSINGS.map((b) => b.id),
      ...BLACK_CITY_FUSION_BLESSINGS.map((f) => f.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tags each school blessing with its own school", () => {
    VERDANT_COIL_BLESSINGS.forEach((b) => expect(b.school).toBe("bio"));
    CHROME_SYNOD_BLESSINGS.forEach((b) => expect(b.school).toBe("mecha"));
    EMBER_VAULT_BLESSINGS.forEach((b) => expect(b.school).toBe("pure"));
  });
});

describe("blessingRegistry: canon flavor", () => {
  it("uses empire names and never the word 'Spirit'", () => {
    const all = [...ALL_SCHOOL_BLESSINGS, ...BLACK_CITY_FUSION_BLESSINGS];
    for (const b of all) {
      expect(b.flavor).not.toMatch(/Spirit/i);
      expect(b.flavor.length).toBeGreaterThan(0);
    }
    const empires = ["Verdant Coil", "Chrome Synod", "Ember Vault", "Black City"];
    const anyEmpireMentioned = all.some((b) =>
      empires.some((name) => b.flavor.includes(name)),
    );
    expect(anyEmpireMentioned).toBe(true);
  });

  it("every school has at least one empire-branded flavor line", () => {
    expect(
      VERDANT_COIL_BLESSINGS.some((b) =>
        b.flavor.includes("Verdant Coil") || b.flavor.includes("Coil"),
      ),
    ).toBe(true);
    expect(
      CHROME_SYNOD_BLESSINGS.some((b) =>
        b.flavor.includes("Chrome Synod") || b.flavor.includes("Synod"),
      ),
    ).toBe(true);
    expect(
      EMBER_VAULT_BLESSINGS.some((b) =>
        b.flavor.includes("Ember Vault") || b.flavor.includes("Vault"),
      ),
    ).toBe(true);
  });
});

describe("blessingRegistry: fusion pair overlap", () => {
  it("each fusion pair names two of the three schools", () => {
    const validPairs: BlessingFusionPair[] = [
      "bio+mecha",
      "mecha+pure",
      "pure+bio",
    ];
    const pairs = BLACK_CITY_FUSION_BLESSINGS.map((f) => f.pair);
    for (const p of pairs) expect(validPairs).toContain(p);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("each fusion ships exactly two costs", () => {
    for (const f of BLACK_CITY_FUSION_BLESSINGS) {
      expect(f.costs).toHaveLength(2);
      expect(f.rarity).toBe("fusion");
    }
  });
});

describe("blessingRegistry: accessors", () => {
  it("blessingsForSchool routes to the right table", () => {
    expect(blessingsForSchool("bio")).toBe(VERDANT_COIL_BLESSINGS);
    expect(blessingsForSchool("mecha")).toBe(CHROME_SYNOD_BLESSINGS);
    expect(blessingsForSchool("pure")).toBe(EMBER_VAULT_BLESSINGS);
  });

  it("getBlessingById finds school and fusion blessings", () => {
    const sample = ALL_SCHOOL_BLESSINGS[0];
    expect(getBlessingById(sample.id)).toBe(sample);
    const fusion = BLACK_CITY_FUSION_BLESSINGS[0];
    expect(getBlessingById(fusion.id)).toBe(fusion);
  });

  it("getBlessingById returns null for unknown ids", () => {
    expect(getBlessingById("not-a-blessing")).toBeNull();
  });

  it("every school keyed by BlessingSchool is reachable", () => {
    const schools: BlessingSchool[] = ["bio", "mecha", "pure"];
    for (const s of schools) {
      const table = blessingsForSchool(s);
      expect(table.length).toBeGreaterThan(0);
    }
  });
});
