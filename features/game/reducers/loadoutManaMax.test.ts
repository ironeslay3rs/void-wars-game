import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import { LOADOUT_MANA_MAX } from "@/features/mana/manaTypes";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("LOADOUT_MANA_MAX table", () => {
  it("assault has the lowest cap", () => {
    expect(LOADOUT_MANA_MAX.assault).toBeLessThan(LOADOUT_MANA_MAX.breach);
    expect(LOADOUT_MANA_MAX.assault).toBeLessThan(LOADOUT_MANA_MAX.support);
  });

  it("support has the highest cap", () => {
    expect(LOADOUT_MANA_MAX.support).toBeGreaterThan(LOADOUT_MANA_MAX.breach);
    expect(LOADOUT_MANA_MAX.support).toBeGreaterThan(LOADOUT_MANA_MAX.assault);
  });

  it("all caps are positive integers in a small band", () => {
    for (const cap of Object.values(LOADOUT_MANA_MAX)) {
      expect(cap).toBeGreaterThanOrEqual(20);
      expect(cap).toBeLessThanOrEqual(100);
      expect(Number.isInteger(cap)).toBe(true);
    }
  });
});

describe("SET_FIELD_LOADOUT_PROFILE re-caps mana", () => {
  it("switching to support raises manaMax to the support cap and preserves current mana", () => {
    const start = makeState({
      fieldLoadoutProfile: "assault",
      mana: 30,
      manaMax: LOADOUT_MANA_MAX.assault,
    });
    const next = gameReducer(start, {
      type: "SET_FIELD_LOADOUT_PROFILE",
      payload: "support",
    });
    expect(next.player.fieldLoadoutProfile).toBe("support");
    expect(next.player.manaMax).toBe(LOADOUT_MANA_MAX.support);
    // Current mana below the new cap is preserved.
    expect(next.player.mana).toBe(30);
  });

  it("switching to assault from support clamps current mana down to the new (lower) cap", () => {
    const start = makeState({
      fieldLoadoutProfile: "support",
      mana: LOADOUT_MANA_MAX.support,
      manaMax: LOADOUT_MANA_MAX.support,
    });
    const next = gameReducer(start, {
      type: "SET_FIELD_LOADOUT_PROFILE",
      payload: "assault",
    });
    expect(next.player.fieldLoadoutProfile).toBe("assault");
    expect(next.player.manaMax).toBe(LOADOUT_MANA_MAX.assault);
    // Current mana cropped to the new cap.
    expect(next.player.mana).toBe(LOADOUT_MANA_MAX.assault);
  });

  it("switching to breach mid-pool keeps mana intact and re-caps to the breach value", () => {
    const start = makeState({
      fieldLoadoutProfile: "assault",
      mana: 25,
      manaMax: LOADOUT_MANA_MAX.assault,
    });
    const next = gameReducer(start, {
      type: "SET_FIELD_LOADOUT_PROFILE",
      payload: "breach",
    });
    expect(next.player.manaMax).toBe(LOADOUT_MANA_MAX.breach);
    expect(next.player.mana).toBe(25);
  });
});

describe("initial state respects loadout cap", () => {
  it("default assault profile starts at the assault cap", () => {
    expect(initialGameState.player.fieldLoadoutProfile).toBe("assault");
    expect(initialGameState.player.manaMax).toBe(LOADOUT_MANA_MAX.assault);
    expect(initialGameState.player.mana).toBe(LOADOUT_MANA_MAX.assault);
  });
});
