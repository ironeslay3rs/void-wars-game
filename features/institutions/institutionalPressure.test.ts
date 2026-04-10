import { describe, expect, it } from "vitest";

import {
  getVishravaLedgerBuyMultiplier,
  getVishravaLedgerBuyMultiplierForFaction,
  getVishravaLedgerPressureCopy,
  getVishravaLedgerSellMultiplier,
  getVishravaLedgerSellMultiplierForFaction,
  VISHRAVA_LEDGER_BUY_TITHE_BASE,
  VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER,
  VISHRAVA_LEDGER_BUY_TITHE_PURE,
  VISHRAVA_LEDGER_SELL_INTEREST_BASE,
  VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER,
  VISHRAVA_LEDGER_SELL_INTEREST_PURE,
} from "@/features/institutions/institutionalPressure";

describe("Vishrava Ledger buy/sell multipliers (per faction)", () => {
  it("Pure-aligned operatives pay the heaviest tithe and earn the highest interest", () => {
    expect(getVishravaLedgerBuyMultiplierForFaction("pure")).toBe(
      VISHRAVA_LEDGER_BUY_TITHE_PURE,
    );
    expect(getVishravaLedgerSellMultiplierForFaction("pure")).toBe(
      VISHRAVA_LEDGER_SELL_INTEREST_PURE,
    );
  });

  it("Unbound operatives sit at the baseline tithe + interest", () => {
    expect(getVishravaLedgerBuyMultiplierForFaction("unbound")).toBe(
      VISHRAVA_LEDGER_BUY_TITHE_BASE,
    );
    expect(getVishravaLedgerSellMultiplierForFaction("unbound")).toBe(
      VISHRAVA_LEDGER_SELL_INTEREST_BASE,
    );
  });

  it("Bio and Mecha (outsiders) get the softest tithe and the lowest interest", () => {
    expect(getVishravaLedgerBuyMultiplierForFaction("bio")).toBe(
      VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER,
    );
    expect(getVishravaLedgerBuyMultiplierForFaction("mecha")).toBe(
      VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER,
    );
    expect(getVishravaLedgerSellMultiplierForFaction("bio")).toBe(
      VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER,
    );
    expect(getVishravaLedgerSellMultiplierForFaction("mecha")).toBe(
      VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER,
    );
  });

  it("Pure tithe is heavier than baseline, which is heavier than outsider", () => {
    expect(VISHRAVA_LEDGER_BUY_TITHE_PURE).toBeGreaterThan(
      VISHRAVA_LEDGER_BUY_TITHE_BASE,
    );
    expect(VISHRAVA_LEDGER_BUY_TITHE_BASE).toBeGreaterThan(
      VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER,
    );
  });

  it("Pure interest is highest, baseline mid, outsider lowest (matches the canonical hierarchy)", () => {
    expect(VISHRAVA_LEDGER_SELL_INTEREST_PURE).toBeGreaterThan(
      VISHRAVA_LEDGER_SELL_INTEREST_BASE,
    );
    expect(VISHRAVA_LEDGER_SELL_INTEREST_BASE).toBeGreaterThan(
      VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER,
    );
  });

  it("All multipliers sit in the small (1-5%) nudge band so they don't dominate war-front math", () => {
    const all = [
      VISHRAVA_LEDGER_BUY_TITHE_BASE,
      VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER,
      VISHRAVA_LEDGER_BUY_TITHE_PURE,
      VISHRAVA_LEDGER_SELL_INTEREST_BASE,
      VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER,
      VISHRAVA_LEDGER_SELL_INTEREST_PURE,
    ];
    for (const mult of all) {
      expect(mult).toBeGreaterThanOrEqual(1.005);
      expect(mult).toBeLessThanOrEqual(1.06);
    }
  });
});

describe("Vishrava Ledger PlayerState wrapper selectors", () => {
  it("getVishravaLedgerBuyMultiplier delegates to the per-faction lookup", () => {
    expect(
      getVishravaLedgerBuyMultiplier({ factionAlignment: "pure" }),
    ).toBe(VISHRAVA_LEDGER_BUY_TITHE_PURE);
    expect(
      getVishravaLedgerBuyMultiplier({ factionAlignment: "bio" }),
    ).toBe(VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER);
  });

  it("getVishravaLedgerSellMultiplier delegates to the per-faction lookup", () => {
    expect(
      getVishravaLedgerSellMultiplier({ factionAlignment: "pure" }),
    ).toBe(VISHRAVA_LEDGER_SELL_INTEREST_PURE);
    expect(
      getVishravaLedgerSellMultiplier({ factionAlignment: "mecha" }),
    ).toBe(VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER);
  });
});

describe("Vishrava Ledger pressure copy", () => {
  it("returns Pure-aligned copy that mentions both tithe and interest", () => {
    const copy = getVishravaLedgerPressureCopy({ factionAlignment: "pure" });
    expect(copy.loadBearing).toBe(true);
    expect(copy.headline).toMatch(/Pure ledger seat/i);
    expect(copy.detail).toMatch(/abacus tithe/i);
    expect(copy.detail).toMatch(/patience interest/i);
    expect(copy.buyMult).toBe(VISHRAVA_LEDGER_BUY_TITHE_PURE);
    expect(copy.sellMult).toBe(VISHRAVA_LEDGER_SELL_INTEREST_PURE);
  });

  it("returns unbound baseline copy with neutral framing", () => {
    const copy = getVishravaLedgerPressureCopy({ factionAlignment: "unbound" });
    expect(copy.loadBearing).toBe(true);
    expect(copy.headline).toMatch(/neutral pass/i);
    expect(copy.buyMult).toBe(VISHRAVA_LEDGER_BUY_TITHE_BASE);
    expect(copy.sellMult).toBe(VISHRAVA_LEDGER_SELL_INTEREST_BASE);
  });

  it("returns outsider copy for Bio and Mecha alignment", () => {
    for (const faction of ["bio", "mecha"] as const) {
      const copy = getVishravaLedgerPressureCopy({ factionAlignment: faction });
      expect(copy.headline).toMatch(/outsider rate/i);
      expect(copy.buyMult).toBe(VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER);
      expect(copy.sellMult).toBe(VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER);
    }
  });

  it("every faction copy is load-bearing (the pressure is always on)", () => {
    for (const faction of ["unbound", "bio", "mecha", "pure"] as const) {
      const copy = getVishravaLedgerPressureCopy({ factionAlignment: faction });
      expect(copy.loadBearing).toBe(true);
    }
  });
});
