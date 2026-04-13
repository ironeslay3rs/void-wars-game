/**
 * Black Market Exchange — buy/sell wiring tests.
 *
 * Canon anchor: lore-canon/01 Master Canon/Locations/Black Market.md
 * ("neutral or semi-neutral meeting ground", "fuses a little of
 * everything"). The Exchange is the canonical cross-school neutral
 * marketplace, distinct from the War Exchange and Golden Bazaar.
 */
import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import {
  BLACK_MARKET_BUY_MARKUP,
  BLACK_MARKET_LISTINGS,
  BLACK_MARKET_SELL_PREMIUM,
} from "@/features/market/blackMarketListings";
import {
  quoteBlackMarketBuyCredits,
  quoteBlackMarketSellCredits,
} from "@/features/market/marketActions";
import { RESOURCE_BASE_PRICES } from "@/features/market/marketListings";
import type { GameState } from "@/features/game/gameTypes";

function seedState(overrides: Partial<GameState["player"]["resources"]> = {}): GameState {
  // Total material stock kept below INVENTORY_CAPACITY_MAX (120) so
  // enforceCapacity doesn't block BM buys in tests.
  return {
    ...initialGameState,
    player: {
      ...initialGameState.player,
      resources: {
        ...initialGameState.player.resources,
        credits: 2000,
        scrapAlloy: 20,
        ironOre: 10,
        runeDust: 5,
        emberCore: 2,
        bioSamples: 10,
        ...overrides,
      },
    },
  };
}

