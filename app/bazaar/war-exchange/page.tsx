"use client";

import { useEffect, useMemo, useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey } from "@/features/game/gameTypes";
import type { MarketListing } from "@/features/market/marketListings";
import {
  MARKET_LISTINGS,
  RESOURCE_BASE_PRICES,
  SELLABLE_RESOURCE_KEYS,
} from "@/features/market/marketData";
import {
  checkCapacity,
  enforceCapacity,
  getOverflowPenalty,
} from "@/features/resources/inventoryLogic";
import {
  quoteSellPriceCredits,
  WAR_EXCHANGE_SELL_BROKER_CUT,
} from "@/features/market/marketActions";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import { getStallBrokerBuyMarkupMultiplier } from "@/features/economy/stallUpkeep";
import {
  getWarExchangeBuyDemandMultiplier,
  getWarExchangeSellDemandMultiplier,
} from "@/features/world/warDemandMarket";
import StallArrearsCallout from "@/components/shared/StallArrearsCallout";
import WarFrontDemandCallout from "@/components/shared/WarFrontDemandCallout";
import TerritorialDoctrinePanel from "@/components/shared/TerritorialDoctrinePanel";
import { CARGO_INFUSION_HEADING } from "@/features/status/voidInfusionMetaphor";

type Tab = "buy" | "sell";

function rarityChip(rarity: string) {
  if (rarity === "Rare") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  if (rarity === "Uncommon")
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  return "border-white/10 bg-white/5 text-white/80";
}

const SELL_AMOUNTS = [1, 5, 10] as const;

