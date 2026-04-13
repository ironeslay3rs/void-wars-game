import { describe, expect, it } from "vitest";

import {
  DAILY_TIER_THRESHOLDS,
  gradeDailyHunt,
  type DailyPerformance,
  type DailyReward,
  type DailyRewardTier,
} from "@/features/daily/rewardTiers";
import type { DailyHunt } from "@/features/daily/huntRotation";
import type { BossWindow } from "@/features/daily/bossSchedule";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

function makeHunt(
  overrides: Partial<DailyHunt> = {},
  theme: VoidZoneLootTheme = "ash_mecha",
): DailyHunt {
  return {
    dateKey: "2026-04-13",
    zoneId: "ash-relay",
    zoneLabel: "Ash Relay",
    lootTheme: theme,
    featuredMobs: [],
    clearQuota: 10,
    difficulty: "standard",
    rewardMultiplier: 1,
    ...overrides,
  };
}

function makePerf(overrides: Partial<DailyPerformance> = {}): DailyPerformance {
  return {
    mobsCleared: 0,
    bossDefeated: false,
    elapsedSeconds: 600,
    parSeconds: 600,
    scheduledWindow: null,
    ...overrides,
  };
}

function apexWindow(): BossWindow {
  return {
    zoneId: "rift-maw",
    zoneLabel: "Rift Maw",
    startMinuteUtc: 360,
    endMinuteUtc: 405,
    durationMinutes: 45,
    tier: "apex",
  };
}

function standardWindow(): BossWindow {
  return {
    zoneId: "rift-maw",
    zoneLabel: "Rift Maw",
    startMinuteUtc: 720,
    endMinuteUtc: 750,
    durationMinutes: 30,
    tier: "standard",
  };
}

describe("DAILY_TIER_THRESHOLDS canon", () => {
  it("lists S, A, B, C from strictest to loosest", () => {
    expect(DAILY_TIER_THRESHOLDS.map((t) => t.tier)).toEqual([
      "S",
      "A",
      "B",
      "C",
    ]);
  });

  it("uses the documented minScore breakpoints", () => {
    const byTier = Object.fromEntries(
      DAILY_TIER_THRESHOLDS.map((t) => [t.tier, t.minScore]),
    ) as Record<DailyRewardTier, number>;
    expect(byTier.S).toBe(90);
    expect(byTier.A).toBe(75);
    expect(byTier.B).toBe(55);
    expect(byTier.C).toBe(0);
  });
});

describe("gradeDailyHunt — tier boundaries", () => {
  // Weights: clears 55, boss 25, pace 20. Pace 1.0 when elapsed ≤ par.

  it("grades a perfect run at tier S (score 100)", () => {
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      elapsedSeconds: 400,
      parSeconds: 600,
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(100);
    expect(reward.tier).toBe("S");
  });

  it("exact score 90 lands on S (inclusive)", () => {
    // clears=1*55=55, boss=25, pace needs to hit 10 -> ratio 0.5.
    // paceRatio = (2*par - elapsed)/par = 0.5 -> elapsed = 1.5*par
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      parSeconds: 600,
      elapsedSeconds: 900,
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(90);
    expect(reward.tier).toBe("S");
  });

  it("score 89 falls to A (one below S boundary)", () => {
    // clears 1*55=55, boss 25, pace 0.45*20=9 -> 89
    // paceRatio 0.45 -> elapsed = (2 - 0.45)*par = 1.55*par = 930
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      parSeconds: 600,
      elapsedSeconds: 930,
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(89);
    expect(reward.tier).toBe("A");
  });

  it("exact score 75 lands on A (inclusive)", () => {
    // clears 1*55=55, boss 0, pace 1.0*20=20 -> 75
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: false,
      parSeconds: 600,
      elapsedSeconds: 600,
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(75);
    expect(reward.tier).toBe("A");
  });

  it("exact score 55 lands on B (inclusive)", () => {
    // clears 1*55=55, boss 0, pace 0 -> 55
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: false,
      parSeconds: 600,
      elapsedSeconds: 1200, // paceRatio -> 0
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(55);
    expect(reward.tier).toBe("B");
  });

  it("score 54 falls to C (one below B boundary)", () => {
    // clears 0.8*55=44, boss 0, pace 0.5*20=10 -> 54
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 8,
      bossDefeated: false,
      parSeconds: 600,
      elapsedSeconds: 900,
    });
    const reward = gradeDailyHunt(hunt, perf);
    expect(reward.score).toBe(54);
    expect(reward.tier).toBe("C");
  });

  it("zero-performance run is tier C with score 0", () => {
    const reward = gradeDailyHunt(
      makeHunt({ clearQuota: 10 }),
      makePerf({ mobsCleared: 0, bossDefeated: false, elapsedSeconds: 10_000 }),
    );
    expect(reward.score).toBe(0);
    expect(reward.tier).toBe("C");
  });
});

