import { describe, expect, it } from "vitest";

import {
  PHASE2_MATERIALS,
  PHASE2_MATERIAL_KEYS,
  getPhase2Material,
  getPhase2MaterialsBySchool,
  isPhase2Material,
  type Phase2MaterialEntry,
  type Phase2School,
} from "@/features/materials/phase2Registry";
import type { ResourceKey } from "@/features/game/gameTypes";

const PHASE2_KEYS: ResourceKey[] = [
  "veinshard",
  "heartIron",
  "veilAsh",
  "meldshard",
];

const APEX_KEYS: ResourceKey[] = ["bloodvein", "ironHeart", "ashveil"];
const PHASE1_BOSS_KEYS: ResourceKey[] = [
  "coilboundLattice",
  "ashSynodRelic",
  "vaultLatticeShard",
];

describe("phase2Registry — integrity", () => {
  it("contains all four phase2 ResourceKeys", () => {
    const keys = new Set(PHASE2_MATERIAL_KEYS);
    for (const k of PHASE2_KEYS) {
      expect(keys.has(k)).toBe(true);
    }
    expect(PHASE2_MATERIALS).toHaveLength(4);
  });

  it("every entry is tier 'phase2' with required string fields", () => {
    for (const mat of PHASE2_MATERIALS) {
      expect(mat.tier).toBe("phase2");
      expect(typeof mat.displayName).toBe("string");
      expect(mat.displayName.length).toBeGreaterThan(0);
      expect(typeof mat.flavorLine).toBe("string");
      expect(mat.flavorLine.length).toBeGreaterThan(0);
      expect(Array.isArray(mat.sourceHints)).toBe(true);
      expect(mat.sourceHints.length).toBeGreaterThan(0);
    }
  });

  it("no duplicate keys", () => {
    const keys = PHASE2_MATERIALS.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("canon never says 'Spirit' — 'Pure' is the only term used", () => {
    for (const mat of PHASE2_MATERIALS) {
      const blob = `${mat.displayName} ${mat.flavorLine} ${mat.sourceHints.join(" ")}`;
      expect(/spirit/i.test(blob)).toBe(false);
    }
  });
});

describe("phase2Registry — apexParent + school mapping", () => {
  const byKey: Record<string, Phase2MaterialEntry> = Object.fromEntries(
    PHASE2_MATERIALS.map((m) => [m.key, m]),
  );

  it("veinshard → bio / bloodvein", () => {
    expect(byKey.veinshard.school).toBe("bio");
    expect(byKey.veinshard.apexParent).toBe("bloodvein");
    expect(byKey.veinshard.displayName).toBe("Veinshard");
  });

  it("heartIron → mecha / ironHeart", () => {
    expect(byKey.heartIron.school).toBe("mecha");
    expect(byKey.heartIron.apexParent).toBe("ironHeart");
    expect(byKey.heartIron.displayName).toBe("Heart-Iron");
  });

  it("veilAsh → pure / ashveil", () => {
    expect(byKey.veilAsh.school).toBe("pure");
    expect(byKey.veilAsh.apexParent).toBe("ashveil");
    expect(byKey.veilAsh.displayName).toBe("Veil Ash");
  });

  it("meldshard → neutral / meldheart", () => {
    expect(byKey.meldshard.school).toBe("neutral");
    expect(byKey.meldshard.apexParent).toBe("meldheart");
    expect(byKey.meldshard.displayName).toBe("Meldshard");
  });

  it("flavor copy references the Verdant Coil / Chrome Synod / Ember Vault empires", () => {
    const all = PHASE2_MATERIALS.map((m) => m.sourceHints.join(" ")).join(" ");
    expect(all).toMatch(/Verdant Coil/);
    expect(all).toMatch(/Chrome Synod/);
    expect(all).toMatch(/Ember Vault/);
  });
});

describe("phase2Registry — getters", () => {
  it("getPhase2Material returns the matching entry", () => {
    const mat = getPhase2Material("veilAsh");
    expect(mat?.key).toBe("veilAsh");
    expect(mat?.school).toBe("pure");
  });

  it("getPhase2Material returns undefined for non-phase2 keys", () => {
    expect(getPhase2Material("bloodvein")).toBeUndefined();
    expect(getPhase2Material("credits")).toBeUndefined();
    expect(getPhase2Material("coilboundLattice")).toBeUndefined();
  });

  it("getPhase2MaterialsBySchool filters correctly", () => {
    const bio = getPhase2MaterialsBySchool("bio");
    expect(bio.map((m) => m.key)).toEqual(["veinshard"]);

    const mecha = getPhase2MaterialsBySchool("mecha");
    expect(mecha.map((m) => m.key)).toEqual(["heartIron"]);

    const pure = getPhase2MaterialsBySchool("pure");
    expect(pure.map((m) => m.key)).toEqual(["veilAsh"]);

    const neutral: Phase2School = "neutral";
    const neut = getPhase2MaterialsBySchool(neutral);
    expect(neut.map((m) => m.key)).toEqual(["meldshard"]);
  });
});

describe("phase2Registry — isPhase2Material", () => {
  it("returns true for every phase2 key", () => {
    for (const k of PHASE2_KEYS) {
      expect(isPhase2Material(k)).toBe(true);
    }
  });

  it("returns false for apex parents (Bloodvein / Ironheart / Ashveil)", () => {
    for (const k of APEX_KEYS) {
      expect(isPhase2Material(k)).toBe(false);
    }
  });

  it("returns false for phase 1 boss-drop mats", () => {
    for (const k of PHASE1_BOSS_KEYS) {
      expect(isPhase2Material(k)).toBe(false);
    }
  });

  it("returns false for baseline currencies", () => {
    const baseline: ResourceKey[] = [
      "credits",
      "scrapAlloy",
      "runeDust",
      "emberCore",
      "bioSamples",
    ];
    for (const k of baseline) {
      expect(isPhase2Material(k)).toBe(false);
    }
  });
});

describe("phase2Registry — purity", () => {
  it("PHASE2_MATERIALS retains its shape across repeated calls", () => {
    const snapshot = JSON.stringify(PHASE2_MATERIALS);
    // Exercise getters — none should mutate the registry.
    void getPhase2Material("veinshard");
    void getPhase2MaterialsBySchool("bio");
    void isPhase2Material("meldshard");
    expect(JSON.stringify(PHASE2_MATERIALS)).toBe(snapshot);
    expect(PHASE2_MATERIALS).toHaveLength(4);
  });

  it("getPhase2MaterialsBySchool returns a fresh array each call", () => {
    const a = getPhase2MaterialsBySchool("bio");
    const b = getPhase2MaterialsBySchool("bio");
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
