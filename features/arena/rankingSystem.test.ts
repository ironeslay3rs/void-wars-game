import { describe, expect, it } from "vitest";

import {
  BASE_RATING,
  DEFAULT_K_FACTOR,
  PLACEMENT_GAMES,
  PLACEMENT_K_FACTOR,
  RATING_FLOOR,
  VETERAN_K_FACTOR,
  VETERAN_RATING_THRESHOLD,
  applyMatchResult,
  applySeasonReset,
  createFreshRankEntry,
  defaultSeasonPolicy,
  expectedScore,
  getRankTier,
  pickKFactor,
  type RankEntry,
} from "@/features/arena/rankingSystem";

function placedEntry(overrides: Partial<RankEntry> = {}): RankEntry {
  return {
    rating: BASE_RATING,
    games: PLACEMENT_GAMES, // out of placements
    wins: 0,
    losses: 0,
    winStreak: 0,
    tier: "bronze",
    seasonId: "S1",
    ...overrides,
  };
}

describe("expectedScore", () => {
  it("returns 0.5 for equal ratings", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5, 10);
  });

  it("is symmetric — a vs b + b vs a sum to 1", () => {
    for (const [a, b] of [
      [1000, 1400],
      [1800, 900],
      [2100, 2400],
      [1, 5000],
    ]) {
      const ab = expectedScore(a!, b!);
      const ba = expectedScore(b!, a!);
      expect(ab + ba).toBeCloseTo(1, 10);
    }
  });

  it("gives the higher-rated player a score > 0.5", () => {
    expect(expectedScore(1600, 1400)).toBeGreaterThan(0.5);
    expect(expectedScore(1400, 1600)).toBeLessThan(0.5);
  });

  it("gives ~0.76 when rated 200 above opponent (Elo sanity)", () => {
    expect(expectedScore(1600, 1400)).toBeCloseTo(0.76, 1);
  });
});

describe("getRankTier", () => {
  it("returns unranked for non-positive rating", () => {
    expect(getRankTier(0)).toBe("unranked");
    expect(getRankTier(-10)).toBe("unranked");
  });

  it("hits exact tier boundaries inclusively", () => {
    expect(getRankTier(RATING_FLOOR)).toBe("iron");
    expect(getRankTier(999)).toBe("iron");
    expect(getRankTier(1000)).toBe("bronze");
    expect(getRankTier(1250)).toBe("silver");
    expect(getRankTier(1499)).toBe("silver");
    expect(getRankTier(1500)).toBe("gold");
    expect(getRankTier(1800)).toBe("platinum");
    expect(getRankTier(2100)).toBe("diamond");
    expect(getRankTier(2400)).toBe("void");
    expect(getRankTier(9999)).toBe("void");
  });
});

describe("pickKFactor", () => {
  it("uses placement K while games < PLACEMENT_GAMES", () => {
    expect(pickKFactor(placedEntry({ games: 0 }))).toBe(PLACEMENT_K_FACTOR);
    expect(pickKFactor(placedEntry({ games: PLACEMENT_GAMES - 1 }))).toBe(
      PLACEMENT_K_FACTOR,
    );
  });

  it("uses default K for settled mid-tier players", () => {
    expect(pickKFactor(placedEntry({ rating: 1500 }))).toBe(DEFAULT_K_FACTOR);
  });

  it("uses veteran K once rating crosses threshold", () => {
    expect(
      pickKFactor(placedEntry({ rating: VETERAN_RATING_THRESHOLD })),
    ).toBe(VETERAN_K_FACTOR);
  });
});

