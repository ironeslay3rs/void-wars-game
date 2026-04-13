import { describe, expect, it } from "vitest";
import {
  getDiscountedCost,
  getRapportDiscountPct,
  RAPPORT_DISCOUNT_ACQUAINTED_PCT,
  RAPPORT_DISCOUNT_FAMILIAR_PCT,
  RAPPORT_DISCOUNT_STRANGER_PCT,
  RAPPORT_DISCOUNT_TRUSTED_PCT,
} from "@/features/broker-dialogue/rapportDiscount";

describe("getRapportDiscountPct — tier mapping", () => {
  it.each([
    [0, RAPPORT_DISCOUNT_STRANGER_PCT],
    [9, RAPPORT_DISCOUNT_STRANGER_PCT],
    [10, RAPPORT_DISCOUNT_ACQUAINTED_PCT],
    [29, RAPPORT_DISCOUNT_ACQUAINTED_PCT],
    [30, RAPPORT_DISCOUNT_FAMILIAR_PCT],
    [59, RAPPORT_DISCOUNT_FAMILIAR_PCT],
    [60, RAPPORT_DISCOUNT_TRUSTED_PCT],
    [100, RAPPORT_DISCOUNT_TRUSTED_PCT],
  ])("rapport %d → %d%% discount", (rapport, expected) => {
    expect(getRapportDiscountPct(rapport)).toBe(expected);
  });

  it("tier bands ascend monotonically", () => {
    expect(RAPPORT_DISCOUNT_STRANGER_PCT).toBeLessThan(
      RAPPORT_DISCOUNT_ACQUAINTED_PCT,
    );
    expect(RAPPORT_DISCOUNT_ACQUAINTED_PCT).toBeLessThan(
      RAPPORT_DISCOUNT_FAMILIAR_PCT,
    );
    expect(RAPPORT_DISCOUNT_FAMILIAR_PCT).toBeLessThan(
      RAPPORT_DISCOUNT_TRUSTED_PCT,
    );
  });
});

describe("getDiscountedCost", () => {
  it("returns 0 when base cost is 0", () => {
    expect(getDiscountedCost(0, 100)).toBe(0);
  });

  it("returns base cost unchanged for Stranger rapport", () => {
    expect(getDiscountedCost(50, 0)).toBe(50);
    expect(getDiscountedCost(50, 9)).toBe(50);
  });

  it("applies 5% discount at Acquainted", () => {
    expect(getDiscountedCost(100, 10)).toBe(95);
    expect(getDiscountedCost(40, 20)).toBe(38);
  });

  it("applies 10% discount at Familiar", () => {
    expect(getDiscountedCost(100, 30)).toBe(90);
    expect(getDiscountedCost(70, 45)).toBe(63);
  });

  it("applies 20% discount at Trusted", () => {
    expect(getDiscountedCost(100, 60)).toBe(80);
    expect(getDiscountedCost(50, 100)).toBe(40);
  });

  it("floors at 1 Sinful Coin — every transaction has friction", () => {
    expect(getDiscountedCost(1, 100)).toBe(1);
    expect(getDiscountedCost(2, 100)).toBeGreaterThanOrEqual(1);
  });

  it("monotone — discount never increases cost as rapport rises", () => {
    const cost = 100;
    const stranger = getDiscountedCost(cost, 0);
    const acquainted = getDiscountedCost(cost, 15);
    const familiar = getDiscountedCost(cost, 35);
    const trusted = getDiscountedCost(cost, 70);
    expect(acquainted).toBeLessThanOrEqual(stranger);
    expect(familiar).toBeLessThanOrEqual(acquainted);
    expect(trusted).toBeLessThanOrEqual(familiar);
  });
});