describe("gradeDailyHunt — payouts by loot theme", () => {
  function perfectPerf(): DailyPerformance {
    return makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      elapsedSeconds: 300,
      parSeconds: 600,
    });
  }

  it("ash_mecha bundle keys credits/scrapAlloy/emberCore", () => {
    const reward = gradeDailyHunt(makeHunt({}, "ash_mecha"), perfectPerf());
    expect(reward.payouts.credits).toBeGreaterThan(0);
    expect(reward.payouts.scrapAlloy).toBeGreaterThan(0);
    expect(reward.payouts.emberCore).toBeGreaterThan(0);
  });

  it("bio_rot bundle keys credits/bioSamples/runeDust", () => {
    const reward = gradeDailyHunt(makeHunt({}, "bio_rot"), perfectPerf());
    expect(reward.payouts.credits).toBeGreaterThan(0);
    expect(reward.payouts.bioSamples).toBeGreaterThan(0);
    expect(reward.payouts.runeDust).toBeGreaterThan(0);
  });

  it("void_pure bundle keys credits/runeDust/emberCore (Pure, never Spirit)", () => {
    const reward = gradeDailyHunt(makeHunt({}, "void_pure"), perfectPerf());
    expect(reward.payouts.credits).toBeGreaterThan(0);
    expect(reward.payouts.runeDust).toBeGreaterThan(0);
    expect(reward.payouts.emberCore).toBeGreaterThan(0);
  });
});

describe("gradeDailyHunt — multipliers", () => {
  it("S-tier multiplies base reward above B-tier (same hunt)", () => {
    const hunt = makeHunt({ clearQuota: 10 });
    const sReward = gradeDailyHunt(
      hunt,
      makePerf({ mobsCleared: 10, bossDefeated: true, elapsedSeconds: 300, parSeconds: 600 }),
    );
    const bReward = gradeDailyHunt(
      hunt,
      makePerf({ mobsCleared: 10, bossDefeated: false, elapsedSeconds: 1200, parSeconds: 600 }),
    );
    expect(sReward.rewardMultiplier).toBeGreaterThan(bReward.rewardMultiplier);
    expect(sReward.payouts.credits ?? 0).toBeGreaterThan(bReward.payouts.credits ?? 0);
  });

  it("hunt.rewardMultiplier flows through to final payout (elite > standard)", () => {
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      elapsedSeconds: 300,
      parSeconds: 600,
    });
    const std = gradeDailyHunt(makeHunt({ difficulty: "standard", rewardMultiplier: 1 }), perf);
    const elite = gradeDailyHunt(
      makeHunt({ difficulty: "elite", rewardMultiplier: 1.35 }),
      perf,
    );
    expect(elite.rewardMultiplier).toBeGreaterThan(std.rewardMultiplier);
  });

  it("scheduled apex window outpays a standard window on otherwise equal inputs", () => {
    const perf = (win: BossWindow | null): DailyPerformance =>
      makePerf({
        mobsCleared: 10,
        bossDefeated: true,
        elapsedSeconds: 300,
        parSeconds: 600,
        scheduledWindow: win,
      });
    const apex = gradeDailyHunt(makeHunt(), perf(apexWindow()));
    const std = gradeDailyHunt(makeHunt(), perf(standardWindow()));
    const none = gradeDailyHunt(makeHunt(), perf(null));
    expect(apex.rewardMultiplier).toBeGreaterThan(std.rewardMultiplier);
    expect(std.rewardMultiplier).toBeGreaterThan(none.rewardMultiplier);
  });
});

describe("gradeDailyHunt — purity", () => {
  it("does not mutate the hunt or performance arguments", () => {
    const hunt = makeHunt({ clearQuota: 10 });
    const perf = makePerf({
      mobsCleared: 10,
      bossDefeated: true,
      elapsedSeconds: 300,
      parSeconds: 600,
      scheduledWindow: apexWindow(),
    });
    const frozenHunt = JSON.parse(JSON.stringify(hunt)) as DailyHunt;
    const frozenPerf = JSON.parse(JSON.stringify(perf)) as DailyPerformance;
    const a: DailyReward = gradeDailyHunt(hunt, perf);
    const b: DailyReward = gradeDailyHunt(hunt, perf);
    expect(hunt).toEqual(frozenHunt);
    expect(perf).toEqual(frozenPerf);
    expect(a).toEqual(b);
  });

  it("clamps clearRatio at 1 when overshooting quota (no super-score)", () => {
    const hunt = makeHunt({ clearQuota: 5 });
    const capped = gradeDailyHunt(
      hunt,
      makePerf({ mobsCleared: 5, bossDefeated: true, elapsedSeconds: 300, parSeconds: 600 }),
    );
    const over = gradeDailyHunt(
      hunt,
      makePerf({ mobsCleared: 500, bossDefeated: true, elapsedSeconds: 300, parSeconds: 600 }),
    );
    expect(over.score).toBe(capped.score);
    expect(over.tier).toBe(capped.tier);
  });
});
