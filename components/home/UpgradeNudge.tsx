"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import { getUpgradeReadySummary } from "@/features/upgrades/upgradeSelectors";

const PATH_DOT_COLORS: Record<string, string> = {
  bio: "bg-emerald-400",
  mecha: "bg-slate-400",
  pure: "bg-amber-400",
};

export default function UpgradeNudge() {
  const { state } = useGame();
  const summary = getUpgradeReadySummary(state);

  if (!summary.closest) return null;

  const { closest, readyCount } = summary;
  const dotColor = closest.pathAccent
    ? PATH_DOT_COLORS[closest.pathAccent] ?? "bg-cyan-400"
    : "bg-cyan-400";

  return (
    <Link
      href={readyCount > 1 ? "/upgrades" : closest.href}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]"
    >
      {/* Pulsing ready dot */}
      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        {closest.ready ? (
          <>
            <span className={`absolute h-5 w-5 animate-ping rounded-full ${dotColor} opacity-30`} />
            <span className={`relative h-2.5 w-2.5 rounded-full ${dotColor}`} />
          </>
        ) : (
          <span className="relative h-2.5 w-2.5 rounded-full bg-white/30" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {closest.ready ? (
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/80">
            Upgrade ready
          </div>
        ) : (
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Next upgrade
          </div>
        )}
        <div className="mt-0.5 truncate text-sm font-semibold text-white">
          {closest.title}
        </div>
        <div className="mt-0.5 text-[11px] text-white/50">
          {closest.gap}
        </div>
      </div>

      {/* Progress arc or ready badge */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {closest.ready ? (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
            Claim
          </span>
        ) : (
          <span className="text-sm font-black tabular-nums text-white/70">
            {closest.progressPct}%
          </span>
        )}
        {readyCount > 1 ? (
          <span className="text-[9px] font-semibold text-white/35">
            +{readyCount - 1} more
          </span>
        ) : null}
      </div>
    </Link>
  );
}
