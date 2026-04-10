import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import {
  CONVERGENCE_MANA_MAX_BONUS,
  CONVERGENCE_REWARD_BONUS_PCT,
  getConvergenceRewardMultiplier,
  isConverged,
  isConvergenceHybridDrainFree,
} from "@/features/convergence/convergencePayoff";
import { gameReducer } from "@/features/game/gameActions";
import type { GameState } from "@/features/game/gameTypes";

const basePlayer = initialGameState.player;

function convergedPlayer(): Partial<GameState["player"]> {
  return {
    factionAlignment: "bio",
    mythicAscension: {
      ...initialGameState.player.mythicAscension,
      convergencePrimed: true,
      convergenceRevealed: true,
    },
  };
}

describe("convergence payoff selectors", () => {
  it("isConverged returns true when convergenceRevealed is set", () => {
    expect(isConverged({ ...basePlayer, ...convergedPlayer() })).toBe(true);
  });

  it("isConverged returns false for default player", () => {
    expect(isConverged(basePlayer)).toBe(false);
  });

  it("getConvergenceRewardMultiplier returns +5% for converged", () => {
    expect(
      getConvergenceRewardMultiplier({ ...basePlayer, ...convergedPlayer() }),
    ).toBe(1 + CONVERGENCE_REWARD_BONUS_PCT / 100);
  });

  it("getConvergenceRewardMultiplier returns 1 for non-converged", () => {
    expect(getConvergenceRewardMultiplier(basePlayer)).toBe(1);
  });

  it("isConvergenceHybridDrainFree returns true for converged", () => {
    expect(
      isConvergenceHybridDrainFree({ ...basePlayer, ...convergedPlayer() }),
    ).toBe(true);
  });

  it("isConvergenceHybridDrainFree returns false for non-converged", () => {
    expect(isConvergenceHybridDrainFree(basePlayer)).toBe(false);
  });
});

describe("convergence reveal mana max boost (integration)", () => {
  it("TRIGGER_CONVERGENCE_REVEAL bumps manaMax by the convergence bonus", () => {
    const fullyConverged: Partial<GameState["player"]> = {
      factionAlignment: "bio",
      mana: 30,
      manaMax: 40,
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
    const state: GameState = {
      ...initialGameState,
      player: { ...initialGameState.player, ...fullyConverged },
    };
    const next = gameReducer(state, {
      type: "TRIGGER_CONVERGENCE_REVEAL",
      payload: { nowMs: 1_000_000 },
    });
    expect(next.player.mythicAscension.convergenceRevealed).toBe(true);
    expect(next.player.manaMax).toBe(40 + CONVERGENCE_MANA_MAX_BONUS);
    // Mana preserved (was below new cap).
    expect(next.player.mana).toBe(30);
  });
});

describe("convergence payoff constants", () => {
  it("mana max bonus is in a moderate range", () => {
    expect(CONVERGENCE_MANA_MAX_BONUS).toBeGreaterThanOrEqual(10);
    expect(CONVERGENCE_MANA_MAX_BONUS).toBeLessThanOrEqual(30);
  });

  it("reward bonus pct is in the small nudge band", () => {
    expect(CONVERGENCE_REWARD_BONUS_PCT).toBeGreaterThanOrEqual(3);
    expect(CONVERGENCE_REWARD_BONUS_PCT).toBeLessThanOrEqual(10);
  });
});
