/**
 * Humanity Keepsake tests — canon-grounded passive reward from the
 * rapport loop.
 */
import { describe, expect, it } from "vitest";
import {
  countKeepsakes,
  detectHumanityKeepsakes,
  getKeepsakeRewardMultiplier,
  KEEPSAKE_MAX_COUNT,
  KEEPSAKE_RAPPORT_THRESHOLD,
  KEEPSAKE_REWARD_BONUS_PCT_PER,
} from "@/features/broker-dialogue/humanityKeepsake";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";

describe("detectHumanityKeepsakes — grant logic", () => {
  it("no grant below threshold", () => {
    const result = detectHumanityKeepsakes({
      rapport: { lars: KEEPSAKE_RAPPORT_THRESHOLD - 1 },
      keepsakes: {},
    });
    expect(result.changed).toBe(false);
    expect(result.newlyGranted).toEqual([]);
  });

  it("grants exactly at threshold", () => {
    const result = detectHumanityKeepsakes({
      rapport: { lars: KEEPSAKE_RAPPORT_THRESHOLD },
      keepsakes: {},
    });
    expect(result.changed).toBe(true);
    expect(result.newlyGranted).toEqual(["lars"]);
    expect(result.keepsakes.lars).toBe(true);
  });

  it("idempotent — re-detecting does not re-grant", () => {
    const first = detectHumanityKeepsakes({
      rapport: { lars: 85 },
      keepsakes: {},
    });
    const second = detectHumanityKeepsakes({
      rapport: { lars: 85 },
      keepsakes: first.keepsakes,
    });
    expect(second.changed).toBe(false);
    expect(second.newlyGranted).toEqual([]);
  });

  it("grants for multiple brokers in one pass", () => {
    const result = detectHumanityKeepsakes({
      rapport: { lars: 90, glass: 85, mama: 50, ashveil: 100 },
      keepsakes: {},
    });
    expect(result.newlyGranted.sort()).toEqual(["ashveil", "glass", "lars"]);
    expect(result.keepsakes.mama).toBeUndefined();
  });

  it("caps at KEEPSAKE_MAX_COUNT", () => {
    const rapport: Record<string, number> = {};
    for (let i = 0; i < KEEPSAKE_MAX_COUNT + 3; i++) {
      rapport[`b${i}`] = 90;
    }
    const result = detectHumanityKeepsakes({ rapport, keepsakes: {} });
    expect(result.newlyGranted.length).toBe(KEEPSAKE_MAX_COUNT);
  });

  it("refuses further grants when already at cap", () => {
    const keepsakes: Record<string, boolean> = {};
    for (let i = 0; i < KEEPSAKE_MAX_COUNT; i++) {
      keepsakes[`b${i}`] = true;
    }
    const result = detectHumanityKeepsakes({
      rapport: { newBroker: 90 },
      keepsakes,
    });
    expect(result.changed).toBe(false);
    expect(result.newlyGranted).toEqual([]);
  });
});

describe("getKeepsakeRewardMultiplier", () => {
  it("returns 1.0 with no keepsakes", () => {
    expect(getKeepsakeRewardMultiplier({})).toBe(1);
  });

  it("adds 1% per keepsake", () => {
    const mult = getKeepsakeRewardMultiplier({ a: true, b: true, c: true });
    expect(mult).toBeCloseTo(1 + (3 * KEEPSAKE_REWARD_BONUS_PCT_PER) / 100);
  });

  it("caps at KEEPSAKE_MAX_COUNT even if map has more", () => {
    const keepsakes: Record<string, boolean> = {};
    for (let i = 0; i < KEEPSAKE_MAX_COUNT + 5; i++) {
      keepsakes[`b${i}`] = true;
    }
    const mult = getKeepsakeRewardMultiplier(keepsakes);
    expect(mult).toBeCloseTo(
      1 + (KEEPSAKE_MAX_COUNT * KEEPSAKE_REWARD_BONUS_PCT_PER) / 100,
    );
  });
});

describe("countKeepsakes", () => {
  it("counts truthy entries only", () => {
    expect(countKeepsakes({ a: true, b: false, c: true })).toBe(2);
  });

  it("caps at max", () => {
    const keepsakes: Record<string, boolean> = {};
    for (let i = 0; i < KEEPSAKE_MAX_COUNT + 2; i++) {
      keepsakes[`b${i}`] = true;
    }
    expect(countKeepsakes(keepsakes)).toBe(KEEPSAKE_MAX_COUNT);
  });
});

describe("reducer integration — ADJUST_BROKER_RAPPORT grants Keepsake at 80", () => {
  it("does not grant below 80", () => {
    const after = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "lars", delta: 70 },
    });
    expect(after.player.brokerRapport.lars).toBe(70);
    expect(after.player.brokerKeepsakes.lars).toBeUndefined();
  });

  it("grants when rapport crosses to 80 in one step", () => {
    const after = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "lars", delta: 85 },
    });
    expect(after.player.brokerRapport.lars).toBe(85);
    expect(after.player.brokerKeepsakes.lars).toBe(true);
  });

  it("does not re-grant on subsequent rapport changes", () => {
    const trusted = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "lars", delta: 90 },
    });
    const bumped = gameReducer(trusted, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "lars", delta: 5 },
    });
    expect(bumped.player.brokerKeepsakes.lars).toBe(true);
    expect(Object.keys(bumped.player.brokerKeepsakes).length).toBe(1);
  });
});
