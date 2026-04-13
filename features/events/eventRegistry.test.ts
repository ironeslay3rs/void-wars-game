import { describe, expect, it } from "vitest";

import {
  eventRegistry,
  eventsByKind,
  getEventDefinition,
  type EventDefinition,
  type EventKind,
} from "@/features/events/eventRegistry";

const ALL_KINDS: EventKind[] = ["bounty", "sale", "loot-boost", "incursion"];

describe("eventRegistry — shape", () => {
  it("has at least one entry per event kind", () => {
    for (const kind of ALL_KINDS) {
      expect(eventsByKind(kind).length).toBeGreaterThan(0);
    }
  });

  it("every definition has a non-empty id and unique id", () => {
    const ids = new Set<string>();
    for (const def of eventRegistry) {
      expect(def.id.length).toBeGreaterThan(0);
      expect(ids.has(def.id)).toBe(false);
      ids.add(def.id);
    }
  });

  it("every definition has a positive duration in minutes", () => {
    for (const def of eventRegistry) {
      expect(def.durationMinutes).toBeGreaterThan(0);
      // durations should fit inside a UTC day
      expect(def.durationMinutes).toBeLessThan(24 * 60);
    }
  });

  it("every definition has a non-empty title + flavor", () => {
    for (const def of eventRegistry) {
      expect(def.title.trim().length).toBeGreaterThan(0);
      expect(def.flavor.trim().length).toBeGreaterThan(0);
    }
  });

  it("kind tag matches the EventKind union", () => {
    for (const def of eventRegistry) {
      expect(ALL_KINDS).toContain(def.kind);
    }
  });
});

describe("eventRegistry — reward hints are well-formed", () => {
  it("multiplier rewards carry lootMultiplier > 1", () => {
    const multipliers = eventRegistry.filter(
      (d) => d.reward.kind === "multiplier",
    );
    expect(multipliers.length).toBeGreaterThan(0);
    for (const def of multipliers) {
      if (def.reward.kind !== "multiplier") throw new Error("narrow");
      expect(def.reward.lootMultiplier).toBeGreaterThan(1);
    }
  });

  it("discount rewards carry discountPct in (0, 1)", () => {
    const discounts = eventRegistry.filter((d) => d.reward.kind === "discount");
    expect(discounts.length).toBeGreaterThan(0);
    for (const def of discounts) {
      if (def.reward.kind !== "discount") throw new Error("narrow");
      expect(def.reward.discountPct).toBeGreaterThan(0);
      expect(def.reward.discountPct).toBeLessThan(1);
    }
  });

  it("bounty-pool rewards carry at least one positive resource entry", () => {
    const pools = eventRegistry.filter((d) => d.reward.kind === "bounty-pool");
    expect(pools.length).toBeGreaterThan(0);
    for (const def of pools) {
      if (def.reward.kind !== "bounty-pool") throw new Error("narrow");
      const entries = Object.entries(def.reward.pool);
      expect(entries.length).toBeGreaterThan(0);
      for (const [, amount] of entries) {
        expect(amount).toBeGreaterThan(0);
      }
    }
  });
});

describe("eventRegistry — canon", () => {
  it("never uses the word Spirit (canon is Pure)", () => {
    for (const def of eventRegistry) {
      expect(def.title.toLowerCase()).not.toContain("spirit");
      expect(def.flavor.toLowerCase()).not.toContain("spirit");
    }
  });

  it("references canon factions (Verdant Coil / Chrome Synod / Ember Vault)", () => {
    const blob = eventRegistry
      .map((d) => `${d.title} ${d.flavor}`)
      .join(" ")
      .toLowerCase();
    expect(blob).toContain("verdant coil");
    expect(blob).toContain("chrome synod");
    expect(blob).toContain("ember vault");
  });
});

describe("getEventDefinition", () => {
  it("returns the definition whose id matches", () => {
    const first = eventRegistry[0];
    const found = getEventDefinition(first.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(first.id);
  });

  it("returns null for unknown ids", () => {
    expect(getEventDefinition("does.not.exist")).toBeNull();
    expect(getEventDefinition("")).toBeNull();
  });

  it("returns the exact registry reference (no copy)", () => {
    const first = eventRegistry[0];
    expect(getEventDefinition(first.id)).toBe(first);
  });
});

describe("eventsByKind", () => {
  it("returns only definitions of the requested kind", () => {
    for (const kind of ALL_KINDS) {
      const list = eventsByKind(kind);
      for (const def of list) {
        expect(def.kind).toBe(kind);
      }
    }
  });

  it("partitions eventRegistry with no gaps across all kinds", () => {
    const total = ALL_KINDS.reduce(
      (sum, k) => sum + eventsByKind(k).length,
      0,
    );
    expect(total).toBe(eventRegistry.length);
  });

  it("is pure — mutating the returned list does not corrupt the registry", () => {
    const bounties = eventsByKind("bounty");
    const originalCount = bounties.length;
    bounties.push({} as EventDefinition);
    const again = eventsByKind("bounty");
    expect(again.length).toBe(originalCount);
  });
});
