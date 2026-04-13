"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import MarketConfirmModal from "@/components/shared/MarketConfirmModal";
import BlackMarketBuyCard from "@/components/black-market/BlackMarketBuyCard";
import { useGame } from "@/features/game/gameContext";
import {
  BLACK_MARKET_LISTINGS,
  BLACK_MARKET_BUY_MARKUP,
  BLACK_MARKET_SELL_PREMIUM,
} from "@/features/market/blackMarketListings";
import { quoteBlackMarketBuyCredits, quoteBlackMarketSellCredits } from "@/features/market/marketActions";
import { getBestBrokerRapport } from "@/features/market/blackMarketPricing";
import { getRapportDiscountPct } from "@/features/broker-dialogue/rapportDiscount";
import { SELLABLE_RESOURCE_KEYS } from "@/features/market/marketListings";
import { pushToast } from "@/features/toast/toastBus";
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

type PendingBuy = { kind: "buy"; listingId: string };
type PendingSell = { kind: "sell" };
type PendingAction = PendingBuy | PendingSell | null;

const RAPPORT_TIER_LABEL: Record<number, string> = {
  0: "Stranger", 5: "Acquainted", 10: "Familiar", 20: "Trusted",
};

export default function BlackMarketExchangeScreen() {
  const { state, dispatch } = useGame();
  const res = state.player.resources;
  const stockMap = state.player.market?.stockByListingId ?? {};
  const bestRapport = useMemo(
    () => getBestBrokerRapport(state.player.brokerRapport ?? {}),
    [state.player.brokerRapport],
  );
  const discountPct = getRapportDiscountPct(bestRapport);
  const tierLabel = RAPPORT_TIER_LABEL[discountPct] ?? "Stranger";

  const [sellKey, setSellKey] = useState<ResourceKey>("scrapAlloy");
  const [sellAmount, setSellAmount] = useState(1);
  const sellUnits = clampUnits(sellAmount);
  const sellQuote = useMemo(
    () => quoteBlackMarketSellCredits(sellKey, sellUnits, bestRapport),
    [sellKey, sellUnits, bestRapport],
  );
  const canSell = (res[sellKey] ?? 0) >= sellUnits;
  const [pending, setPending] = useState<PendingAction>(null);

  const handleBuyConfirm = useCallback(() => {
    if (!pending || pending.kind !== "buy") return;
    const listing = BLACK_MARKET_LISTINGS.find((l) => l.id === pending.listingId);
    const quote = quoteBlackMarketBuyCredits(pending.listingId, bestRapport);
    dispatch({ type: "BLACK_MARKET_BUY", payload: { listingId: pending.listingId } });
    if (listing && quote && res.credits >= quote.finalPrice) {
      pushToast(`Bought ${listing.name} for ${quote.finalPrice} Sinful Coin`, { variant: "success" });
    } else {
      pushToast("Purchase failed — check your balance", { variant: "warning" });
    }
    setPending(null);
  }, [pending, res.credits, dispatch, bestRapport]);

  const handleSellConfirm = useCallback(() => {
    if (!pending || pending.kind !== "sell" || !canSell) {
      pushToast("Not enough stock to sell", { variant: "warning" });
      setPending(null);
      return;
    }
    dispatch({ type: "BLACK_MARKET_SELL", payload: { key: sellKey, amount: sellUnits } });
    pushToast(`Sold ${sellUnits}\u00d7 ${resourceLabel(sellKey)} for ${sellQuote.net} Sinful Coin`, { variant: "success" });
    setPending(null);
  }, [pending, canSell, dispatch, sellKey, sellUnits, sellQuote.net]);

  const pendingBuyListing = pending?.kind === "buy"
    ? BLACK_MARKET_LISTINGS.find((l) => l.id === pending.listingId) : null;
  const pendingBuyQuote = pending?.kind === "buy"
    ? quoteBlackMarketBuyCredits(pending.listingId, bestRapport) : null;

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

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/20 px-4 py-3 flex-1">
            <p className="text-xs italic leading-relaxed text-fuchsia-100/75">
              &ldquo;The Black Market survives by fusing a little bit of everything.
              It is not pure Bio, pure Mecha, or pure Pure. That mixed identity is
              part of why it endures.&rdquo;
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/50">
              Black Market.md &middot; lore-canon
            </p>
          </div>
          {discountPct > 0 && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/60">Rapport Tier</div>
              <div className="mt-1 text-sm font-bold text-emerald-100">{tierLabel}</div>
              <div className="mt-0.5 text-[10px] text-emerald-200/70">&minus;{discountPct}% buy &middot; +{discountPct}% sell</div>
            </div>
          )}
        </div>

        <SectionCard
          title="Buy fusion lots"
          description={`+${Math.round((BLACK_MARKET_BUY_MARKUP - 1) * 100)}% fusion markup.${discountPct > 0 ? ` ${tierLabel} standing saves ${discountPct}%.` : ""}`}
        >
          <div className="space-y-3">
            {BLACK_MARKET_LISTINGS.map((listing) => {
              const stock = stockMap[listing.id] ?? listing.stock;
              const quote = quoteBlackMarketBuyCredits(listing.id, bestRapport);
              return (
                <BlackMarketBuyCard
                  key={listing.id}
                  listing={listing}
                  stock={stock}
                  priceCredits={quote?.finalPrice ?? 0}
                  markupPrice={quote?.markupPrice ?? 0}
                  rapportDiscountPct={quote?.rapportDiscountPct ?? 0}
                  canAfford={res.credits >= (quote?.finalPrice ?? 0)}
                  onBuy={() => setPending({ kind: "buy", listingId: listing.id })}
                />
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Sell to the fence"
          description={`${Math.round(BLACK_MARKET_SELL_PREMIUM * 100)}% of base.${discountPct > 0 ? ` +${discountPct}% rapport bonus.` : ""} No war-front demand. No tithe.`}
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">Resource</span>
                <select
                  value={sellKey}
                  onChange={(e) => setSellKey(e.target.value as ResourceKey)}
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/85"
                >
                  {SELLABLE_RESOURCE_KEYS.map((k) => (
                    <option key={k} value={k}>{resourceLabel(k)} (you have {res[k] ?? 0})</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">Units</span>
                <input
                  type="number" min={1} max={999} value={sellAmount}
                  onChange={(e) => setSellAmount(parseInt(e.target.value, 10) || 1)}
                  className="w-24 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/85 tabular-nums"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">Quote</span>
                <span className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white tabular-nums">
                  {sellQuote.net} Coin
                  {sellQuote.rapportBonusPct > 0 && (
                    <span className="ml-1.5 text-[9px] text-emerald-300/70">+{sellQuote.rapportBonusPct}%</span>
                  )}
                </span>
              </div>
              <button
                type="button" onClick={() => setPending({ kind: "sell" })} disabled={!canSell}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] transition",
                  canSell ? "border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-white/30",
                ].join(" ")}
              >Sell</button>
            </div>
            <p className="text-xs text-white/55">
              The fence moves stock sideways. For better rates on{" "}
              <Link href="/bazaar/war-exchange" className="text-amber-200 underline decoration-amber-400/40 underline-offset-2 hover:text-white">
                faction-aligned sells
              </Link>, the War Exchange still applies demand multipliers.
            </p>
          </div>
        </SectionCard>
      </div>

      {pending?.kind === "buy" && pendingBuyListing && pendingBuyQuote && (
        <MarketConfirmModal
          title={`Buy ${pendingBuyListing.name}?`}
          description={pendingBuyListing.description}
          priceLabel="Black Market Exchange"
          price={pendingBuyQuote.finalPrice}
          originalPrice={pendingBuyQuote.rapportDiscountPct > 0 ? pendingBuyQuote.markupPrice : undefined}
          discountPct={pendingBuyQuote.rapportDiscountPct > 0 ? pendingBuyQuote.rapportDiscountPct : undefined}
          confirmLabel="Buy"
          onConfirm={handleBuyConfirm}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "sell" && (
        <MarketConfirmModal
          title={`Sell ${sellUnits}\u00d7 ${resourceLabel(sellKey)}?`}
          description={`The fence offers ${sellQuote.net} Sinful Coin for your ${resourceLabel(sellKey)}.`}
          priceLabel="Black Market Fence"
          price={sellQuote.net}
          confirmLabel="Sell"
          onConfirm={handleSellConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </main>
  );
}
