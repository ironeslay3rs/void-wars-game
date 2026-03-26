"use client";

import { useMemo, useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey } from "@/features/game/gameTypes";
import {
  MARKET_LISTINGS,
  RESOURCE_BASE_PRICES,
  SELLABLE_RESOURCE_KEYS,
} from "@/features/market/marketData";
import { checkCapacity, getOverflowPenalty } from "@/features/resources/inventoryLogic";
import { quoteSellPriceCredits } from "@/features/market/marketActions";

type Tab = "buy" | "sell";

function rarityChip(rarity: string) {
  if (rarity === "Rare") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  if (rarity === "Uncommon")
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  return "border-white/10 bg-white/5 text-white/80";
}

export default function WarExchangePage() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const [tab, setTab] = useState<Tab>("buy");
  const [confirm, setConfirm] = useState<
    | null
    | { kind: "buy"; listingId: string }
    | { kind: "sell"; key: ResourceKey; amount: number }
  >(null);
  const [toast, setToast] = useState<string | null>(null);

  const capacity = checkCapacity(player.resources);
  const penalty = getOverflowPenalty(capacity);

  const listings = useMemo(() => {
    const stockById = player.market.stockByListingId;
    return MARKET_LISTINGS.map((l) => ({
      ...l,
      stockLeft: stockById[l.id] ?? l.stock,
    }));
  }, [player.market.stockByListingId]);

  const sellRows = useMemo(() => {
    return SELLABLE_RESOURCE_KEYS.map((key) => {
      const owned = player.resources[key] ?? 0;
      const base = RESOURCE_BASE_PRICES[key] ?? 0;
      const quote = quoteSellPriceCredits(key, 10);
      return { key, owned, base, quote };
    });
  }, [player.resources]);

  function pushToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,90,20,0.18),rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-amber-300/40" />

        <ScreenHeader
          eyebrow="Bazaar / War Exchange"
          title="War Exchange"
          subtitle="Buy essentials for credits, sell surplus at a 10% cut. Purchases respect storage capacity."
        />

        {capacity.isOverloaded ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-5 text-sm text-red-100">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-100/70">
              OVERLOADED
            </div>
            <div className="mt-2">{penalty.message}</div>
            <div className="mt-2 text-red-100/80">
              Sell or discard surplus to restore pickup + purchase capacity.
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("buy")}
            className={[
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition",
              tab === "buy"
                ? "border-amber-300/50 bg-amber-500/15 text-amber-100"
                : "border-white/12 bg-white/5 text-white/70 hover:border-white/25",
            ].join(" ")}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setTab("sell")}
            className={[
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition",
              tab === "sell"
                ? "border-amber-300/50 bg-amber-500/15 text-amber-100"
                : "border-white/12 bg-white/5 text-white/70 hover:border-white/25",
            ].join(" ")}
          >
            Sell
          </button>
          <div className="ml-auto rounded-full border border-white/12 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
            Credits: {player.resources.credits}
          </div>
        </div>

        {tab === "buy" ? (
          <section className="grid gap-3 md:grid-cols-2">
            {listings.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border border-white/12 bg-black/25 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                      {l.name}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {l.category}
                    </div>
                    <div className="mt-2 text-xs text-white/60">{l.description}</div>
                  </div>
                  <div
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                      rarityChip(l.rarity),
                    ].join(" ")}
                  >
                    {l.rarity}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-white/75">
                    Price:{" "}
                    <span className="font-black text-white">{l.priceCredits}</span>{" "}
                    credits
                  </div>
                  <div className="text-white/55">Stock: {l.stockLeft}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirm({ kind: "buy", listingId: l.id })}
                  disabled={l.stockLeft <= 0 || player.resources.credits < l.priceCredits}
                  className="mt-4 w-full rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-500/16 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buy
                </button>
              </div>
            ))}
          </section>
        ) : (
          <section className="grid gap-3 md:grid-cols-2">
            {sellRows.map((row) => (
              <div
                key={row.key}
                className="rounded-2xl border border-white/12 bg-black/25 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                      {row.key}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Base {row.base} credits each · net 90%
                    </div>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    x{row.owned}
                  </div>
                </div>

                <div className="mt-3 text-sm text-white/70">
                  Sell 10 → net{" "}
                  <span className="font-black text-white">{row.quote.net}</span>{" "}
                  credits
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfirm({
                      kind: "sell",
                      key: row.key,
                      amount: Math.min(10, row.owned),
                    })
                  }
                  disabled={row.owned <= 0}
                  className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sell 10
                </button>
              </div>
            ))}
          </section>
        )}
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 md:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(17,20,34,0.96),rgba(8,10,16,0.98))] p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
              Confirm transaction
            </div>
            <div className="mt-2 text-lg font-black uppercase tracking-[0.06em] text-white">
              {confirm.kind === "buy" ? "Purchase" : "Sell"}
            </div>

            <div className="mt-3 text-sm text-white/70">
              {confirm.kind === "buy"
                ? (() => {
                    const listing = MARKET_LISTINGS.find((l) => l.id === confirm.listingId);
                    return listing
                      ? `${listing.name} for ${listing.priceCredits} credits.`
                      : "Listing not found.";
                  })()
                : (() => {
                    const quote = quoteSellPriceCredits(confirm.key, confirm.amount);
                    return `Sell ${confirm.amount} ${confirm.key} for ${quote.net} credits (after cut).`;
                  })()}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75 hover:border-white/25 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm.kind === "buy") {
                    const listing = MARKET_LISTINGS.find(
                      (l) => l.id === confirm.listingId,
                    );
                    dispatch({ type: "MARKET_BUY", payload: { listingId: confirm.listingId } });
                    pushToast(
                      listing
                        ? `Purchased ${listing.name}.`
                        : "Purchase submitted.",
                    );
                  } else {
                    dispatch({
                      type: "MARKET_SELL",
                      payload: { key: confirm.key, amount: confirm.amount },
                    });
                    pushToast(
                      `Sold ${confirm.amount} ${confirm.key} for credits.`,
                    );
                  }
                  setConfirm(null);
                }}
                className="rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-100 hover:border-amber-200/40 hover:bg-amber-500/16"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-[130] -translate-x-1/2 rounded-full border border-emerald-300/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-[0_8px_26px_rgba(0,0,0,0.35)]">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

