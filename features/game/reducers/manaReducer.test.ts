import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  MANA_BURN_CONDITION_COST,
  MANA_BURN_CONDITION_GAIN,
  MANA_BURN_HUNGER_COST,
  MANA_BURN_HUNGER_GAIN,
  MANA_BURN_MASTERY_COST,
  MANA_BURN_MASTERY_GAIN,
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

describe("MANA_BURN_FOR_MASTERY", () => {
  it("spends the cost and bumps masteryProgress when affordable + below cap", () => {
    const start = makeState({ mana: 30, masteryProgress: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_MASTERY" });
    expect(next.player.mana).toBe(30 - MANA_BURN_MASTERY_COST);
    expect(next.player.masteryProgress).toBe(40 + MANA_BURN_MASTERY_GAIN);
  });

  it("clamps masteryProgress to 100", () => {
    const start = makeState({ mana: 30, masteryProgress: 98 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_MASTERY" });
    expect(next.player.masteryProgress).toBe(100);
  });

  it("is a no-op when underfunded", () => {
    const start = makeState({ mana: 5, masteryProgress: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_MASTERY" });
    expect(next.player.mana).toBe(5);
    expect(next.player.masteryProgress).toBe(40);
  });

  it("is a no-op when masteryProgress is already 100", () => {
    const start = makeState({ mana: 30, masteryProgress: 100 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_MASTERY" });
    expect(next.player.mana).toBe(30);
    expect(next.player.masteryProgress).toBe(100);
  });
});

describe("MANA_BURN_FOR_CONDITION", () => {
  it("spends the cost and bumps condition when affordable + below cap", () => {
    const start = makeState({ mana: 50, condition: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_CONDITION" });
    expect(next.player.mana).toBe(50 - MANA_BURN_CONDITION_COST);
    expect(next.player.condition).toBe(40 + MANA_BURN_CONDITION_GAIN);
  });

  it("clamps condition to 100", () => {
    const start = makeState({ mana: 50, condition: 96 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_CONDITION" });
    expect(next.player.condition).toBe(100);
  });

  it("is a no-op when underfunded", () => {
    const start = makeState({ mana: 19, condition: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_CONDITION" });
    expect(next.player.mana).toBe(19);
    expect(next.player.condition).toBe(40);
  });

  it("is a no-op when condition is already 100", () => {
    const start = makeState({ mana: 50, condition: 100 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_CONDITION" });
    expect(next.player.mana).toBe(50);
    expect(next.player.condition).toBe(100);
  });
});

describe("MANA_BURN_FOR_HUNGER", () => {
  it("spends the cost and bumps hunger when affordable + below cap", () => {
    const start = makeState({ mana: 30, hunger: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_HUNGER" });
    expect(next.player.mana).toBe(30 - MANA_BURN_HUNGER_COST);
    expect(next.player.hunger).toBe(40 + MANA_BURN_HUNGER_GAIN);
  });

  it("clamps hunger to 100", () => {
    const start = makeState({ mana: 30, hunger: 95 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_HUNGER" });
    expect(next.player.hunger).toBe(100);
  });

  it("is a no-op when underfunded", () => {
    const start = makeState({ mana: 14, hunger: 40 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_HUNGER" });
    expect(next.player.mana).toBe(14);
    expect(next.player.hunger).toBe(40);
  });

  it("is a no-op when hunger is already 100", () => {
    const start = makeState({ mana: 30, hunger: 100 });
    const next = gameReducer(start, { type: "MANA_BURN_FOR_HUNGER" });
    expect(next.player.mana).toBe(30);
    expect(next.player.hunger).toBe(100);
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
