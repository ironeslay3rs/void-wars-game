import type { GameState, ResourceKey } from "@/features/game/gameTypes";
import { enforceCapacity, checkCapacity } from "@/features/resources/inventoryLogic";
import {
  MARKET_LISTINGS,
  RESOURCE_BASE_PRICES,
  SELLABLE_RESOURCE_KEYS,
  type MarketListing,
} from "@/features/market/marketData";

export type MarketState = {
  stockByListingId: Record<string, number>;
};

export function createInitialMarketState(): MarketState {
  const stockByListingId: Record<string, number> = {};
  for (const listing of MARKET_LISTINGS) {
    stockByListingId[listing.id] = listing.stock;
  }
  return { stockByListingId };
}

export function getListingById(listingId: string): MarketListing | null {
  return MARKET_LISTINGS.find((l) => l.id === listingId) ?? null;
}

export function canSellResource(key: ResourceKey) {
  return SELLABLE_RESOURCE_KEYS.includes(key);
}

export function quoteSellPriceCredits(key: ResourceKey, amount: number) {
  const base = RESOURCE_BASE_PRICES[key] ?? 0;
  const n = Math.max(0, Math.floor(amount));
  const gross = base * n;
  const net = Math.floor(gross * 0.9); // 10% cut
  return { base, gross, net };
}

export function applyMarketBuy(state: GameState, listingId: string) {
  const listing = getListingById(listingId);
  if (!listing) return { next: state, ok: false, reason: "Listing missing." };

  const stock = (state.player.market?.stockByListingId?.[listingId] ??
    listing.stock) as number;
  if (stock <= 0) {
    return { next: state, ok: false, reason: "Out of stock." };
  }

  if (state.player.resources.credits < listing.priceCredits) {
    return { next: state, ok: false, reason: "Insufficient credits." };
  }

  // Capacity enforcement for material grants.
  const { accepted, blocked } = enforceCapacity(state.player.resources, listing.grant);
  const acceptedKeys = Object.keys(accepted);
  if (acceptedKeys.length === 0) {
    const cap = checkCapacity(state.player.resources);
    return {
      next: state,
      ok: false,
      reason: cap.isOverloaded
        ? "Storage overloaded. Sell or discard surplus."
        : "No storage space for this purchase.",
    };
  }

  const nextResources = { ...state.player.resources };
  nextResources.credits = Math.max(0, nextResources.credits - listing.priceCredits);
  for (const [k, v] of Object.entries(accepted)) {
    const key = k as ResourceKey;
    const amount = typeof v === "number" ? v : 0;
    nextResources[key] = Math.max(0, (nextResources[key] ?? 0) + amount);
  }

  const nextStockById = {
    ...(state.player.market?.stockByListingId ?? {}),
    [listingId]: Math.max(0, stock - 1),
  };

  return {
    next: {
      ...state,
      player: {
        ...state.player,
        resources: nextResources,
        market: { stockByListingId: nextStockById },
      },
    },
    ok: true,
    reason: blocked ? "Partial storage accepted. Some units were blocked by capacity." : null,
  };
}

export function applyMarketSell(state: GameState, key: ResourceKey, amount: number) {
  if (!canSellResource(key)) {
    return { next: state, ok: false, reason: "Not sellable here." };
  }
  const n = Math.max(0, Math.floor(amount));
  if (n <= 0) return { next: state, ok: false, reason: "Invalid amount." };
  if ((state.player.resources[key] ?? 0) < n) {
    return { next: state, ok: false, reason: "Insufficient stock." };
  }

  const quote = quoteSellPriceCredits(key, n);
  if (quote.net <= 0) {
    return { next: state, ok: false, reason: "No value." };
  }

  return {
    next: {
      ...state,
      player: {
        ...state.player,
        resources: {
          ...state.player.resources,
          [key]: Math.max(0, state.player.resources[key] - n),
          credits: state.player.resources.credits + quote.net,
        },
      },
    },
    ok: true,
    reason: null,
  };
}

