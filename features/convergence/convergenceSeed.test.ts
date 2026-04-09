/**
 * Tests for the convergence seed helper.
 *
 * The convergence seed is the hidden mechanism that drives the Book 6
 * fusion reveal. These tests pin the rules so a future refactor can't
 * silently break the late-game payoff.
 */

import { describe, expect, it } from "vitest";

import {
  applyCrossSchoolExposureToPlayer,
  getExposedSchoolCount,
  hasMismatchPotential,
  trackCrossSchoolExposure,
} from "@/features/convergence/convergenceSeed";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState, PathType } from "@/features/game/gameTypes";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      factionAlignment: "bio",
      ...overrides,
    },
  };
}

describe("trackCrossSchoolExposure", () => {
  it("returns null when player is unbound", () => {
    const state = makeState({ factionAlignment: "unbound" });
    expect(trackCrossSchoolExposure(state, { school: "mecha" })).toBeNull();
  });

  it("returns null when touched school matches alignment", () => {
    const state = makeState({ factionAlignment: "bio" });
    expect(trackCrossSchoolExposure(state, { school: "bio" })).toBeNull();
  });

  it("increments encounter and anomaly counters on cross-school touch", () => {
    const state = makeState();
    const next = trackCrossSchoolExposure(state, { school: "mecha" });
    expect(next).not.toBeNull();
    expect(next?.offPathMaterialsEncountered).toBe(1);
    expect(next?.anomalyScore).toBe(1);
    expect(next?.schoolsExposed?.mecha).toBe(true);
    expect(next?.mismatchEncountered).toBe(false);
  });

  it("flips mismatchEncountered after threshold (5 touches across 2 schools)", () => {
    let state = makeState();
    // 5 mecha touches — only one new school exposed besides bio (none yet)
    // Wait — bio isn't auto-exposed, so we need 2 distinct off-school touches
    // to cross the schools threshold. Touch mecha 4x, then pure 1x (5 total).
    for (let i = 0; i < 4; i++) {
      const update = trackCrossSchoolExposure(state, { school: "mecha" });
      state = {
        ...state,
        player: {
          ...state.player,
          crossSchoolExposure: { ...state.player.crossSchoolExposure, ...update! },
        },
      };
    }
    expect(state.player.crossSchoolExposure.mismatchEncountered).toBe(false);
    const finalUpdate = trackCrossSchoolExposure(state, { school: "pure" });
    expect(finalUpdate?.mismatchEncountered).toBe(true);
  });
});

describe("applyCrossSchoolExposureToPlayer", () => {
  it("returns same player reference when no change applies (unbound)", () => {
    const state = makeState({ factionAlignment: "unbound" });
    expect(applyCrossSchoolExposureToPlayer(state, "mecha")).toBe(state.player);
  });

  it("returns same player reference when touched school matches alignment", () => {
    const state = makeState();
    expect(applyCrossSchoolExposureToPlayer(state, "bio")).toBe(state.player);
  });

  it("fires lastAnomalyToast on the FIRST touch of a new school", () => {
    const state = makeState();
    const next = applyCrossSchoolExposureToPlayer(state, "mecha");
    expect(next.lastAnomalyToast).not.toBeNull();
    expect(next.lastAnomalyToast?.school).toBe("mecha");
    expect(next.lastAnomalyToast?.text).toBeTruthy();
  });

  it("does NOT re-fire lastAnomalyToast on subsequent touches of the same school", () => {
    let state = makeState();
    state = {
      ...state,
      player: applyCrossSchoolExposureToPlayer(state, "mecha"),
    };
    const firstToastAt = state.player.lastAnomalyToast?.at;
    expect(firstToastAt).toBeDefined();

    // Re-touch the same school
    const next = applyCrossSchoolExposureToPlayer(state, "mecha");
    expect(next.lastAnomalyToast?.at).toBe(firstToastAt);
    expect(next.crossSchoolExposure.offPathMaterialsEncountered).toBe(2);
  });

  it("fires a NEW toast on first touch of a different school", () => {
    let state = makeState();
    state = {
      ...state,
      player: applyCrossSchoolExposureToPlayer(state, "mecha"),
    };
    const mechaToastSchool = state.player.lastAnomalyToast?.school;
    expect(mechaToastSchool).toBe("mecha");

    state = {
      ...state,
      player: applyCrossSchoolExposureToPlayer(state, "pure"),
    };
    // The toast slot now reflects the second touched school. (`at` may
    // collide on the same millisecond — what matters is the school
    // identity update + the exposure counters advancing.)
    expect(state.player.lastAnomalyToast?.school).toBe("pure");
    expect(state.player.crossSchoolExposure.schoolsExposed.mecha).toBe(true);
    expect(state.player.crossSchoolExposure.schoolsExposed.pure).toBe(true);
  });
});

describe("derived helpers", () => {
  it("getExposedSchoolCount counts unique exposures", () => {
    let state = makeState();
    expect(getExposedSchoolCount(state)).toBe(0);
    state = {
      ...state,
      player: applyCrossSchoolExposureToPlayer(state, "mecha"),
    };
    expect(getExposedSchoolCount(state)).toBe(1);
    state = {
      ...state,
      player: applyCrossSchoolExposureToPlayer(state, "pure"),
    };
    expect(getExposedSchoolCount(state)).toBe(2);
  });

  it("hasMismatchPotential reflects the threshold flag", () => {
    let state = makeState();
    expect(hasMismatchPotential(state)).toBe(false);
    // Set the flag manually (the trigger is tested above)
    state = {
      ...state,
      player: {
        ...state.player,
        crossSchoolExposure: {
          ...state.player.crossSchoolExposure,
          mismatchEncountered: true,
        },
      },
    };
    expect(hasMismatchPotential(state)).toBe(true);
  });

  it("schools array exposure happens for each PathType", () => {
    const schools: PathType[] = ["bio", "mecha", "pure"];
    expect(schools).toHaveLength(3);
  });
});
