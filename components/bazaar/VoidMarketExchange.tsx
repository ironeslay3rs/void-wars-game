"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  quoteVoidMarketBuy,
  quoteVoidMarketSell,
  VOID_MARKET_BUY_TAX_RATE,
  VOID_MARKET_COMMODITIES,
  VOID_MARKET_COMMODITY_LABEL,
  VOID_MARKET_GATHERING_SELL_BONUS,
  VOID_MARKET_LISTING_FEE_RATE,
  type VoidMarketCommodity,
} from "@/features/bazaar/voidMarketEconomy";
import { getVoidMarketWarAdjustments } from "@/features/factions/warEconomy";
import { CAREER_GATHERING_FIELD_LOOT_MULT } from "@/features/player/careerFocusModifiers";

function clampUnits(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(999, Math.max(1, Math.floor(n)));
}

export default function VoidMarketExchange() {
  const { state, dispatch } = useGame();
  const [commodity, setCommodity] = useState<VoidMarketCommodity>("scrapAlloy");
  const [units, setUnits] = useState(1);
  const res = state.player.resources;
  const focus = state.player.careerFocus;

  const u = clampUnits(units);
  const buyQuote = useMemo(
    () => quoteVoidMarketBuy(u, commodity),
    [u, commodity],
  );
  const sellQuote = useMemo(
    () => quoteVoidMarketSell(u, commodity, focus),
    [u, commodity, focus],
  );
  const war = getVoidMarketWarAdjustments(state.player);
  const buyTotal = Math.ceil(buyQuote.totalCredits * war.buyMult);
  const sellNet = Math.floor(sellQuote.netCredits * war.sellMult);

  const canBuy = res.credits >= buyTotal;
  const canSell = (res[commodity] ?? 0) >= u;

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-black/40 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/80">
        Exchange floor
      </div>
      <h2 className="mt-2 text-xl font-black text-white md:text-2xl">
        Commodity desk
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-white/65">
        Legal-facing trades for the five active resources:{" "}
        <span className="text-white/85">Credits</span> settle buys;{" "}
        <span className="text-white/85">Scrap, Ember, Rune dust, Bio samples</span>{" "}
        move in lots here. Purchases add a{" "}
        {Math.round(VOID_MARKET_BUY_TAX_RATE * 100)}% city tax; sales post a{" "}
        {Math.round(VOID_MARKET_LISTING_FEE_RATE * 100)}% listing fee on gross
        credits.
      </p>

      {focus === "gathering" ? (
        <p className="mt-3 max-w-3xl rounded-xl border border-emerald-400/30 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100/90">
          Gathering profession: +{Math.round(VOID_MARKET_GATHERING_SELL_BONUS * 100)}
          % better sell quotes before fees. Field pickups already use ×
          {CAREER_GATHERING_FIELD_LOOT_MULT} amounts on the Void Field.
        </p>
      ) : (
        <p className="mt-3 text-xs text-white/45">
          Set{" "}
          <Link
            href="/character"
            className="text-cyan-200/90 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
          >
            Gathering
          </Link>{" "}
          focus for stronger sell quotes. Crafting discounts apply in the
          Crafting District, not at this desk.
        </p>
      )}

      {war.label ? (
        <p className="mt-3 max-w-3xl rounded-xl border border-rose-400/30 bg-rose-950/25 px-4 py-3 text-sm text-rose-100/90">
          {war.label}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex min-w-[200px] flex-col gap-2 text-xs text-white/55">
          Commodity
          <select
            value={commodity}
            onChange={(e) =>
              setCommodity(e.target.value as VoidMarketCommodity)
            }
            className="rounded-xl border border-white/15 bg-black/55 px-3 py-2.5 text-sm font-semibold text-white"
          >
            {VOID_MARKET_COMMODITIES.map((c) => (
              <option key={c} value={c}>
                {VOID_MARKET_COMMODITY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex max-w-[180px] flex-col gap-2 text-xs text-white/55">
          Units (lot size)
          <input
            type="number"
            min={1}
            max={999}
            value={units}
            onChange={(e) => setUnits(clampUnits(Number(e.target.value)))}
            className="rounded-xl border border-white/15 bg-black/55 px-3 py-2.5 text-sm tabular-nums text-white"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-400/25 bg-cyan-950/20 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
            Buy
          </div>
          <div className="mt-2 space-y-1 text-sm text-white/75">
            <div className="flex justify-between gap-2">
              <span>List subtotal</span>
              <span className="tabular-nums">{buyQuote.baseCredits} cr</span>
            </div>
            <div className="flex justify-between gap-2 text-white/55">
              <span>Tax ({Math.round(VOID_MARKET_BUY_TAX_RATE * 100)}%)</span>
              <span className="tabular-nums">+{buyQuote.taxCredits} cr</span>
            </div>
            {war.buyMult !== 1 ? (
              <div className="flex justify-between gap-2 text-xs text-cyan-200/80">
                <span>Regional adjustment</span>
                <span>×{war.buyMult.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-2 border-t border-white/10 pt-2 font-bold text-white">
              <span>Debit</span>
              <span className="tabular-nums">{buyTotal} cr</span>
            </div>
          </div>
          <button
            type="button"
            disabled={!canBuy}
            onClick={() =>
              dispatch({
                type: "VOID_MARKET_TRADE",
                payload: { side: "buy", commodity, units: u },
              })
            }
            className="mt-4 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 py-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-50 transition hover:bg-cyan-500/22 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buy {u} {VOID_MARKET_COMMODITY_LABEL[commodity]}
          </button>
        </div>

        <div className="rounded-xl border border-amber-400/25 bg-amber-950/15 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
            Sell
          </div>
          <div className="mt-2 space-y-1 text-sm text-white/75">
            <div className="flex justify-between gap-2">
              <span>Gross (after profession adj.)</span>
              <span className="tabular-nums">{sellQuote.grossCredits} cr</span>
            </div>
            <div className="flex justify-between gap-2 text-white/55">
              <span>Listing fee</span>
              <span className="tabular-nums">
                −{sellQuote.listingFeeCredits} cr
              </span>
            </div>
            {war.sellMult !== 1 ? (
              <div className="flex justify-between gap-2 text-xs text-amber-200/80">
                <span>Regional adjustment</span>
                <span>×{war.sellMult.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-2 border-t border-white/10 pt-2 font-bold text-white">
              <span>Credit to stock</span>
              <span className="tabular-nums">+{sellNet} cr</span>
            </div>
          </div>
          <button
            type="button"
            disabled={!canSell}
            onClick={() =>
              dispatch({
                type: "VOID_MARKET_TRADE",
                payload: { side: "sell", commodity, units: u },
              })
            }
            className="mt-4 w-full rounded-xl border border-amber-400/40 bg-amber-500/12 py-3 text-sm font-bold uppercase tracking-[0.12em] text-amber-50 transition hover:bg-amber-500/18 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sell {u} {VOID_MARKET_COMMODITY_LABEL[commodity]}
          </button>
        </div>
      </div>

      <p className="mt-5 text-[11px] text-white/40">
        Boss iron / phase‑2 mats (Ironheart, lattice, relic, shard) are not listed here — break
        them down in the{" "}
        <Link
          href="/market/crafting-district"
          className="text-cyan-200/80 underline decoration-cyan-400/30 underline-offset-2 hover:text-white"
        >
          Crafting District
        </Link>
        .
      </p>
    </div>
  );
}
