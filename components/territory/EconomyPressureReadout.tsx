"use client";

/**
 * EconomyPressureReadout — surfaces incomeMult / priceMult / raidRisk.
 *
 * AFK Journey clarity: the player should see *why* their credits are
 * sagging and their scrap cost is spiking. This card reads EconomyPressure
 * from the selector and renders three tuned meters plus a stability readout.
 */

import type { EconomyPressure } from "@/features/territory/territoryTypes";

export type EconomyPressureReadoutProps = {
  pressure: EconomyPressure;
  className?: string;
};

function incomeTone(mult: number): { chip: string; label: string } {
  if (mult >= 1.0)
    return {
      chip: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
      label: "Healthy",
    };
  if (mult >= 0.85)
    return {
      chip: "border-amber-400/35 bg-amber-500/12 text-amber-100",
      label: "Squeezed",
    };
  return {
    chip: "border-rose-500/45 bg-rose-500/15 text-rose-100",
    label: "Starved",
  };
}

function priceTone(mult: number): { chip: string; label: string } {
  if (mult <= 1.05)
    return {
      chip: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
      label: "Stable",
    };
  if (mult <= 1.35)
    return {
      chip: "border-amber-400/35 bg-amber-500/12 text-amber-100",
      label: "Inflated",
    };
  return {
    chip: "border-rose-500/45 bg-rose-500/15 text-rose-100",
    label: "Wartime",
  };
}

function raidTone(risk: number): { chip: string; label: string } {
  if (risk <= 0.15)
    return {
      chip: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
      label: "Low",
    };
  if (risk <= 0.4)
    return {
      chip: "border-amber-400/35 bg-amber-500/12 text-amber-100",
      label: "Elevated",
    };
  return {
    chip: "border-rose-500/45 bg-rose-500/15 text-rose-100",
    label: "Severe",
  };
}

export default function EconomyPressureReadout({
  pressure,
  className,
}: EconomyPressureReadoutProps) {
  const { incomeMult, priceMult, raidRisk, activeWars, avgStability } =
    pressure;
  const income = incomeTone(incomeMult);
  const price = priceTone(priceMult);
  const raid = raidTone(raidRisk);
  const stabPct = Math.round(avgStability * 100);

  return (
    <section
      aria-label="Economy pressure"
      className={`rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,22,0.94),rgba(7,10,14,0.97))] p-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.3)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Economy Pressure
          </div>
          <div className="mt-0.5 text-base font-black uppercase tracking-[0.06em] text-white">
            Wartime Readout
          </div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
          {activeWars} war{activeWars === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <MeterCell
          label="Income"
          value={`x${incomeMult.toFixed(2)}`}
          chip={income.chip}
          chipLabel={income.label}
          fillPct={Math.min(100, Math.max(0, Math.round(incomeMult * 70)))}
          fillClass="bg-emerald-400/70"
          help="Earn rate across passive + run income."
        />
        <MeterCell
          label="Prices"
          value={`x${priceMult.toFixed(2)}`}
          chip={price.chip}
          chipLabel={price.label}
          fillPct={Math.min(100, Math.max(0, Math.round((priceMult - 0.9) * 90)))}
          fillClass="bg-amber-400/70"
          help="Market + broker costs."
        />
        <MeterCell
          label="Raid Risk"
          value={`${Math.round(raidRisk * 100)}%`}
          chip={raid.chip}
          chipLabel={raid.label}
          fillPct={Math.round(raidRisk * 100)}
          fillClass="bg-rose-500/75"
          help="Per-cycle chance a raid tick lands."
        />
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            World Stability
          </span>
          <span className="text-[11px] font-bold tabular-nums text-white/80">
            {stabPct}%
          </span>
        </div>
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={stabPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-cyan-400/70"
            style={{ width: `${stabPct}%` }}
          />
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-white/55">
          Stability across the Three Empires and Black City lanes. Low
          stability widens every meter above.
        </p>
      </div>
    </section>
  );
}

function MeterCell({
  label,
  value,
  chip,
  chipLabel,
  fillPct,
  fillClass,
  help,
}: {
  label: string;
  value: string;
  chip: string;
  chipLabel: string;
  fillPct: number;
  fillClass: string;
  help: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          {label}
        </span>
        <span
          className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${chip}`}
        >
          {chipLabel}
        </span>
      </div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-white">
        {value}
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={fillPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full ${fillClass}`} style={{ width: `${fillPct}%` }} />
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-white/50">{help}</p>
    </div>
  );
}
