import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import type { PlayerState } from "@/features/game/gameTypes";
import {
  PANTHEON_PERKS,
  applyPantheonPerkToPlayer,
  getPlayerPantheonPerk,
} from "@/features/pantheons/pantheonPerks";
import { PANTHEON_ORDER } from "@/features/pantheons/pantheonData";

const basePlayer = initialGameState.player;

describe("PANTHEON_PERKS table", () => {
  it("has exactly 7 entries matching the canonical pantheon order", () => {
    expect(Object.keys(PANTHEON_PERKS)).toHaveLength(7);
    for (const id of PANTHEON_ORDER) {
      expect(PANTHEON_PERKS[id]).toBeDefined();
    }
  });

  it("every perk has a non-zero delta", () => {
    for (const perk of Object.values(PANTHEON_PERKS)) {
      expect(perk.delta).not.toBe(0);
    }
  });

  it("all deltas are small (within ±10) to stay in nudge band", () => {
    for (const perk of Object.values(PANTHEON_PERKS)) {
      expect(Math.abs(perk.delta)).toBeLessThanOrEqual(10);
    }
  });
});

describe("getPlayerPantheonPerk", () => {
  it("returns null when player has no affinity", () => {
    expect(
      getPlayerPantheonPerk({ ...basePlayer, affinitySchoolId: null }),
    ).toBeNull();
  });

  it("returns the norse perk for bonehowl affinity", () => {
    const perk = getPlayerPantheonPerk({
      ...basePlayer,
      affinitySchoolId: "bonehowl-of-fenrir",
    });
    expect(perk).toMatchObject({ stat: "condition", delta: 1 });
  });

  it("returns the chinese perk for clockwork-mandate affinity", () => {
    const perk = getPlayerPantheonPerk({
      ...basePlayer,
      affinitySchoolId: "clockwork-mandate-of-heaven",
    });
    expect(perk).toMatchObject({ stat: "voidInstability", delta: -1 });
  });
});

describe("applyPantheonPerkToPlayer", () => {
  function playerWith(
    overrides: Partial<PlayerState>,
  ): PlayerState {
    return { ...basePlayer, ...overrides };
  }

  it("adds condition for norse-aligned player", () => {
    const p = playerWith({
      affinitySchoolId: "bonehowl-of-fenrir",
      condition: 50,
    });
    expect(applyPantheonPerkToPlayer(p).condition).toBe(51);
  });

  it("adds credits for hindu-aligned player", () => {
    const p = playerWith({
      affinitySchoolId: "thousand-hands-of-vishrava",
      resources: { ...basePlayer.resources, credits: 100 },
    });
    expect(applyPantheonPerkToPlayer(p).resources.credits).toBe(105);
  });

  it("reduces void instability for chinese-aligned player", () => {
    const p = playerWith({
      affinitySchoolId: "clockwork-mandate-of-heaven",
      voidInstability: 10,
    });
    expect(applyPantheonPerkToPlayer(p).voidInstability).toBe(9);
  });

  it("clamps void instability to 0 (no negative)", () => {
    const p = playerWith({
      affinitySchoolId: "clockwork-mandate-of-heaven",
      voidInstability: 0,
    });
    expect(applyPantheonPerkToPlayer(p).voidInstability).toBe(0);
  });

  it("clamps condition to 100", () => {
    const p = playerWith({
      affinitySchoolId: "bonehowl-of-fenrir",
      condition: 100,
    });
    expect(applyPantheonPerkToPlayer(p).condition).toBe(100);
  });

  it("returns the same player reference when no affinity is set", () => {
    const p = playerWith({ affinitySchoolId: null });
    expect(applyPantheonPerkToPlayer(p)).toBe(p);
  });

  it("adds mana for canaanite-aligned player (clamped to manaMax)", () => {
    const p = playerWith({
      affinitySchoolId: "crimson-altars-of-astarte",
      mana: 39,
      manaMax: 40,
    });
    expect(applyPantheonPerkToPlayer(p).mana).toBe(40);
  });
});