describe("applyMatchResult — Elo adjustments", () => {
  it("a win against an equal-rated opponent gains roughly K/2", () => {
    const entry = placedEntry({ rating: 1500 });
    const res = applyMatchResult(entry, {
      playerScore: 1,
      opponentRating: 1500,
    });
    expect(res.delta).toBe(Math.round(DEFAULT_K_FACTOR * 0.5));
    expect(res.next.wins).toBe(1);
    expect(res.next.losses).toBe(0);
    expect(res.next.winStreak).toBe(1);
    expect(res.next.games).toBe(entry.games + 1);
  });

  it("a loss against an equal-rated opponent loses roughly K/2", () => {
    const entry = placedEntry({ rating: 1500 });
    const res = applyMatchResult(entry, {
      playerScore: 0,
      opponentRating: 1500,
    });
    expect(res.delta).toBe(-Math.round(DEFAULT_K_FACTOR * 0.5));
    expect(res.next.losses).toBe(1);
    expect(res.next.wins).toBe(0);
    expect(res.next.winStreak).toBe(0);
  });

  it("a draw between equals nets ~0 delta", () => {
    const entry = placedEntry({ rating: 1500 });
    const res = applyMatchResult(entry, {
      playerScore: 0.5,
      opponentRating: 1500,
    });
    expect(res.delta).toBe(0);
    expect(res.next.wins).toBe(0);
    expect(res.next.losses).toBe(0);
    expect(res.next.winStreak).toBe(0);
  });

  it("an underdog win yields a bigger delta than an expected win", () => {
    const base = placedEntry({ rating: 1200 });
    const underdog = applyMatchResult(base, {
      playerScore: 1,
      opponentRating: 1800,
    });
    const expected = applyMatchResult(base, {
      playerScore: 1,
      opponentRating: 900,
    });
    expect(underdog.delta).toBeGreaterThan(expected.delta);
  });

  it("never drops the rating below the floor", () => {
    const entry = placedEntry({ rating: RATING_FLOOR });
    for (let i = 0; i < 20; i += 1) {
      const res = applyMatchResult(entry, {
        playerScore: 0,
        opponentRating: 3000,
      });
      expect(res.next.rating).toBeGreaterThanOrEqual(RATING_FLOOR);
    }
  });

  it("wins extend the streak, losses reset it", () => {
    let entry = placedEntry({ rating: 1400, winStreak: 2 });
    entry = applyMatchResult(entry, {
      playerScore: 1,
      opponentRating: 1400,
    }).next;
    expect(entry.winStreak).toBe(3);
    entry = applyMatchResult(entry, {
      playerScore: 0,
      opponentRating: 1400,
    }).next;
    expect(entry.winStreak).toBe(0);
  });

  it("preserves seasonId across updates", () => {
    const entry = placedEntry({ seasonId: "S7" });
    const res = applyMatchResult(entry, {
      playerScore: 1,
      opponentRating: 1000,
    });
    expect(res.next.seasonId).toBe("S7");
  });

  it("does not mutate the input entry", () => {
    const entry = placedEntry({ rating: 1500 });
    const snapshot = JSON.stringify(entry);
    applyMatchResult(entry, { playerScore: 1, opponentRating: 1400 });
    expect(JSON.stringify(entry)).toBe(snapshot);
  });

  it("recomputes the tier on the next entry", () => {
    const entry = placedEntry({ rating: 1499 });
    const res = applyMatchResult(entry, {
      playerScore: 1,
      opponentRating: 2500,
    });
    // Big jump against a high opponent should cross into gold (1500+).
    expect(["gold", "silver"]).toContain(res.next.tier);
  });
});

describe("applySeasonReset", () => {
  it("pulls halfway to the floor by default", () => {
    const entry = placedEntry({ rating: 2000, wins: 30, losses: 5, winStreak: 4 });
    const policy = defaultSeasonPolicy("S2");
    const next = applySeasonReset(entry, policy);
    // floor 1000, distance 1000, pull 0.5 -> newRating 1500
    expect(next.rating).toBe(1500);
    expect(next.games).toBe(0);
    expect(next.wins).toBe(0);
    expect(next.losses).toBe(0);
    expect(next.winStreak).toBe(0);
    expect(next.seasonId).toBe("S2");
  });

  it("respects custom softPullFraction", () => {
    const entry = placedEntry({ rating: 2000 });
    const next = applySeasonReset(entry, {
      softPullFraction: 1,
      floor: 1000,
      nextSeasonId: "hard",
    });
    expect(next.rating).toBe(1000);
  });

  it("never drops below the rating floor", () => {
    const entry = placedEntry({ rating: 150 });
    const next = applySeasonReset(entry, {
      softPullFraction: 1,
      floor: 50,
      nextSeasonId: "S2",
    });
    expect(next.rating).toBeGreaterThanOrEqual(RATING_FLOOR);
  });

  it("stamps the new seasonId", () => {
    const entry = placedEntry({ seasonId: "S1" });
    const next = applySeasonReset(entry, defaultSeasonPolicy("SNext"));
    expect(next.seasonId).toBe("SNext");
  });

  it("re-derives tier from the pulled rating", () => {
    const entry = placedEntry({ rating: 2400, tier: "void" });
    const next = applySeasonReset(entry, defaultSeasonPolicy("S2"));
    // 2400 -> pulled halfway to 1000 -> 1700 -> gold
    expect(next.tier).toBe("gold");
  });
});

describe("createFreshRankEntry + defaultSeasonPolicy", () => {
  it("creates a placement-ready entry at BASE_RATING", () => {
    const entry = createFreshRankEntry("S1");
    expect(entry.rating).toBe(BASE_RATING);
    expect(entry.games).toBe(0);
    expect(entry.wins).toBe(0);
    expect(entry.losses).toBe(0);
    expect(entry.winStreak).toBe(0);
    expect(entry.seasonId).toBe("S1");
    expect(entry.tier).toBe(getRankTier(BASE_RATING));
  });

  it("default policy targets the base rating floor with 50% pull", () => {
    const p = defaultSeasonPolicy("S2");
    expect(p.floor).toBe(BASE_RATING);
    expect(p.softPullFraction).toBeCloseTo(0.5, 10);
    expect(p.nextSeasonId).toBe("S2");
  });
});
