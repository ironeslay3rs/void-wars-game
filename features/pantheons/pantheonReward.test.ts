import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import {
  PANTHEON_BLESSING_REWARD_BONUS_PCT,
  getPantheonBlessingRewardMultiplier,
  getPlayerAlignedPantheonId,
  isPlayerAlignedPantheon,
} from "@/features/pantheons/pantheonReward";

const basePlayer = initialGameState.player;

describe("getPlayerAlignedPantheonId", () => {
  it("returns null when player has no affinity school", () => {
    expect(
      getPlayerAlignedPantheonId({ ...basePlayer, affinitySchoolId: null }),
    ).toBeNull();
  });

  it("resolves bonehowl-of-fenrir → norse", () => {
    expect(
      getPlayerAlignedPantheonId({
        ...basePlayer,
        affinitySchoolId: "bonehowl-of-fenrir",
      }),
    ).toBe("norse");
  });

  it("resolves mouth-of-inti → inca", () => {
    expect(
      getPlayerAlignedPantheonId({
        ...basePlayer,
        affinitySchoolId: "mouth-of-inti",
      }),
    ).toBe("inca");
  });

  it("returns null when affinitySchoolId is not a real school id", () => {
    expect(
      getPlayerAlignedPantheonId({
        ...basePlayer,
        affinitySchoolId: "made-up-school",
      }),
    ).toBeNull();
  });
});

describe("isPlayerAlignedPantheon", () => {
  it("matches when the pantheon corresponds to the player's affinity", () => {
    expect(
      isPlayerAlignedPantheon(
        { ...basePlayer, affinitySchoolId: "divine-pharos-of-ra" },
        "egyptian",
      ),
    ).toBe(true);
  });

  it("rejects when the player's affinity points elsewhere", () => {
    expect(
      isPlayerAlignedPantheon(
        { ...basePlayer, affinitySchoolId: "divine-pharos-of-ra" },
        "norse",
      ),
    ).toBe(false);
  });

  it("rejects when the player has no affinity", () => {
    expect(
      isPlayerAlignedPantheon(
        { ...basePlayer, affinitySchoolId: null },
        "norse",
      ),
    ).toBe(false);
  });
});

describe("getPantheonBlessingRewardMultiplier", () => {
  it("returns 1 when no blessing is pending", () => {
    expect(
      getPantheonBlessingRewardMultiplier({ pantheonBlessingPending: false }),
    ).toBe(1);
  });

  it("returns 1 + bonusPct/100 when a blessing is pending", () => {
    expect(
      getPantheonBlessingRewardMultiplier({ pantheonBlessingPending: true }),
    ).toBe(1 + PANTHEON_BLESSING_REWARD_BONUS_PCT / 100);
  });

  it("bonus pct is small enough to not dominate other reward math", () => {
    expect(PANTHEON_BLESSING_REWARD_BONUS_PCT).toBeGreaterThanOrEqual(5);
    expect(PANTHEON_BLESSING_REWARD_BONUS_PCT).toBeLessThanOrEqual(20);
  });
});
