import { describe, expect, it } from "vitest";

import {
  ASTARTE_VEIL_TAX_BASE,
  ASTARTE_VEIL_TAX_BIO,
  ASTARTE_VEIL_TAX_OUTSIDER,
  BONEHOWL_BOUNTY_MULT_BASE,
  BONEHOWL_BOUNTY_MULT_BIO,
  BONEHOWL_BOUNTY_MULT_OUTSIDER,
  INTI_COURT_DISCOUNT_OUTSIDER,
  INTI_COURT_DISCOUNT_PURE,
  MANDATE_BUREAU_TAX_MULT_BASE,
  MANDATE_BUREAU_TAX_MULT_MECHA,
  MANDATE_BUREAU_TAX_THRESHOLD,
  OLYMPUS_CONCORD_BONUS_BIO,
  OLYMPUS_CONCORD_BONUS_OUTSIDER,
  PHAROS_CONCLAVE_REGISTRY_BASE,
  PHAROS_CONCLAVE_REGISTRY_MECHA,
  PHAROS_CONCLAVE_REGISTRY_OUTSIDER,
  getAstarteVeilTaxMultiplier,
  getBonehowlBountyMultiplierForFaction,
  getBonehowlBountyRewardMultiplier,
  getIntiCourtCostMultiplier,
  getMandateBureauTaxMultiplier,
  getOlympusConcordConditionMultiplier,
  getPharosConclaveRegistryFee,
  getVishravaLedgerBuyMultiplier,
  getVishravaLedgerBuyMultiplierForFaction,
  getVishravaLedgerPressureCopy,
  getVishravaLedgerSellMultiplier,
  getVishravaLedgerSellMultiplierForFaction,
  isBonehowlOriginTag,
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

describe("Bonehowl Syndicate bounty (wrath origin)", () => {
  it("recognizes the canonical Bonehowl origin tag", () => {
    expect(isBonehowlOriginTag("bonehowl-remnant")).toBe(true);
    expect(isBonehowlOriginTag("olympus-castoff")).toBe(false);
    expect(isBonehowlOriginTag(undefined)).toBe(false);
  });

  it("Bio operatives pay the heaviest bounty bonus on Bonehowl missions", () => {
    expect(getBonehowlBountyMultiplierForFaction("bio")).toBe(
      BONEHOWL_BOUNTY_MULT_BIO,
    );
    expect(getBonehowlBountyMultiplierForFaction("unbound")).toBe(
      BONEHOWL_BOUNTY_MULT_BASE,
    );
    expect(getBonehowlBountyMultiplierForFaction("mecha")).toBe(
      BONEHOWL_BOUNTY_MULT_OUTSIDER,
    );
    expect(getBonehowlBountyMultiplierForFaction("pure")).toBe(
      BONEHOWL_BOUNTY_MULT_OUTSIDER,
    );
  });

  it("returns 1 when origin tag is non-Bonehowl", () => {
    expect(
      getBonehowlBountyRewardMultiplier(
        { factionAlignment: "bio" },
        "olympus-castoff",
      ),
    ).toBe(1);
  });

  it("returns the faction-tiered mult when origin is bonehowl-remnant", () => {
    expect(
      getBonehowlBountyRewardMultiplier(
        { factionAlignment: "bio" },
        "bonehowl-remnant",
      ),
    ).toBe(BONEHOWL_BOUNTY_MULT_BIO);
    expect(
      getBonehowlBountyRewardMultiplier(
        { factionAlignment: "mecha" },
        "bonehowl-remnant",
      ),
    ).toBe(BONEHOWL_BOUNTY_MULT_OUTSIDER);
  });

  it("hierarchy: bio > base > outsider", () => {
    expect(BONEHOWL_BOUNTY_MULT_BIO).toBeGreaterThan(BONEHOWL_BOUNTY_MULT_BASE);
    expect(BONEHOWL_BOUNTY_MULT_BASE).toBeGreaterThan(
      BONEHOWL_BOUNTY_MULT_OUTSIDER,
    );
  });
});

describe("Mandate Bureau patience tax", () => {
  it("returns 1 when voidInstability is below the threshold", () => {
    expect(
      getMandateBureauTaxMultiplier({
        factionAlignment: "bio",
        voidInstability: MANDATE_BUREAU_TAX_THRESHOLD - 1,
      }),
    ).toBe(1);
  });

  it("applies the base malus when over the threshold and not Mecha", () => {
    expect(
      getMandateBureauTaxMultiplier({
        factionAlignment: "bio",
        voidInstability: MANDATE_BUREAU_TAX_THRESHOLD + 5,
      }),
    ).toBe(MANDATE_BUREAU_TAX_MULT_BASE);
  });

  it("applies a softer malus to Mecha-aligned operatives", () => {
    expect(
      getMandateBureauTaxMultiplier({
        factionAlignment: "mecha",
        voidInstability: MANDATE_BUREAU_TAX_THRESHOLD + 5,
      }),
    ).toBe(MANDATE_BUREAU_TAX_MULT_MECHA);
  });

  it("Mecha tax is closer to 1 than the base tax (softer)", () => {
    expect(MANDATE_BUREAU_TAX_MULT_MECHA).toBeGreaterThan(
      MANDATE_BUREAU_TAX_MULT_BASE,
    );
  });

  it("both tax multipliers are below 1 (this is a malus, not a bonus)", () => {
    expect(MANDATE_BUREAU_TAX_MULT_BASE).toBeLessThan(1);
    expect(MANDATE_BUREAU_TAX_MULT_MECHA).toBeLessThan(1);
  });
});

describe("Inti Court tribute discount", () => {
  it("Pure operatives pay less for Feast Hall offers", () => {
    expect(getIntiCourtCostMultiplier("pure")).toBe(INTI_COURT_DISCOUNT_PURE);
    expect(INTI_COURT_DISCOUNT_PURE).toBeLessThan(1);
  });

  it("everyone else pays the listed price", () => {
    for (const faction of ["unbound", "bio", "mecha"] as const) {
      expect(getIntiCourtCostMultiplier(faction)).toBe(
        INTI_COURT_DISCOUNT_OUTSIDER,
      );
    }
    expect(INTI_COURT_DISCOUNT_OUTSIDER).toBe(1);
  });
});

describe("Olympus Concord intel premium", () => {
  it("Bio operatives get the condition gain bonus on Mirror House deals", () => {
    expect(getOlympusConcordConditionMultiplier("bio")).toBe(
      OLYMPUS_CONCORD_BONUS_BIO,
    );
    expect(OLYMPUS_CONCORD_BONUS_BIO).toBeGreaterThan(1);
  });

  it("non-Bio operatives see the listed gain", () => {
    for (const faction of ["unbound", "mecha", "pure"] as const) {
      expect(getOlympusConcordConditionMultiplier(faction)).toBe(
        OLYMPUS_CONCORD_BONUS_OUTSIDER,
      );
    }
    expect(OLYMPUS_CONCORD_BONUS_OUTSIDER).toBe(1);
  });
});

describe("Astarte Veil cleansing tax", () => {
  it("Bio operatives pay the smallest premium", () => {
    expect(getAstarteVeilTaxMultiplier("bio")).toBe(ASTARTE_VEIL_TAX_BIO);
  });

  it("unbound pays the heaviest premium", () => {
    expect(getAstarteVeilTaxMultiplier("unbound")).toBe(ASTARTE_VEIL_TAX_BASE);
  });

  it("mecha and pure share the outsider premium", () => {
    expect(getAstarteVeilTaxMultiplier("mecha")).toBe(
      ASTARTE_VEIL_TAX_OUTSIDER,
    );
    expect(getAstarteVeilTaxMultiplier("pure")).toBe(ASTARTE_VEIL_TAX_OUTSIDER);
  });

  it("hierarchy: base > outsider > bio (all > 1)", () => {
    expect(ASTARTE_VEIL_TAX_BASE).toBeGreaterThan(ASTARTE_VEIL_TAX_OUTSIDER);
    expect(ASTARTE_VEIL_TAX_OUTSIDER).toBeGreaterThan(ASTARTE_VEIL_TAX_BIO);
    expect(ASTARTE_VEIL_TAX_BIO).toBeGreaterThan(1);
  });
});

describe("Pharos Conclave registry surcharge", () => {
  it("Mecha operatives pay the cheapest registry fee", () => {
    expect(getPharosConclaveRegistryFee("mecha")).toBe(
      PHAROS_CONCLAVE_REGISTRY_MECHA,
    );
  });

  it("unbound pays the highest registry fee", () => {
    expect(getPharosConclaveRegistryFee("unbound")).toBe(
      PHAROS_CONCLAVE_REGISTRY_BASE,
    );
  });

  it("bio and pure share the outsider registry fee", () => {
    expect(getPharosConclaveRegistryFee("bio")).toBe(
      PHAROS_CONCLAVE_REGISTRY_OUTSIDER,
    );
    expect(getPharosConclaveRegistryFee("pure")).toBe(
      PHAROS_CONCLAVE_REGISTRY_OUTSIDER,
    );
  });

  it("registry fees are flat credit values, ordered base > outsider > mecha", () => {
    expect(PHAROS_CONCLAVE_REGISTRY_BASE).toBeGreaterThan(
      PHAROS_CONCLAVE_REGISTRY_OUTSIDER,
    );
    expect(PHAROS_CONCLAVE_REGISTRY_OUTSIDER).toBeGreaterThan(
      PHAROS_CONCLAVE_REGISTRY_MECHA,
    );
    expect(PHAROS_CONCLAVE_REGISTRY_MECHA).toBeGreaterThan(0);
  });
});
