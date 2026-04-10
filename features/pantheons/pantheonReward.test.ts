import { describe, expect, it } from "vitest";

import { initialGameState } from "@/features/game/initialGameState";
import {
  PANTHEON_BLESSING_REWARD_BONUS_PCT,
  PANTHEON_MATCH_REWARD_BONUS_PCT,
  getPantheonBlessingRewardMultiplier,
  getPantheonMatchRewardMultiplier,
  getPlayerAlignedPantheonId,
  isMissionPantheonMatch,
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

describe("getPantheonMatchRewardMultiplier", () => {
  it("returns the +5% bonus when origin tag school matches the player's affinity", () => {
    // bonehowl-remnant resolves to Bonehowl of Fenrir.
    expect(
      getPantheonMatchRewardMultiplier(
        { ...basePlayer, affinitySchoolId: "bonehowl-of-fenrir" },
        "bonehowl-remnant",
      ),
    ).toBe(1 + PANTHEON_MATCH_REWARD_BONUS_PCT / 100);
  });

  it("returns 1 when origin tag resolves to a different school", () => {
    expect(
      getPantheonMatchRewardMultiplier(
        { ...basePlayer, affinitySchoolId: "bonehowl-of-fenrir" },
        "olympus-castoff",
      ),
    ).toBe(1);
  });

  it("returns 1 when origin tag is undefined", () => {
    expect(
      getPantheonMatchRewardMultiplier(
        { ...basePlayer, affinitySchoolId: "bonehowl-of-fenrir" },
        undefined,
      ),
    ).toBe(1);
  });

  it("returns 1 when player has no affinity school", () => {
    expect(
      getPantheonMatchRewardMultiplier(
        { ...basePlayer, affinitySchoolId: null },
        "bonehowl-remnant",
      ),
    ).toBe(1);
  });

  it("returns 1 when origin tag is the unmapped local one", () => {
    expect(
      getPantheonMatchRewardMultiplier(
        { ...basePlayer, affinitySchoolId: "bonehowl-of-fenrir" },
        "black-market-local",
      ),
    ).toBe(1);
  });

  it("match bonus is smaller than visit-blessing bonus (always-on vs one-shot)", () => {
    expect(PANTHEON_MATCH_REWARD_BONUS_PCT).toBeLessThan(
      PANTHEON_BLESSING_REWARD_BONUS_PCT,
    );
  });
});

describe("isMissionPantheonMatch", () => {
  it("returns true when the multiplier is > 1", () => {
    expect(
      isMissionPantheonMatch(
        { ...basePlayer, affinitySchoolId: "mouth-of-inti" },
        "mouth-of-inti-relic",
      ),
    ).toBe(true);
  });

  it("returns false when the multiplier is 1", () => {
    expect(
      isMissionPantheonMatch(
        { ...basePlayer, affinitySchoolId: "mouth-of-inti" },
        "olympus-castoff",
      ),
    ).toBe(false);
  });
});
