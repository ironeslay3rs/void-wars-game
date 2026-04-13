"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import {
  BLACK_MARKET_LISTINGS,
  BLACK_MARKET_BUY_MARKUP,
  BLACK_MARKET_SELL_PREMIUM,
} from "@/features/market/blackMarketListings";
import { quoteBlackMarketBuyCredits, quoteBlackMarketSellCredits } from "@/features/market/marketActions";
import { SELLABLE_RESOURCE_KEYS } from "@/features/market/marketListings";
import type { ResourceKey } from "@/features/game/gameTypes";

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

function clampUnits(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(999, Math.max(1, Math.floor(n)));
}

export default function BlackMarketExchangeScreen() {
  const { state, dispatch } = useGame();
  const res = state.player.resources;
  const stockMap = state.player.market?.stockByListingId ?? {};

  const [sellKey, setSellKey] = useState<ResourceKey>("scrapAlloy");
  const [sellAmount, setSellAmount] = useState(1);
  const sellUnits = clampUnits(sellAmount);
  const sellQuote = useMemo(
    () => quoteBlackMarketSellCredits(sellKey, sellUnits),
    [sellKey, sellUnits],
  );
  const canSell = (res[sellKey] ?? 0) >= sellUnits;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,40,90,0.18),rgba(3,7,18,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <ScreenHeader
          backHref="/bazaar/black-market"
          backLabel="Back to Black Market"
          eyebrow="Black Market / Exchange"
          title="The Exchange Floor"
          subtitle="Neutral mixed-provenance trade. Bio / Mecha / Pure lots meet here. Quality is not guaranteed; the prices reflect it."
        />

        <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/20 px-4 py-3">
          <p className="text-xs italic leading-relaxed text-fuchsia-100/75">
            &ldquo;The Black Market survives by fusing a little bit of
            everything. It is not pure Bio, pure Mecha, or pure Pure. That
            mixed identity is part of why it endures.&rdquo;
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/50">
            Black Market.md · lore-canon
          </p>
        </div>

        <SectionCard
          title="Buy fusion lots"
          description={`Mixed-provenance bundles from every school. Black Market charges a +${Math.round(
            (BLACK_MARKET_BUY_MARKUP - 1) * 100,
          )}% fusion markup over base listing price.`}
        >
          <div className="space-y-3">
            {BLACK_MARKET_LISTINGS.map((listing) => {
              const stock = stockMap[listing.id] ?? listing.stock;
              const priceCredits = quoteBlackMarketBuyCredits(listing.id) ?? 0;
              const canAfford = res.credits >= priceCredits;
              const inStock = stock > 0;
              const disabled = !canAfford || !inStock;
              const grantLine = Object.entries(listing.grant)
                .filter(([, v]) => typeof v === "number" && v > 0)
                .map(([k, v]) => `${v}× ${resourceLabel(k as ResourceKey)}`)
                .join(" · ");
              return (
                <div
                  key={listing.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">
                          {listing.name}
                        </p>
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
                        <div className="text-sm font-bold text-white tabular-nums">
                          {priceCredits}
                        </div>
                        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
                          Sinful Coin
                        </div>
                      </div>
                      <div className="text-[10px] text-white/40">
                        Stock: {stock} / {listing.stock}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "BLACK_MARKET_BUY",
                            payload: { listingId: listing.id },
                          })
                        }
                        disabled={disabled}
                        className={[
                          "rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                          disabled
                            ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                            : "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25",
                        ].join(" ")}
                      >
                        {!inStock
                          ? "Out of stock"
                          : !canAfford
                            ? "Need Sinful Coin"
                            : "Buy"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Sell to the fence"
          description={`Flat ${Math.round(
            BLACK_MARKET_SELL_PREMIUM * 100,
          )}% of base value. No war-front demand. No tithe. No broker cut — but no kickbacks either.`}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Resource
                </span>
                <select
                  value={sellKey}
                  onChange={(e) => setSellKey(e.target.value as ResourceKey)}
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/85"
                >
                  {SELLABLE_RESOURCE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {resourceLabel(k)} (you have {res[k] ?? 0})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Units
                </span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={sellAmount}
                  onChange={(e) => setSellAmount(parseInt(e.target.value, 10) || 1)}
                  className="w-24 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/85 tabular-nums"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Quote
                </span>
                <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white tabular-nums">
                  {sellQuote.net} Coin
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "BLACK_MARKET_SELL",
                    payload: { key: sellKey, amount: sellUnits },
                  })
                }
                disabled={!canSell}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] transition",
                  canSell
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/30",
                ].join(" ")}
              >
                Sell
              </button>
            </div>
            <p className="text-xs text-white/55">
              The fence moves stock sideways. For better rates on{" "}
              <Link
                href="/bazaar/war-exchange"
                className="text-amber-200 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
              >
                faction-aligned sells
              </Link>
              , the War Exchange still applies demand multipliers.
            </p>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
