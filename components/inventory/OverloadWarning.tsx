"use client";

import Link from "next/link";
import QuickDiscardResourceButtons from "@/components/inventory/QuickDiscardResourceButtons";

export default function OverloadWarning({
  message,
  missionSpeedPenalty,
  movementPenaltyPct,
  missionRewardPenaltyPct,
}: {
  message: string;
  missionSpeedPenalty?: number;
  movementPenaltyPct?: number;
  missionRewardPenaltyPct?: number;
}) {
  return (
    <div className="mt-3 rounded-xl border border-red-400/35 bg-red-500/12 px-4 py-3 text-sm text-red-100">
      <div className="font-bold uppercase tracking-[0.12em]">Overloaded</div>
      <div className="mt-1 text-red-100/90">{message}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-50/95">
        {typeof missionSpeedPenalty === "number" ? (
          <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-1">
            Mission Time x{missionSpeedPenalty.toFixed(1)}
          </span>
        ) : null}
        {typeof missionRewardPenaltyPct === "number" && missionRewardPenaltyPct > 0 ? (
          <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-1">
            Rewards -{missionRewardPenaltyPct}%
          </span>
        ) : null}
        {typeof movementPenaltyPct === "number" && movementPenaltyPct > 0 ? (
          <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-1">
            Move -{movementPenaltyPct}%
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/bazaar/war-exchange"
          className="rounded-lg border border-red-200/45 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-red-50 hover:border-red-100/70"
        >
          Sell Surplus
        </Link>
        <QuickDiscardResourceButtons />
      </div>
    </div>
  );
}
