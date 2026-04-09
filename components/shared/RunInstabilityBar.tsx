"use client";

import { useState } from "react";
import { useGame } from "@/features/game/gameContext";
import { formatRunStyleLabel } from "@/features/game/runArchetypeLogic";
import {
  formatPushSummary,
  formatRunInstabilityChip,
  formatVentCostLabel,
  runInstabilityBarTone,
  getPushRunInstabilityBlocker,
  getVentRunInstabilityBlocker,
} from "@/features/progression/runInstability";

type Props = {
  className?: string;
};

export default function RunInstabilityBar({ className = "" }: Props) {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);
  const now = Date.now();

  const ri = Math.max(0, Math.min(100, Math.round(state.player.runInstability ?? 0)));
  const lastLogLine =
    state.player.runInstabilityLog?.length && state.player.runInstabilityLog.length > 0
      ? state.player.runInstabilityLog[state.player.runInstabilityLog.length - 1]?.message
      : null;

  const ventBlock = getVentRunInstabilityBlocker(state.player);
  const pushBlock = getPushRunInstabilityBlocker(state.player, now);

  const tone = runInstabilityBarTone(ri);
  const barGradient =
    tone === "critical"
      ? "from-rose-500 to-orange-400"
      : tone === "hot"
        ? "from-amber-500 to-orange-500"
        : tone === "warm"
          ? "from-amber-400/90 to-yellow-500/70"
          : "from-cyan-500/50 to-emerald-500/40";

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/35 px-3 py-2 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">
        <span>Run heat</span>
        <span
          className={
            tone === "critical"
              ? "text-rose-200"
              : tone === "hot"
                ? "text-amber-200/90"
                : "text-white/70"
          }
        >
          {ri}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-[width] duration-300`}
          style={{ width: `${ri}%` }}
        />
      </div>
      <div className="mt-1.5 text-[10px] font-semibold text-white/65">
        {formatRunInstabilityChip(ri)}
      </div>
      <p className="mt-1 text-[9px] font-medium tracking-wide text-white/50">
        {formatRunStyleLabel(state.player.runArchetype)}
      </p>
      {state.player.runHeatPushBoost &&
      now < state.player.runHeatPushBoost.expiresAt ? (
        <p className="mt-1 text-[9px] font-semibold text-fuchsia-200/90">
          {formatPushSummary(now, state.player.runHeatPushBoost)}
        </p>
      ) : (
        <p className="mt-1 text-[9px] text-white/45">{formatPushSummary(now, null)}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={ventBlock !== null}
          title={ventBlock ?? formatVentCostLabel()}
          onClick={() => {
            dispatch({ type: "VENT_RUN_INSTABILITY" });
            setFeedback("Vent: paid credits + scrap — heat dropped (see log).");
            window.setTimeout(() => setFeedback(null), 3200);
          }}
          className="rounded-lg border border-cyan-400/35 bg-cyan-950/40 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Vent heat
        </button>
        <button
          type="button"
          disabled={pushBlock !== null}
          title={pushBlock ?? "Raises heat; primes next settlement bonus"}
          onClick={() => {
            dispatch({ type: "PUSH_RUN_INSTABILITY", payload: {} });
            setFeedback("Push: heat up — next settlement carries the bonus window.");
            window.setTimeout(() => setFeedback(null), 3200);
          }}
          className="rounded-lg border border-fuchsia-400/35 bg-fuchsia-950/35 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-300/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Push heat
        </button>
      </div>
      <p className="mt-1 text-[8px] text-white/35">{formatVentCostLabel()}</p>

      {feedback ? (
        <p className="mt-1 text-[9px] text-emerald-200/90">{feedback}</p>
      ) : null}

      {ri >= 80 ? (
        <p className="mt-1 text-[9px] leading-snug text-rose-200/85">
          Critical band — extract or return hub before backlash maxes your next
          payout.
        </p>
      ) : null}
      {lastLogLine ? (
        <p className="mt-1 border-t border-white/10 pt-1.5 text-[9px] leading-snug text-white/40">
          {lastLogLine}
        </p>
      ) : null}
    </div>
  );
}
