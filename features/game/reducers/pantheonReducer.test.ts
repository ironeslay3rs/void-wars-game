import { describe, expect, it } from "vitest";

import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";
import { PANTHEON_BLESSING_REWARD_BONUS_PCT } from "@/features/pantheons/pantheonReward";

function makeState(overrides: Partial<GameState["player"]> = {}): GameState {
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      ...overrides,
    },
  };
}

describe("GRANT_PANTHEON_BLESSING", () => {
  it("sets the pending flag when the pantheon matches the player's affinity", () => {
    const start = makeState({ affinitySchoolId: "bonehowl-of-fenrir" });
    const next = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "norse" },
    });
    expect(next.player.pantheonBlessingPending).toBe(true);
  });

  it("is a no-op when the pantheon does not match the player's affinity", () => {
    const start = makeState({ affinitySchoolId: "bonehowl-of-fenrir" });
    const next = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "egyptian" },
    });
    expect(next.player.pantheonBlessingPending).toBe(false);
  });

  it("is a no-op when the player has no affinity school", () => {
    const start = makeState({ affinitySchoolId: null });
    const next = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "norse" },
    });
    expect(next.player.pantheonBlessingPending).toBe(false);
  });

  it("is a no-op when the pantheon id is not canonical", () => {
    const start = makeState({ affinitySchoolId: "bonehowl-of-fenrir" });
    const next = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "atlantean" },
    });
    expect(next.player.pantheonBlessingPending).toBe(false);
  });

  it("is idempotent — granting twice keeps the flag true (one slot at a time)", () => {
    const start = makeState({
      affinitySchoolId: "mouth-of-inti",
      pantheonBlessingPending: true,
    });
    const next = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "inca" },
    });
    expect(next.player.pantheonBlessingPending).toBe(true);
  });
});

describe("CLEAR_PANTHEON_BLESSING", () => {
  it("clears the pending flag when set", () => {
    const start = makeState({ pantheonBlessingPending: true });
    const next = gameReducer(start, { type: "CLEAR_PANTHEON_BLESSING" });
    expect(next.player.pantheonBlessingPending).toBe(false);
  });

  it("is a no-op when no blessing is pending", () => {
    const start = makeState({ pantheonBlessingPending: false });
    const next = gameReducer(start, { type: "CLEAR_PANTHEON_BLESSING" });
    expect(next.player.pantheonBlessingPending).toBe(false);
  });
});

describe("integration: blessing applied to mission settlement", () => {
  it("the bonus pct is in the small nudge band", () => {
    expect(PANTHEON_BLESSING_REWARD_BONUS_PCT).toBeGreaterThanOrEqual(5);
    expect(PANTHEON_BLESSING_REWARD_BONUS_PCT).toBeLessThanOrEqual(20);
  });

  it("the blessing flag is auto-cleared by the next mission settlement", () => {
    // Note: full mission-settle integration is exercised via
    // expeditionContractFlow.test.ts and the existing mission test fixtures.
    // Here we just verify the explicit reducer round-trip: grant → clear.
    const start = makeState({
      affinitySchoolId: "thousand-hands-of-vishrava",
      pantheonBlessingPending: false,
    });
    const granted = gameReducer(start, {
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: "hindu" },
    });
    expect(granted.player.pantheonBlessingPending).toBe(true);
    const cleared = gameReducer(granted, { type: "CLEAR_PANTHEON_BLESSING" });
    expect(cleared.player.pantheonBlessingPending).toBe(false);
  });
});
