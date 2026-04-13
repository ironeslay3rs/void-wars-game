import { describe, expect, it } from "vitest";

import {
  GUILD_PERKS,
  GUILD_RANKS,
  getPerk,
  getRank,
  nextRank,
  rankExtraContractSlots,
  rankForContribution,
  rankRewardMultiplier,
} from "@/features/guild/guildRanks";

describe("GUILD_RANKS", () => {
  it("has exactly 5 tiers in ascending threshold order", () => {
    expect(GUILD_RANKS).toHaveLength(5);
    for (let i = 1; i < GUILD_RANKS.length; i++) {
      expect(GUILD_RANKS[i].threshold).toBeGreaterThan(GUILD_RANKS[i - 1].threshold);
    }
  });

  it("uses canon rank names verbatim and exact thresholds", () => {
    const byKey = Object.fromEntries(GUILD_RANKS.map((r) => [r.key, r]));
    expect(byKey.probationary.label).toBe("Probationary");
    expect(byKey.probationary.threshold).toBe(0);
    expect(byKey.bonded.label).toBe("Bonded Contractor");
    expect(byKey.bonded.threshold).toBe(240);
    expect(byKey.vanguard.label).toBe("Vanguard Broker");
    expect(byKey.vanguard.threshold).toBe(900);
    expect(byKey.warden.label).toBe("Lane Warden");
    expect(byKey.warden.threshold).toBe(2400);
    expect(byKey.blackcrown.label).toBe("Blackcrown");
    expect(byKey.blackcrown.threshold).toBe(6000);
  });

  it("uses 'Pure' canon — no 'Spirit' anywhere in rank labels/flavors", () => {
    for (const r of GUILD_RANKS) {
      expect(r.label.toLowerCase()).not.toContain("spirit");
      expect(r.flavor.toLowerCase()).not.toContain("spirit");
    }
  });
});

describe("rankForContribution", () => {
  it("returns probationary below 240", () => {
    expect(rankForContribution(0).key).toBe("probationary");
    expect(rankForContribution(239).key).toBe("probationary");
  });

  it("hits each threshold exactly on boundary", () => {
    expect(rankForContribution(240).key).toBe("bonded");
    expect(rankForContribution(900).key).toBe("vanguard");
    expect(rankForContribution(2400).key).toBe("warden");
    expect(rankForContribution(6000).key).toBe("blackcrown");
  });

  it("stays at blackcrown above its threshold", () => {
    expect(rankForContribution(9_999_999).key).toBe("blackcrown");
  });

  it("treats threshold - 1 as prior tier", () => {
    expect(rankForContribution(899).key).toBe("bonded");
    expect(rankForContribution(2399).key).toBe("vanguard");
    expect(rankForContribution(5999).key).toBe("warden");
  });
});

describe("rankRewardMultiplier", () => {
  it("defaults to 1 for probationary (no perks)", () => {
    expect(rankRewardMultiplier(getRank("probationary"))).toBe(1);
  });

  it("returns the highest reward multiplier among the rank's perks", () => {
    expect(rankRewardMultiplier(getRank("bonded"))).toBeCloseTo(1.05, 5);
    expect(rankRewardMultiplier(getRank("vanguard"))).toBeCloseTo(1.1, 5);
    expect(rankRewardMultiplier(getRank("warden"))).toBeCloseTo(1.1, 5);
    expect(rankRewardMultiplier(getRank("blackcrown"))).toBeCloseTo(1.15, 5);
  });
});

describe("rankExtraContractSlots", () => {
  it("is 0 for probationary and bonded", () => {
    expect(rankExtraContractSlots(getRank("probationary"))).toBe(0);
    expect(rankExtraContractSlots(getRank("bonded"))).toBe(0);
  });

  it("grows at vanguard (1), warden (1), blackcrown (2)", () => {
    expect(rankExtraContractSlots(getRank("vanguard"))).toBe(1);
    expect(rankExtraContractSlots(getRank("warden"))).toBe(1);
    expect(rankExtraContractSlots(getRank("blackcrown"))).toBe(2);
  });
});

describe("nextRank", () => {
  it("advances sequentially through the ladder", () => {
    expect(nextRank("probationary")?.key).toBe("bonded");
    expect(nextRank("bonded")?.key).toBe("vanguard");
    expect(nextRank("vanguard")?.key).toBe("warden");
    expect(nextRank("warden")?.key).toBe("blackcrown");
  });

  it("returns null at the top of the ladder", () => {
    expect(nextRank("blackcrown")).toBeNull();
  });
});

describe("getRank / getPerk", () => {
  it("getRank returns the matching rank", () => {
    expect(getRank("vanguard").label).toBe("Vanguard Broker");
  });

  it("getPerk returns registered perk records", () => {
    expect(getPerk("reward_bonus_5").rewardMultiplier).toBe(1.05);
    expect(getPerk("extra_contract_slot").extraContractSlots).toBe(1);
    expect(getPerk("rapport_preserve").rewardMultiplier).toBeUndefined();
  });

  it("GUILD_PERKS covers every perk key referenced by any rank", () => {
    for (const rank of GUILD_RANKS) {
      for (const perkKey of rank.perks) {
        expect(GUILD_PERKS[perkKey]).toBeDefined();
      }
    }
  });
});
