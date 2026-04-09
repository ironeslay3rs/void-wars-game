/**
 * Tests for broker ↔ sin institution joins.
 *
 * Phase 9 unlock 1: each NPC broker carries an `institutionId` (or null
 * for the canonically faction-less ones). These tests pin which brokers
 * belong to which org so a future refactor can't silently drop the
 * affiliation chip.
 */

import { describe, expect, it } from "vitest";

import { brokers } from "@/features/lore/brokerData";
import { getInstitutionById } from "@/features/institutions/institutionSelectors";
import type { InstitutionId } from "@/features/institutions/institutionTypes";

const INSTITUTION_BY_BROKER: Record<string, InstitutionId | null> = {
  "discount-lars": "bonehowl-syndicate",
  "hazel": "inti-court",
  "kessler-9": "pharos-conclave",
  "mama-sol": null,
  "glass": "olympus-concord",
  "the-warden": null,
  "tomo-wrench": "mandate-bureau",
  "sable": "astarte-veil",
  "old-ivory": "pharos-conclave",
  "root": "mandate-bureau",
  "ashveil": "vishrava-ledger",
  "nails": null,
  "iron-jaw": "bonehowl-syndicate",
};

describe("broker ↔ institution joins", () => {
  it("every broker has an institutionId field set (null or canonical id)", () => {
    for (const broker of brokers) {
      expect("institutionId" in broker).toBe(true);
      // Field is either a known InstitutionId or null — never undefined.
      expect(broker.institutionId !== undefined).toBe(true);
    }
  });

  it("each broker maps to its expected institution (10 affiliated, 3 null)", () => {
    for (const broker of brokers) {
      const expected = INSTITUTION_BY_BROKER[broker.id];
      expect(broker.institutionId).toBe(expected);
    }
  });

  it("10 brokers are affiliated and 3 are canonically faction-less", () => {
    const affiliated = brokers.filter((b) => b.institutionId !== null);
    const factionless = brokers.filter((b) => b.institutionId === null);
    expect(affiliated).toHaveLength(10);
    expect(factionless).toHaveLength(3);
  });

  it("the 3 faction-less brokers are Mama Sol, The Warden, and Nails", () => {
    const factionlessIds = brokers
      .filter((b) => b.institutionId === null)
      .map((b) => b.id)
      .sort();
    expect(factionlessIds).toEqual(["mama-sol", "nails", "the-warden"]);
  });

  it("every affiliated broker resolves to a real institution", () => {
    for (const broker of brokers) {
      if (!broker.institutionId) continue;
      const inst = getInstitutionById(broker.institutionId);
      expect(inst).toBeDefined();
      expect(inst.id).toBe(broker.institutionId);
    }
  });

  it("Discount Lars and Iron Jaw both belong to the Bonehowl Syndicate (the canon-locked org)", () => {
    const lars = brokers.find((b) => b.id === "discount-lars");
    const ironJaw = brokers.find((b) => b.id === "iron-jaw");
    expect(lars?.institutionId).toBe("bonehowl-syndicate");
    expect(ironJaw?.institutionId).toBe("bonehowl-syndicate");
  });

  it("affiliated brokers carry an empire-aligned school (school is bio/mecha/pure, not neutral)", () => {
    for (const broker of brokers) {
      if (broker.institutionId === null) continue;
      // Iron Jaw is the lone exception: ex-Bonehowl, now Mercenary Guild,
      // marked `neutral` for crossover work but still wears the syndicate
      // affiliation. Test pins the exception explicitly.
      if (broker.id === "iron-jaw") {
        expect(broker.school).toBe("neutral");
        continue;
      }
      expect(["bio", "mecha", "pure"]).toContain(broker.school);
    }
  });

  it("broker institutions match their school's parent empire (except Iron Jaw)", () => {
    // For each affiliated, non-exception broker, the institution's school
    // empire must match the broker's school field. This guarantees we
    // didn't accidentally tag a Bio broker with a Mecha institution.
    const exceptions = new Set(["iron-jaw"]);
    for (const broker of brokers) {
      if (!broker.institutionId || exceptions.has(broker.id)) continue;
      const inst = getInstitutionById(broker.institutionId);
      // institution → schoolId → which empire it belongs to is encoded
      // upstream in schoolData; here we just check the broker's school
      // string matches the broad empire family of the inst's sin.
      // Wrath/Envy/Lust → bio · Pride/Sloth → mecha · Gluttony/Greed → pure
      const sinToEmpire: Record<string, "bio" | "mecha" | "pure"> = {
        wrath: "bio",
        envy: "bio",
        lust: "bio",
        pride: "mecha",
        sloth: "mecha",
        gluttony: "pure",
        greed: "pure",
      };
      expect(broker.school).toBe(sinToEmpire[inst.sin]);
    }
  });
});
