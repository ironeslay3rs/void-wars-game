"use client";

import { useGame } from "@/features/game/gameContext";
import {
  getStallArrearsPayoffTotal,
  getStallBrokerBuyMarkupMultiplier,
  STALL_RENT_CREDITS,
  STALL_RENT_INTERVAL_MS,
} from "@/features/economy/stallUpkeep";

export default function StallArrearsCallout() {
  const { state, dispatch } = useGame();
  const arrears = state.player.stallArrearsCount ?? 0;
  const payoff = getStallArrearsPayoffTotal(arrears);
  const mult = getStallBrokerBuyMarkupMultiplier(arrears);
  const markupPct = Math.round((mult - 1) * 100);
  const credits = state.player.resources.credits;
  const canPay = arrears > 0 && credits >= payoff;

  const rentHours = STALL_RENT_INTERVAL_MS / (60 * 60 * 1000);

  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 text-sm",
        arrears > 0
          ? "border-amber-400/35 bg-amber-950/25 text-amber-50/95"
          : "border-white/12 bg-black/20 text-white/70",
      ].join(" ")}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
        Stall &amp; workshop rent
      </div>
      <p className="mt-2 leading-relaxed">
        District space bills{" "}
        <span className="font-semibold text-white/90">
          {STALL_RENT_CREDITS} credits
        </span>{" "}
        about every{" "}
        <span className="font-semibold text-white/90">{rentHours} hours</span>{" "}
        of real time. If you cannot pay, the ledger records arrears; the War
        Exchange adds up to{" "}
        <span className="font-semibold text-amber-200/90">+30% buy markup</span>{" "}
        until you settle.
      </p>
      {arrears > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-amber-400/20 pt-3">
          <div className="text-xs">
            <span className="font-bold text-amber-100">Arrears: {arrears}</span>
            <span className="text-white/60"> · </span>
            <span className="text-white/75">
              Payoff:{" "}
              <span className="font-black text-white">{payoff}</span> credits
            </span>
            <span className="text-white/60"> · </span>
            <span className="text-amber-200/85">
              Buy markup now +{markupPct}%
            </span>
          </div>
          <button
            type="button"
            disabled={!canPay}
            onClick={() => dispatch({ type: "PAY_STALL_ARREARS" })}
            className="rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-50 hover:border-amber-200/55 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pay arrears
          </button>
          {!canPay ? (
            <span className="text-[11px] text-red-200/85">
              Need {Math.max(0, payoff - credits)} more credits
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