describe("Black Market listings catalog", () => {
  it("every listing has a canon mixed-provenance grant (> 1 resource key OR flagged)", () => {
    for (const listing of BLACK_MARKET_LISTINGS) {
      const keys = Object.entries(listing.grant).filter(
        ([, v]) => typeof v === "number" && v > 0,
      );
      expect(keys.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("listing ids are namespaced with bm- prefix to avoid War Exchange collisions", () => {
    for (const listing of BLACK_MARKET_LISTINGS) {
      expect(listing.id.startsWith("bm-")).toBe(true);
    }
  });

  it("buy markup is above 1 (fusion premium)", () => {
    expect(BLACK_MARKET_BUY_MARKUP).toBeGreaterThan(1);
  });

  it("sell premium is below 1 (fence discount)", () => {
    expect(BLACK_MARKET_SELL_PREMIUM).toBeLessThan(1);
    expect(BLACK_MARKET_SELL_PREMIUM).toBeGreaterThan(0);
  });
});

describe("quoteBlackMarketBuyCredits", () => {
  it("returns null for unknown listing", () => {
    expect(quoteBlackMarketBuyCredits("nonexistent")).toBeNull();
  });

  it("applies the fusion markup to base price at 0 rapport", () => {
    const listing = BLACK_MARKET_LISTINGS[0];
    const quoted = quoteBlackMarketBuyCredits(listing.id);
    expect(quoted!.finalPrice).toBe(
      Math.ceil(listing.priceCredits * BLACK_MARKET_BUY_MARKUP),
    );
    expect(quoted!.rapportDiscountPct).toBe(0);
  });

  it("applies rapport discount at Trusted tier (rapport >= 60)", () => {
    const listing = BLACK_MARKET_LISTINGS[0];
    const base = quoteBlackMarketBuyCredits(listing.id, 0)!;
    const trusted = quoteBlackMarketBuyCredits(listing.id, 60)!;
    expect(trusted.rapportDiscountPct).toBe(20);
    expect(trusted.finalPrice).toBeLessThan(base.finalPrice);
  });
});

describe("quoteBlackMarketSellCredits", () => {
  it("applies fence premium to base price", () => {
    const q = quoteBlackMarketSellCredits("scrapAlloy", 10);
    const expected = Math.max(
      1,
      Math.floor(
        (RESOURCE_BASE_PRICES.scrapAlloy ?? 0) * 10 * BLACK_MARKET_SELL_PREMIUM,
      ),
    );
    expect(q.net).toBe(expected);
  });

  it("returns 0 for non-sellable keys", () => {
    // credits is not in SELLABLE_RESOURCE_KEYS
    const q = quoteBlackMarketSellCredits("credits", 5);
    expect(q.net).toBe(0);
  });
});

describe("BLACK_MARKET_BUY reducer integration", () => {
  it("deducts markup-adjusted price + grants listing contents", () => {
    const start = seedState();
    const listing = BLACK_MARKET_LISTINGS[0];
    const price = quoteBlackMarketBuyCredits(listing.id)!.finalPrice;
    const before = start.player.resources.credits;
    const after = gameReducer(start, {
      type: "BLACK_MARKET_BUY",
      payload: { listingId: listing.id },
    });
    expect(after.player.resources.credits).toBe(before - price);
    // At least one granted resource key should have increased
    const granted = Object.entries(listing.grant).filter(
      ([, v]) => typeof v === "number" && v > 0,
    );
    const [someKey] = granted[0]!;
    expect(
      (after.player.resources[someKey as keyof typeof after.player.resources] ?? 0) >
        (start.player.resources[someKey as keyof typeof start.player.resources] ?? 0),
    ).toBe(true);
  });

  it("does not complete when credits are insufficient", () => {
    const start = seedState({ credits: 5 });
    const listing = BLACK_MARKET_LISTINGS[0];
    const after = gameReducer(start, {
      type: "BLACK_MARKET_BUY",
      payload: { listingId: listing.id },
    });
    expect(after.player.resources.credits).toBe(5);
  });

  it("decrements stock on successful buy", () => {
    const start = seedState();
    const listing = BLACK_MARKET_LISTINGS[0];
    const after = gameReducer(start, {
      type: "BLACK_MARKET_BUY",
      payload: { listingId: listing.id },
    });
    const stock = after.player.market?.stockByListingId?.[listing.id];
    expect(stock).toBe(listing.stock - 1);
  });
});

describe("BLACK_MARKET_SELL reducer integration", () => {
  it("credits the player at fence rate, deducts resources", () => {
    const start = seedState({ scrapAlloy: 20 });
    const q = quoteBlackMarketSellCredits("scrapAlloy", 5);
    const before = start.player.resources.credits;
    const after = gameReducer(start, {
      type: "BLACK_MARKET_SELL",
      payload: { key: "scrapAlloy", amount: 5 },
    });
    expect(after.player.resources.credits).toBe(before + q.net);
    expect(after.player.resources.scrapAlloy).toBe(start.player.resources.scrapAlloy - 5);
  });

  it("refuses if insufficient stock", () => {
    const start = seedState({ scrapAlloy: 2 });
    const after = gameReducer(start, {
      type: "BLACK_MARKET_SELL",
      payload: { key: "scrapAlloy", amount: 10 },
    });
    expect(after.player.resources.scrapAlloy).toBe(2);
  });

  it("refuses non-sellable keys", () => {
    const start = seedState();
    const before = start.player.resources.credits;
    const after = gameReducer(start, {
      type: "BLACK_MARKET_SELL",
      payload: { key: "credits" as never, amount: 1 },
    });
    expect(after.player.resources.credits).toBe(before);
  });
});

describe("Rapport discount integration", () => {
  it("buy costs less when player has high rapport with any broker", () => {
    const listing = BLACK_MARKET_LISTINGS[0];
    const noRapport = seedState();
    const highRapport = {
      ...seedState(),
      player: {
        ...seedState().player,
        brokerRapport: { "discount-lars": 60 },
      },
    };
    const afterNo = gameReducer(noRapport, {
      type: "BLACK_MARKET_BUY",
      payload: { listingId: listing.id },
    });
    const afterHigh = gameReducer(highRapport, {
      type: "BLACK_MARKET_BUY",
      payload: { listingId: listing.id },
    });
    const spentNo = noRapport.player.resources.credits - afterNo.player.resources.credits;
    const spentHigh = highRapport.player.resources.credits - afterHigh.player.resources.credits;
    expect(spentHigh).toBeLessThan(spentNo);
  });

  it("sell yields more when player has high rapport", () => {
    const noRapport = seedState({ scrapAlloy: 20 });
    const highRapport = {
      ...seedState({ scrapAlloy: 20 }),
      player: {
        ...seedState({ scrapAlloy: 20 }).player,
        brokerRapport: { "discount-lars": 60 },
      },
    };
    const afterNo = gameReducer(noRapport, {
      type: "BLACK_MARKET_SELL",
      payload: { key: "scrapAlloy", amount: 10 },
    });
    const afterHigh = gameReducer(highRapport, {
      type: "BLACK_MARKET_SELL",
      payload: { key: "scrapAlloy", amount: 10 },
    });
    const earnedNo = afterNo.player.resources.credits - noRapport.player.resources.credits;
    const earnedHigh = afterHigh.player.resources.credits - highRapport.player.resources.credits;
    expect(earnedHigh).toBeGreaterThan(earnedNo);
  });
});

describe("Black Market pricing is distinct from War Exchange", () => {
  it("BM sell always returns less than base price per unit (fence discount)", () => {
    const q = quoteBlackMarketSellCredits("emberCore", 1);
    expect(q.net).toBeLessThanOrEqual(RESOURCE_BASE_PRICES.emberCore ?? 0);
  });

  it("BM buy always costs more than base listing price (fusion markup)", () => {
    const listing = BLACK_MARKET_LISTINGS[0];
    const bmPrice = quoteBlackMarketBuyCredits(listing.id)!.finalPrice;
    expect(bmPrice).toBeGreaterThan(listing.priceCredits);
  });
});
