/**
 * BROKER_INTERACT grants rapport. The transactional loop now feeds the
 * relationship layer — not just dialogue does. Canon fit: every repeat
 * visit is a relationship fact (Mama Sol keeps a log of returns).
 */
import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import { BROKER_INTERACT_RAPPORT_GAIN } from "@/features/game/reducers/economyReducer";
import type { GameState } from "@/features/game/gameTypes";

function seedState(): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      resources: {
        ...initialGameState.player.resources,
        credits: 500,
      },
    },
  };
}

describe("BROKER_INTERACT grants rapport on success", () => {
  it("raises rapport by BROKER_INTERACT_RAPPORT_GAIN after a successful buy", () => {
    const start = seedState();
    const initialRapport =
      start.player.brokerRapport["discount-lars"] ?? 0;
    const after = gameReducer(start, {
      type: "BROKER_INTERACT",
      payload: { brokerId: "discount-lars" },
    });
    expect(after.player.brokerRapport["discount-lars"]).toBe(
      initialRapport + BROKER_INTERACT_RAPPORT_GAIN,
    );
  });

  it("does not grant rapport when the transaction fails (unaffordable)", () => {
    const state = {
      ...seedState(),
      player: {
        ...seedState().player,
        resources: { ...seedState().player.resources, credits: 0 },
      },
    };
    const after = gameReducer(state, {
      type: "BROKER_INTERACT",
      payload: { brokerId: "discount-lars" },
    });
    expect(after.player.brokerRapport["discount-lars"] ?? 0).toBe(0);
  });

  it("stamps brokerLastContactAt on interact (feeds rapport decay)", () => {
    const before = Date.now();
    const after = gameReducer(seedState(), {
      type: "BROKER_INTERACT",
      payload: { brokerId: "discount-lars" },
    });
    const stamped = after.player.brokerLastContactAt["discount-lars"];
    expect(stamped).toBeDefined();
    expect(stamped!).toBeGreaterThanOrEqual(before);
  });

  it("rapport gain is clamped to 100", () => {
    const state = {
      ...seedState(),
      player: {
        ...seedState().player,
        brokerRapport: { "discount-lars": 99 },
      },
    };
    const after = gameReducer(state, {
      type: "BROKER_INTERACT",
      payload: { brokerId: "discount-lars" },
    });
    expect(after.player.brokerRapport["discount-lars"]).toBeLessThanOrEqual(100);
  });

  it("granting rapport can trigger Keepsake (compounds with system)", () => {
    const state = {
      ...seedState(),
      player: {
        ...seedState().player,
        brokerRapport: { "discount-lars": 79 },
      },
    };
    const after = gameReducer(state, {
      type: "BROKER_INTERACT",
      payload: { brokerId: "discount-lars" },
    });
    // 79 + 2 = 81, crosses the 80 Keepsake threshold
    expect(after.player.brokerRapport["discount-lars"]).toBe(81);
    expect(after.player.brokerKeepsakes["discount-lars"]).toBe(true);
  });
});