export default function WarExchangePage() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const brokerCutPct = Math.round(WAR_EXCHANGE_SELL_BROKER_CUT * 100);
  const [tab, setTab] = useState<Tab>("buy");
  const [confirm, setConfirm] = useState<
    | null
    | { kind: "buy"; listingId: string }
    | { kind: "sell"; key: ResourceKey; amount: number }
  >(null);
  const [toast, setToast] = useState<string | null>(null);
  const [marketNow, setMarketNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setMarketNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

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
      return { key, owned, base };
    });
  }, [player.resources]);

  const buyMult = useMemo(
    () => getStallBrokerBuyMarkupMultiplier(player.stallArrearsCount ?? 0),
    [player.stallArrearsCount],
  );

  const listingBuyTotal = (listing: MarketListing) =>
    Math.ceil(
      listing.priceCredits *
        buyMult *
        getWarExchangeBuyDemandMultiplier(
          listing,
          player.factionAlignment,
          marketNow,
        ),
    );

  const sellQuote = (key: ResourceKey, amount: number) =>
    quoteSellPriceCredits(key, amount, {
      playerFaction: player.factionAlignment,
      nowMs: marketNow,
    });

  const fieldMedPatchListing = listings.find(
    (listing) => listing.id === "field-med-patch",
  );

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
          subtitle={`Buy essentials for credits, sell surplus at a ${brokerCutPct}% broker tithe. Purchases respect storage capacity.`}
        />

        {capacity.isOverloaded ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-5 text-sm text-red-100">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-100/70">
              {CARGO_INFUSION_HEADING}
            </div>
            <div className="mt-2">{penalty.message}</div>
            <div className="mt-2 text-red-100/80">
              Sell or discard surplus to bleed cargo infusion and restore pickup + purchase
              capacity.
            </div>
          </div>
        ) : null}

        <StallArrearsCallout />

        <TerritorialDoctrinePanel player={player} nowMs={marketNow} />

        <WarFrontDemandCallout
          nowMs={marketNow}
          playerFaction={player.factionAlignment}
          influence={player.influence}
          guildPledge={
            player.guild.kind === "inGuild" ? player.guild.pledge : null
          }
        />

        <p className="rounded-xl border border-rose-400/22 bg-rose-950/16 px-4 py-3 text-xs leading-relaxed text-rose-100/88">
          <span className="font-bold text-rose-50/95">Restricted war metal:</span>{" "}
          Ironheart never brokers as bulk surplus here — apex void drops feed
          obsidian-cycle forges in the Crafting District (Phase 7 restricted
          economy).
        </p>

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

        {tab === "sell" ? (
          <p className="text-xs leading-relaxed text-amber-100/80">
            Exchange quotes show net credits after the War Exchange&apos;s {brokerCutPct}% tithe
            (gross value − cut). Heavy sellers stack refine-first workflows from the Crafting
            District to avoid raw waste.
          </p>
        ) : null}

        {fieldMedPatchListing ? (
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100/90">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/75">
              Step 6 Gate Check
            </div>
            <div className="mt-1">
              Buy <span className="font-black text-emerald-50">Field Med Patch</span>{" "}
              ({listingBuyTotal(fieldMedPatchListing)} credits
              <span className="text-emerald-200/70">
                {" "}
                · list {fieldMedPatchListing.priceCredits}
              </span>
              ) and confirm stock decreases + item grant applies.
            </div>
            <button
              type="button"
              disabled={
                fieldMedPatchListing.stockLeft <= 0 ||
                player.resources.credits < listingBuyTotal(fieldMedPatchListing)
              }
              onClick={() =>
                setConfirm({
                  kind: "buy",
                  listingId: fieldMedPatchListing.id,
                })
              }
              className="mt-2 rounded-lg border border-emerald-200/45 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-50 hover:border-emerald-100/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Field Med Patch
            </button>
          </div>
        ) : null}

        {tab === "buy" ? (
          <section className="grid gap-3 md:grid-cols-2">
            {listings.map((l) => {
              const grantEntries = Object.entries(l.grant).filter(
                (e): e is [string, number] => typeof e[1] === "number" && e[1] > 0,
              );
              const warDm = getWarExchangeBuyDemandMultiplier(
                l,
                player.factionAlignment,
                marketNow,
              );
              const price = listingBuyTotal(l);
              const canAfford = player.resources.credits >= price;
              return (
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
                        "shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                        rarityChip(l.rarity),
                      ].join(" ")}
                    >
                      {l.rarity}
                    </div>
                  </div>

                  {grantEntries.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {grantEntries.map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100"
                        >
                          +{v} {formatResourceLabel(k)}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className={canAfford ? "text-white/75" : "text-red-300/90"}>
                      Price:{" "}
                      <span className="font-black text-white">{price}</span>{" "}
                      credits
                      {buyMult > 1 || Math.abs(warDm - 1) > 0.005 ? (
                        <span className="mt-0.5 block text-[11px] text-amber-200/80">
                          List {l.priceCredits} cr · stall ×{buyMult.toFixed(2)} · war
                          front ×{warDm.toFixed(2)}
                        </span>
                      ) : null}
                      {!canAfford ? (
                        <span className="ml-2 text-[11px] text-red-300/80">
                          (need {price - player.resources.credits} more)
                        </span>
                      ) : null}
                    </div>
                    <div className="text-white/55">Stock: {l.stockLeft}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirm({ kind: "buy", listingId: l.id })}
                    disabled={l.stockLeft <= 0 || !canAfford}
                    className="mt-4 w-full rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-500/16 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {l.stockLeft <= 0 ? "Out of Stock" : "Buy"}
                  </button>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="grid gap-3 md:grid-cols-2">
            {sellRows.map((row) => {
              const hasAny = row.owned > 0;
              const sellWarDm = getWarExchangeSellDemandMultiplier(
                row.key,
                player.factionAlignment,
                marketNow,
              );
              return (
                <div
                  key={row.key}
                  className="rounded-2xl border border-white/12 bg-black/25 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                        {formatResourceLabel(row.key)}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                        {row.base} credits each · net 90% after cut
                      </div>
                      {Math.abs(sellWarDm - 1.01) > 0.001 ? (
                        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/85">
                          War front demand ×{sellWarDm.toFixed(2)} (gross before
                          tithe)
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] text-white/40">
                          War front demand ×1.01 baseline
                        </div>
                      )}
                    </div>
                    <div
                      className={[
                        "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                        hasAny
                          ? "border-white/15 bg-white/8 text-white/85"
                          : "border-white/8 bg-white/[0.03] text-white/35",
                      ].join(" ")}
                    >
                      x{row.owned} owned
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {SELL_AMOUNTS.map((qty) => {
                      const canSell = row.owned >= qty;
                      const net = sellQuote(row.key, qty).net;
                      return (
                        <button
                          key={qty}
                          type="button"
                          onClick={() =>
                            setConfirm({ kind: "sell", key: row.key, amount: qty })
                          }
                          disabled={!canSell}
                          className="flex-1 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-center transition hover:border-white/25 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <div className="text-xs font-bold text-white/90">
                            Sell {qty}
                          </div>
                          <div className="mt-0.5 text-[10px] text-white/50">
                            +{net} cr
                          </div>
                        </button>
                      );
                    })}
                    {row.owned > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirm({ kind: "sell", key: row.key, amount: row.owned })
                        }
                        className="flex-1 rounded-xl border border-amber-300/20 bg-amber-500/8 px-3 py-2 text-center transition hover:border-amber-300/35 hover:bg-amber-500/14"
                      >
                        <div className="text-xs font-bold text-amber-100">
                          Sell All
                        </div>
                        <div className="mt-0.5 text-[10px] text-amber-100/55">
                          +{sellQuote(row.key, row.owned).net} cr
                        </div>
                      </button>
                    ) : (
                      <div className="flex-1 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-center opacity-30">
                        <div className="text-xs font-bold text-white/60">None</div>
                        <div className="mt-0.5 text-[10px] text-white/35">stocked</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                    if (!listing) return "Listing not found.";
                    const grantEntries = Object.entries(listing.grant).filter(
                      (e): e is [string, number] => typeof e[1] === "number" && e[1] > 0,
                    );
                    const charge = listingBuyTotal(listing);
                    const warDm = getWarExchangeBuyDemandMultiplier(
                      listing,
                      player.factionAlignment,
                      marketNow,
                    );
                    return (
                      <span>
                        {listing.name} for{" "}
                        <span className="font-black text-white">{charge}</span>{" "}
                        credits.
                        {buyMult > 1 || Math.abs(warDm - 1) > 0.005 ? (
                          <span className="mt-1 block text-[11px] text-amber-200/85">
                            List {listing.priceCredits} cr · stall ×{buyMult.toFixed(2)} · war
                            ×{warDm.toFixed(2)}
                          </span>
                        ) : null}
                        {grantEntries.length > 0 ? (
                          <span className="mt-1 block text-emerald-100/80">
                            Receive:{" "}
                            {grantEntries
                              .map(([k, v]) => `${v} ${formatResourceLabel(k)}`)
                              .join(", ")}
                          </span>
                        ) : null}
                      </span>
                    );
                  })()
                : (() => {
                    const quote = sellQuote(confirm.key, confirm.amount);
                    const warSm = getWarExchangeSellDemandMultiplier(
                      confirm.key,
                      player.factionAlignment,
                      marketNow,
                    );
                    return (
                      <span>
                        Sell{" "}
                        <span className="font-black text-white">{confirm.amount}</span>{" "}
                        {formatResourceLabel(confirm.key)} →{" "}
                        <span className="font-black text-emerald-200">+{quote.net} credits</span>{" "}
                        (after {brokerCutPct}% tithe).
                        {Math.abs(warSm - 1) > 0.005 ? (
                          <span className="mt-1 block text-[11px] text-amber-200/85">
                            Gross scaled · war ×{warSm.toFixed(2)}
                          </span>
                        ) : null}
                      </span>
                    );
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
                    const stockLeft = listing
                      ? player.market.stockByListingId[listing.id] ?? listing.stock
                      : 0;
                    if (!listing) {
                      pushToast("Listing unavailable.");
                      setConfirm(null);
                      return;
                    }
                    if (stockLeft <= 0) {
                      pushToast("Listing out of stock.");
                      setConfirm(null);
                      return;
                    }
                    const charge = listingBuyTotal(listing);
                    if (player.resources.credits < charge) {
                      pushToast("Insufficient credits.");
                      setConfirm(null);
                      return;
                    }
                    const { accepted, blocked } = enforceCapacity(
                      player.resources,
                      listing.grant,
                    );
                    if (Object.keys(accepted).length === 0) {
                      const cap = checkCapacity(player.resources);
                      pushToast(
                        cap.isOverloaded
                          ? "Storage overloaded. Sell or discard surplus."
                          : "No storage space for this purchase.",
                      );
                      setConfirm(null);
                      return;
                    }
                    dispatch({ type: "MARKET_BUY", payload: { listingId: confirm.listingId } });
                    const nextCredits = player.resources.credits - charge;
                    const nextStock = Math.max(0, stockLeft - 1);
                    pushToast(
                      listing.id === "field-med-patch"
                        ? `Purchased ${listing.name}. Credits ${nextCredits}. Stock ${nextStock}.`
                        : blocked
                          ? `Purchased ${listing.name}. Partial storage accepted.`
                          : `Purchased ${listing.name}.`,
                    );
                  } else {
                    const owned = player.resources[confirm.key] ?? 0;
                    if (owned < confirm.amount) {
                      pushToast("Insufficient stock.");
                      setConfirm(null);
                      return;
                    }
                    dispatch({
                      type: "MARKET_SELL",
                      payload: { key: confirm.key, amount: confirm.amount },
                    });
                    const net = sellQuote(confirm.key, confirm.amount).net;
                    pushToast(
                      `Sold ${confirm.amount} ${formatResourceLabel(confirm.key)} for +${net} credits.`,
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
