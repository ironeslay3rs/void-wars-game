/**
 * Tests — territoryRegistry.
 *
 * Coverage:
 * - Registry integrity: exactly 8 canonical territories, unique ids.
 * - Owners are empire|guild discriminated union with valid EmpireId.
 * - Flavor strings use canon empire names (Verdant Coil, Chrome Synod,
 *   Ember Vault, Black City). No "Bio/Mecha/Pure" and no "Spirit" in
 *   narrative strings.
 * - makeTerritoryRegistry() returns deep clones — mutating result leaves
 *   CANONICAL_TERRITORIES untouched.
 * - getTerritoryById returns a clone or null for unknown ids.
 */

import { describe, expect, it } from "vitest";
import {
  CANONICAL_TERRITORIES,
  getTerritoryById,
  makeTerritoryRegistry,
} from "./territoryRegistry";
import type { EmpireId, Territory, TerritoryOwner } from "./territoryTypes";

const VALID_EMPIRES: readonly EmpireId[] = [
  "verdant-coil",
  "chrome-synod",
  "ember-vault",
  "black-city",
];

const FORBIDDEN_NARRATIVE_TOKENS = [
  /\bBio\b/,
  /\bMecha\b/,
  /\bPure\b(?!-)/, // avoid accidental "Pure-" compounds, keep stand-alone
  /\bSpirit\b/i,
];

function isValidOwner(o: TerritoryOwner): boolean {
  if (o.kind === "guild") return typeof o.id === "string" && o.id.length > 0;
  if (o.kind === "empire") return (VALID_EMPIRES as string[]).includes(o.id);
  return false;
}

describe("CANONICAL_TERRITORIES — integrity", () => {
  it("has exactly 8 territories", () => {
    expect(CANONICAL_TERRITORIES.length).toBe(8);
  });

  it("has unique ids", () => {
    const ids = CANONICAL_TERRITORIES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every territory has a valid empire|guild owner", () => {
    for (const t of CANONICAL_TERRITORIES) {
      expect(isValidOwner(t.owner)).toBe(true);
    }
  });

  it("every anchorEmpire is a valid EmpireId", () => {
    for (const t of CANONICAL_TERRITORIES) {
      expect(VALID_EMPIRES).toContain(t.anchorEmpire);
    }
  });

  it("stability ∈ [0,1] and garrison ≥ 0", () => {
    for (const t of CANONICAL_TERRITORIES) {
      expect(t.stability).toBeGreaterThanOrEqual(0);
      expect(t.stability).toBeLessThanOrEqual(1);
      expect(t.garrison).toBeGreaterThanOrEqual(0);
    }
  });

  it("tributeRate entries are non-negative numbers", () => {
    for (const t of CANONICAL_TERRITORIES) {
      for (const [, amt] of Object.entries(t.tributeRate)) {
        expect(typeof amt).toBe("number");
        expect(amt!).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("CANONICAL_TERRITORIES — canon vocabulary", () => {
  it("flavor strings avoid Bio/Mecha/Pure/Spirit labels", () => {
    for (const t of CANONICAL_TERRITORIES) {
      for (const pat of FORBIDDEN_NARRATIVE_TOKENS) {
        expect(
          pat.test(t.flavor),
          `territory ${t.id} flavor contains forbidden token: "${t.flavor}"`,
        ).toBe(false);
      }
    }
  });

  it("references at least one canon empire / Black City name in flavor", () => {
    const canonNames = [
      "Verdant Coil",
      "Chrome Synod",
      "Ember Vault",
      "Black City",
      "Black Market",
      "empire", // covers "every empire's coin..." etc.
      "Empire",
    ];
    for (const t of CANONICAL_TERRITORIES) {
      const hasCanon = canonNames.some((n) => t.flavor.includes(n));
      expect(hasCanon, `territory ${t.id} flavor missing canon name`).toBe(
        true,
      );
    }
  });

  it("canonSource cites lore-canon/", () => {
    for (const t of CANONICAL_TERRITORIES) {
      expect(t.canonSource.startsWith("lore-canon/")).toBe(true);
    }
  });
});

describe("makeTerritoryRegistry", () => {
  it("returns 8 territories matching canon ids", () => {
    const reg = makeTerritoryRegistry();
    expect(reg.length).toBe(8);
    expect(reg.map((t) => t.id).sort()).toEqual(
      CANONICAL_TERRITORIES.map((t) => t.id).sort(),
    );
  });

  it("returns deep clones — mutation does not leak to canon", () => {
    const reg = makeTerritoryRegistry();
    const before = CANONICAL_TERRITORIES[0];
    reg[0].stability = 0.001;
    reg[0].garrison = 1;
    reg[0].owner = { kind: "guild", id: "rogue" };
    (reg[0].tributeRate as Record<string, number>).credits = 9999;

    expect(before.stability).not.toBe(0.001);
    expect(before.garrison).not.toBe(1);
    expect(before.owner.kind).toBe("empire");
    expect((before.tributeRate as Record<string, number>).credits).not.toBe(
      9999,
    );
  });
});

describe("getTerritoryById", () => {
  it("returns a clone for a known id", () => {
    const verdant = getTerritoryById("verdant-coil");
    expect(verdant).not.toBeNull();
    expect((verdant as Territory).name).toBe("Verdant Coil");

    // Mutating the clone doesn't touch canon.
    (verdant as Territory).stability = 0;
    const again = getTerritoryById("verdant-coil") as Territory;
    expect(again.stability).not.toBe(0);
  });

  it("returns null for unknown id", () => {
    expect(getTerritoryById("no-such-place")).toBeNull();
  });
});
