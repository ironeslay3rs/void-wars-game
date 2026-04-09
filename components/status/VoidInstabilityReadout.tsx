"use client";

import { useGame } from "@/features/game/gameContext";
import { getVoidInstabilityTierLabel } from "@/features/progression/phase3Progression";
import {
  VOID_INFUSION_HEADING,
  voidInfusionBodyExplainer,
} from "@/features/status/voidInfusionMetaphor";

export default function VoidInstabilityReadout() {
  const { state } = useGame();
  const v = state.player.voidInstability;
  const { label, hint } = getVoidInstabilityTierLabel(v);

  return (
    <div className="rounded-[22px] border border-violet-500/20 bg-[linear-gradient(135deg,rgba(60,20,80,0.35),rgba(8,10,18,0.92))] p-5 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-violet-200/55">
            Consequence
          </div>
          <div className="mt-2 text-lg font-black uppercase tracking-[0.1em] text-white">
            {VOID_INFUSION_HEADING}
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-violet-200/50">
            Instability index · same meter as field HUD
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
            <span className="font-semibold text-white/88">{hint}</span>{" "}
            {voidInfusionBodyExplainer}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Tier
          </div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-violet-100">
            {label}
          </div>
          <div className="mt-2 text-2xl font-black tabular-nums text-white">
            {Math.round(v)}
            <span className="text-sm font-semibold text-white/45"> / 100</span>
          </div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600/90 to-fuchsia-500/80 transition-[width] duration-500"
          style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
        />
      </div>
    </div>
  );
}
