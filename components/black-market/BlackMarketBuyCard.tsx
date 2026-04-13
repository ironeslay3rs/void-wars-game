"use client";

import type { ResourceKey } from "@/features/game/gameTypes";
import type { MarketListing } from "@/features/market/marketListings";

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  ironOre: "Iron Ore",
  scrapAlloy: "Scrap Alloy",
  runeDust: "Rune Dust",
  emberCore: "Ember Core",
  bioSamples: "Bio Samples",
  mossRations: "Moss Rations",
};

function resourceLabel(key: ResourceKey): string {
  return RESOURCE_LABEL[key] ?? key;
}

type Props = {
  listing: MarketListing;
  stock: number;
  priceCredits: number;
  markupPrice: number;
  rapportDiscountPct: number;
  canAfford: boolean;
  onBuy: () => void;
};

export default function BlackMarketBuyCard({
  listing,
  stock,
  priceCredits,
  markupPrice,
  rapportDiscountPct,
  canAfford,
  onBuy,
}: Props) {
  const inStock = stock > 0;
  const disabled = !canAfford || !inStock;
  const grantLine = Object.entries(listing.grant)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .map(([k, v]) => `${v}\u00d7 ${resourceLabel(k as ResourceKey)}`)
    .join(" \u00b7 ");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{listing.name}</p>
            <span className="rounded border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55">
              {listing.rarity}
            </span>
          </div>
          <p className="mt-1 text-xs italic leading-snug text-white/55">
            {listing.description}
          </p>
          <p className="mt-2 text-[11px] text-fuchsia-200/85">
            Grants: {grantLine}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            {rapportDiscountPct > 0 ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/40 line-through tabular-nums">
                    {markupPrice}
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {priceCredits}
                  </span>
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300/70">
                  &minus;{rapportDiscountPct}% rapport
                </div>
              </>
            ) : (
              <div className="text-sm font-bold text-white tabular-nums">
                {priceCredits}
              </div>
            )}
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Sinful Coin
            </div>
          </div>
          <div className="text-[10px] text-white/40">
            Stock: {stock} / {listing.stock}
          </div>
          <button
            type="button"
            onClick={onBuy}
            disabled={disabled}
            className={[
              "rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
              disabled
                ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                : "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25",
            ].join(" ")}
          >
            {!inStock ? "Out of stock" : !canAfford ? "Need Sinful Coin" : "Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}
