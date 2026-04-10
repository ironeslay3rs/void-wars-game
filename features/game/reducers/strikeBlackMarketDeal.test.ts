import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("STRIKE_BLACK_MARKET_DEAL — happy paths", () => {
  it("subtracts cost, adds grant, and bumps condition + hunger atomically", () => {
    const start = makeState({
      condition: 50,
      hunger: 60,
      resources: {
        ...initialGameState.player.resources,
        credits: 200,
        runeDust: 10,
      },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-1",
        costs: { credits: 80, runeDust: 5 },
        resourceGains: { emberCore: 3 },
        conditionGain: 12,
        hungerGain: 8,
      },
    });
    expect(next.player.resources.credits).toBe(120);
    expect(next.player.resources.runeDust).toBe(5);
    expect(next.player.resources.emberCore).toBe(3);
    expect(next.player.condition).toBe(62);
    expect(next.player.hunger).toBe(68);
  });

  it("clamps condition to 100 on overflow", () => {
    const start = makeState({
      condition: 95,
      resources: { ...initialGameState.player.resources, credits: 100 },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-2",
        costs: { credits: 50 },
        conditionGain: 20,
      },
    });
    expect(next.player.condition).toBe(100);
  });

  it("clamps hunger to 100 on overflow", () => {
    const start = makeState({
      hunger: 90,
      resources: { ...initialGameState.player.resources, credits: 100 },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-3",
        costs: { credits: 30 },
        hungerGain: 25,
      },
    });
    expect(next.player.hunger).toBe(100);
  });

  it("supports cost-only deals (no grants)", () => {
    const start = makeState({
      resources: { ...initialGameState.player.resources, credits: 100 },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-4",
        costs: { credits: 25 },
      },
    });
    expect(next.player.resources.credits).toBe(75);
  });
});

describe("STRIKE_BLACK_MARKET_DEAL — fail-soft paths", () => {
  it("is a no-op when player can't afford the credit cost", () => {
    const start = makeState({
      resources: { ...initialGameState.player.resources, credits: 10 },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-5",
        costs: { credits: 50 },
        conditionGain: 10,
      },
    });
    expect(next.player.resources.credits).toBe(10);
    expect(next.player.condition).toBe(initialGameState.player.condition);
  });

  it("is a no-op when ANY single cost line is unaffordable (atomic)", () => {
    const start = makeState({
      resources: {
        ...initialGameState.player.resources,
        credits: 100,
        runeDust: 0,
      },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-6",
        costs: { credits: 10, runeDust: 5 },
        conditionGain: 10,
      },
    });
    // Neither cost line is debited.
    expect(next.player.resources.credits).toBe(100);
    expect(next.player.resources.runeDust).toBe(0);
    // Grant did not apply.
    expect(next.player.condition).toBe(initialGameState.player.condition);
  });

  it("ignores zero-amount cost entries (no-op for those lines)", () => {
    const start = makeState({
      resources: { ...initialGameState.player.resources, credits: 100 },
    });
    const next = gameReducer(start, {
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: "test-deal-7",
        costs: { credits: 25, runeDust: 0 },
        conditionGain: 5,
      },
    });
    expect(next.player.resources.credits).toBe(75);
  });
});
