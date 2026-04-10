import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import {
  CONVERGENCE_REVEAL_HEADLINE,
  canTriggerConvergenceReveal,
} from "@/features/convergence/convergenceReveal";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

function fullyConvergedPlayer(): Partial<GameState["player"]> {
  return {
    factionAlignment: "bio",
    mythicAscension: {
      ...initialGameState.player.mythicAscension,
      convergencePrimed: true,
      convergenceRevealed: false,
    },
    crossSchoolExposure: {
      offPathMaterialsEncountered: 10,
      mismatchEncountered: true,
      schoolsExposed: { bio: true, mecha: true, pure: true },
      anomalyScore: 5,
    },
  };
}

describe("canTriggerConvergenceReveal", () => {
  it("returns true when all three conditions hold and reveal hasn't fired", () => {
    const player = { ...initialGameState.player, ...fullyConvergedPlayer() };
    expect(canTriggerConvergenceReveal(player)).toBe(true);
  });

  it("returns false when convergence is not primed", () => {
    const overrides = fullyConvergedPlayer();
    const player = {
      ...initialGameState.player,
      ...overrides,
      mythicAscension: {
        ...initialGameState.player.mythicAscension,
        ...overrides.mythicAscension,
        convergencePrimed: false,
        convergenceRevealed: false,
      },
    };
    expect(canTriggerConvergenceReveal(player)).toBe(false);
  });

  it("returns false when mismatch has not been encountered", () => {
    const overrides = fullyConvergedPlayer();
    const player = {
      ...initialGameState.player,
      ...overrides,
      crossSchoolExposure: {
        ...overrides.crossSchoolExposure!,
        mismatchEncountered: false,
      },
    };
    expect(canTriggerConvergenceReveal(player)).toBe(false);
  });

  it("returns false when one school is not yet exposed", () => {
    const overrides = fullyConvergedPlayer();
    const player = {
      ...initialGameState.player,
      ...overrides,
      crossSchoolExposure: {
        ...overrides.crossSchoolExposure!,
        schoolsExposed: { bio: true, mecha: true, pure: false },
      },
    };
    expect(canTriggerConvergenceReveal(player)).toBe(false);
  });

  it("returns false when already revealed (one-shot)", () => {
    const overrides = fullyConvergedPlayer();
    const player = {
      ...initialGameState.player,
      ...overrides,
      mythicAscension: {
        ...initialGameState.player.mythicAscension,
        ...overrides.mythicAscension,
        convergenceRevealed: true,
      },
    };
    expect(canTriggerConvergenceReveal(player)).toBe(false);
  });
});

describe("TRIGGER_CONVERGENCE_REVEAL reducer", () => {
  it("sets convergenceRevealed + fires anomaly toast when conditions hold", () => {
    const start = makeState(fullyConvergedPlayer());
    const next = gameReducer(start, {
      type: "TRIGGER_CONVERGENCE_REVEAL",
      payload: { nowMs: 1_000_000 },
    });
    expect(next.player.mythicAscension.convergenceRevealed).toBe(true);
    expect(next.player.lastAnomalyToast).toMatchObject({
      text: CONVERGENCE_REVEAL_HEADLINE,
    });
  });

  it("is a no-op when conditions are not met", () => {
    const start = makeState(); // default player — nothing primed
    const next = gameReducer(start, {
      type: "TRIGGER_CONVERGENCE_REVEAL",
      payload: { nowMs: 1_000_000 },
    });
    expect(next.player.mythicAscension.convergenceRevealed).toBe(false);
  });

  it("is a no-op when already revealed (one-shot)", () => {
    const overrides = fullyConvergedPlayer();
    const start = makeState({
      ...overrides,
      mythicAscension: {
        ...initialGameState.player.mythicAscension,
        ...overrides.mythicAscension,
        convergenceRevealed: true,
      },
    });
    const next = gameReducer(start, {
      type: "TRIGGER_CONVERGENCE_REVEAL",
      payload: { nowMs: 1_000_000 },
    });
    expect(next.player.mythicAscension.convergenceRevealed).toBe(true);
    // No toast (already revealed).
    expect(next.player.lastAnomalyToast).toBeNull();
  });
});
