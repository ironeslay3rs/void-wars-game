"use client";

/**
 * SiegeConsoleModal — per-war tick console.
 *
 * Shows the territory under siege, last tick's outcome (if any), cumulative
 * ticks / damage / stability drift, and a Next Tick button. Host wires
 * `onResolveTick(warId, seed)` to dispatch resolveSiegeTick.
 *
 * Presentational only — no dispatch inside.
 */

import { useCallback, useState } from "react";
import type {
  SiegeOutcome,
  Territory,
  War,
  WarPhase,
  TerritoryOwner,
} from "@/features/territory/territoryTypes";

export type SiegeConsoleModalProps = {
  war: War;
  territory: Territory;
  /** Most recent siege outcome this war has produced, if any. */
  lastOutcome?: SiegeOutcome | null;
  /** Cumulative totals since the war opened (host-maintained). */
  totals?: {
    damageDealt: number;
    stabilityDrift: number;
    tributeSwing: number;
  };
  /** Seed for the next tick — host supplies; modal displays it. */
  nextSeed: number;
  onResolveTick?: (warId: string, seed: number) => void;
  onClose: () => void;
};

const PHASE_LABEL: Record<WarPhase, string> = {
  skirmish: "Skirmish",
  siege: "Siege",
  assault: "Assault",
  resolved: "Resolved",
};

const EMPIRE_LABEL: Record<string, string> = {
  "verdant-coil": "Verdant Coil",
  "chrome-synod": "Chrome Synod",
  "ember-vault": "Ember Vault",
  "black-city": "Black City",
};

function ownerLabel(o: TerritoryOwner): string {
  if (o.kind === "guild") return `Guild · ${o.id}`;
  return EMPIRE_LABEL[o.id] ?? o.id;
}

export default function SiegeConsoleModal({
  war,
  territory,
  lastOutcome,
  totals,
  nextSeed,
  onResolveTick,
  onClose,
}: SiegeConsoleModalProps) {
  const [pending, setPending] = useState(false);
  const resolved = war.phase === "resolved";

  const handleTick = useCallback(() => {
    if (resolved || !onResolveTick) return;
    setPending(true);
    onResolveTick(war.id, nextSeed);
    // host will re-render with fresh props; clear pending on next render.
    setTimeout(() => setPending(false), 0);
  }, [resolved, onResolveTick, war.id, nextSeed]);

  const stabPct = Math.round(territory.stability * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Siege console · ${territory.name}`}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-t-2xl border border-rose-400/35 bg-rose-950/92 p-5 text-white sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
              Siege Console
            </div>
            <h3 className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white">
              {territory.name}
            </h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/55">
              {ownerLabel(war.attacker)} → {ownerLabel(war.defender)}
            </p>
          </div>
          <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
            {PHASE_LABEL[war.phase]} · T{war.ticks}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <StatCell label="Garrison" value={`${territory.garrison}`} />
          <StatCell label="Stability" value={`${stabPct}%`} />
          <StatCell
            label="Momentum"
            value={`${war.momentum >= 0 ? "+" : ""}${war.momentum.toFixed(2)}`}
          />
        </div>

        {totals ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/35 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Cumulative
            </div>
            <ul className="mt-2 space-y-1 text-[11px]" role="list">
              <Row label="Damage dealt" value={`${totals.damageDealt}`} />
              <Row
                label="Stability drift"
                value={`${totals.stabilityDrift >= 0 ? "+" : ""}${(totals.stabilityDrift * 100).toFixed(1)}%`}
              />
              <Row
                label="Tribute swing"
                value={`+${(totals.tributeSwing * 100).toFixed(0)}%`}
              />
            </ul>
          </div>
        ) : null}

        {lastOutcome ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/35 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Last Tick
            </div>
            <p className="mt-1 text-[12px] italic text-white/75">
              {lastOutcome.flavor}
            </p>
            <ul className="mt-2 space-y-1 text-[11px]" role="list">
              <Row label="Damage" value={`${lastOutcome.damage}`} />
              <Row
                label="Stability Δ"
                value={`${lastOutcome.stabilityDelta >= 0 ? "+" : ""}${(lastOutcome.stabilityDelta * 100).toFixed(1)}%`}
              />
              <Row
                label="Tribute swing"
                value={`+${(lastOutcome.tributeSwing * 100).toFixed(0)}%`}
              />
              <Row
                label="Resolved"
                value={lastOutcome.resolved ? "Yes" : "No"}
              />
            </ul>
          </div>
        ) : null}

        {resolved ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-emerald-400/35 bg-emerald-950/50 p-3 text-[12px] text-emerald-100"
          >
            War resolved. No further ticks required.
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleTick}
            disabled={resolved || pending || !onResolveTick}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Resolve Tick
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-white/35">
          Next seed · {nextSeed}
        </p>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1 last:border-0">
      <span className="text-white/70">{label}</span>
      <span className="font-bold tabular-nums text-white/90">{value}</span>
    </li>
  );
}
