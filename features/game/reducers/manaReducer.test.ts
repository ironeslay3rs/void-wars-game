import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  VENT_MANA_COST,
  VENT_MANA_INSTABILITY_RELIEF,
} from "@/features/mana/manaTypes";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("MANA_GAIN", () => {
  it("adds the requested amount and clamps to manaMax", () => {
    const start = makeState({ mana: 10, manaMax: 50 });
    const next = gameReducer(start, {
      type: "MANA_GAIN",
      payload: { amount: 15 },
    });
    expect(next.player.mana).toBe(25);
  });

  it("clamps gains to manaMax (no overflow)", () => {
    const start = makeState({ mana: 45, manaMax: 50 });
    const next = gameReducer(start, {
      type: "MANA_GAIN",
      payload: { amount: 20 },
    });
    expect(next.player.mana).toBe(50);
  });

  it("is a no-op for zero / negative gains", () => {
    const start = makeState({ mana: 30, manaMax: 50 });
    const same = gameReducer(start, {
      type: "MANA_GAIN",
      payload: { amount: 0 },
    });
    expect(same.player.mana).toBe(30);
    const negNoop = gameReducer(start, {
      type: "MANA_GAIN",
      payload: { amount: -10 },
    });
    expect(negNoop.player.mana).toBe(30);
  });
});

describe("MANA_SPEND", () => {
  it("subtracts the requested amount when affordable", () => {
    const start = makeState({ mana: 30, manaMax: 50 });
    const next = gameReducer(start, {
      type: "MANA_SPEND",
      payload: { amount: 12 },
    });
    expect(next.player.mana).toBe(18);
  });

  it("is a no-op (fail-soft) when mana < amount", () => {
    const start = makeState({ mana: 5, manaMax: 50 });
    const next = gameReducer(start, {
      type: "MANA_SPEND",
      payload: { amount: 12 },
    });
    expect(next.player.mana).toBe(5);
  });
});

describe("MANA_RESTORE_FULL", () => {
  it("fills mana to manaMax", () => {
    const start = makeState({ mana: 7, manaMax: 50 });
    const next = gameReducer(start, { type: "MANA_RESTORE_FULL" });
    expect(next.player.mana).toBe(50);
  });

  it("is a no-op when already at cap", () => {
    const start = makeState({ mana: 50, manaMax: 50 });
    const next = gameReducer(start, { type: "MANA_RESTORE_FULL" });
    expect(next.player.mana).toBe(50);
  });
});

describe("VENT_MANA_TO_VOID_INSTABILITY", () => {
  it("spends 20 mana and reduces void instability by 10 when affordable", () => {
    const start = makeState({ mana: 50, voidInstability: 30 });
    const next = gameReducer(start, {
      type: "VENT_MANA_TO_VOID_INSTABILITY",
    });
    expect(next.player.mana).toBe(50 - VENT_MANA_COST);
    expect(next.player.voidInstability).toBe(30 - VENT_MANA_INSTABILITY_RELIEF);
  });

  it("clamps voidInstability to 0 when relief exceeds current strain", () => {
    const start = makeState({ mana: 50, voidInstability: 4 });
    const next = gameReducer(start, {
      type: "VENT_MANA_TO_VOID_INSTABILITY",
    });
    expect(next.player.mana).toBe(50 - VENT_MANA_COST);
    expect(next.player.voidInstability).toBe(0);
  });

  it("is a no-op when mana is below the vent cost", () => {
    const start = makeState({ mana: 19, voidInstability: 30 });
    const next = gameReducer(start, {
      type: "VENT_MANA_TO_VOID_INSTABILITY",
    });
    expect(next.player.mana).toBe(19);
    expect(next.player.voidInstability).toBe(30);
  });

  it("is a no-op when void instability is already 0", () => {
    const start = makeState({ mana: 50, voidInstability: 0 });
    const next = gameReducer(start, {
      type: "VENT_MANA_TO_VOID_INSTABILITY",
    });
    expect(next.player.mana).toBe(50);
    expect(next.player.voidInstability).toBe(0);
  });
});

describe("SET_MANA_MAX", () => {
  it("raises manaMax and preserves current mana when below new cap", () => {
    const start = makeState({ mana: 40, manaMax: 50 });
    const next = gameReducer(start, {
      type: "SET_MANA_MAX",
      payload: { max: 80 },
    });
    expect(next.player.manaMax).toBe(80);
    expect(next.player.mana).toBe(40);
  });

  it("clips current mana down when manaMax shrinks", () => {
    const start = makeState({ mana: 45, manaMax: 50 });
    const next = gameReducer(start, {
      type: "SET_MANA_MAX",
      payload: { max: 30 },
    });
    expect(next.player.manaMax).toBe(30);
    expect(next.player.mana).toBe(30);
  });

  it("floors max to >= 1", () => {
    const start = makeState({ mana: 5, manaMax: 50 });
    const next = gameReducer(start, {
      type: "SET_MANA_MAX",
      payload: { max: 0 },
    });
    expect(next.player.manaMax).toBe(1);
    expect(next.player.mana).toBe(1);
  });
});
