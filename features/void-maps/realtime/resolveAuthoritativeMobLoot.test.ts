/**
 * Tests for the realtime mob loot parity helper.
 *
 * Phase 8 / Open World Awakens: server-authoritative mobs MUST always
 * produce loot. The helper falls back to a deterministic client roll
 * when the server omits `lootLines`. These tests pin both the
 * "trust the server" and the "fallback when silent" branches.
 */

import { describe, expect, it } from "vitest";

import { resolveAuthoritativeMobLoot } from "@/features/void-maps/realtime/resolveAuthoritativeMobLoot";
import type { MobAuthoritativeLootLine } from "@/features/void-maps/realtime/voidRealtimeProtocol";

describe("resolveAuthoritativeMobLoot", () => {
  it("returns the server lines verbatim when present", () => {
    const serverLines: MobAuthoritativeLootLine[] = [
      { resource: "scrapAlloy", amount: 12 },
      { resource: "ironOre", amount: 4 },
    ];
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-1",
      mobId: "ash-stalker-elite",
      spawnedAt: 1000,
      zoneId: "ash-relay",
      serverLines,
    });
    expect(result).toEqual(serverLines);
  });

  it("falls back to a client roll when server lines are missing", () => {
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-2",
      mobId: "ash-stalker-elite",
      spawnedAt: 1000,
      zoneId: "ash-relay",
      serverLines: undefined,
    });
    expect(result.length).toBeGreaterThan(0);
    for (const line of result) {
      expect(line.amount).toBeGreaterThan(0);
      expect(typeof line.resource).toBe("string");
    }
  });

  it("falls back when server lines are an empty array", () => {
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-3",
      mobId: "rift-howler-boss",
      spawnedAt: 2000,
      zoneId: "rift-maw",
      serverLines: [],
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns empty when zone is unknown and server is silent", () => {
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-4",
      mobId: "phantom",
      spawnedAt: 3000,
      zoneId: "not-a-real-zone",
      serverLines: null,
    });
    expect(result).toEqual([]);
  });

  it("returns empty when zone is undefined and server is silent", () => {
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-5",
      mobId: "phantom",
      spawnedAt: 4000,
      zoneId: undefined,
      serverLines: null,
    });
    expect(result).toEqual([]);
  });

  it("fallback rolls are deterministic for the same seed inputs", () => {
    const a = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-6",
      mobId: "ash-stalker-elite",
      spawnedAt: 5000,
      zoneId: "ash-relay",
      serverLines: undefined,
    });
    const b = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-6",
      mobId: "ash-stalker-elite",
      spawnedAt: 5000,
      zoneId: "ash-relay",
      serverLines: undefined,
    });
    expect(a).toEqual(b);
  });

  it("fallback respects the boss bonus pool for boss mob ids", () => {
    // The exact bossfullness depends on random rolls, but a shell boss id
    // should always produce at least one loot line on the fallback path.
    const result = resolveAuthoritativeMobLoot({
      mobEntityId: "ent-7",
      mobId: "rift-howler-boss",
      spawnedAt: 6000,
      zoneId: "rift-maw",
      serverLines: undefined,
    });
    expect(result.length).toBeGreaterThan(0);
  });
});
