/**
 * CorruptionGauge — presentational 0–100 void corruption meter.
 *
 * Distinct from the existing VoidInstabilityReadout (which pulls from
 * useGame). This one is props-in, callbacks-out so feature screens can
 * compose it alongside vent/cleanse affordances.
 *
 * Threshold markers at 10 / 30 / 50 / 70 mirror
 * `consequenceTable.CORRUPTION_TIER_BREAKS` — high = tainted.
 */

import { MAX_CORRUPTION } from "@/features/condition/corruptionEngine";
import type { ConsequenceTier } from "@/features/condition/consequenceTable";

type CorruptionGaugeProps = {
  corruption: number;
  tier: ConsequenceTier;
  /** Optional mana budget — enables the Vent CTA when > 0. */
  mana?: number;
  onVentCorruption?: () => void;
};

// Markers expressed as corruption values (HIGH = bad).
// 10/30/50/70 thresholds become 30/50/70/90 on the raw scale
// (since corruptionTier flips low-is-good → high-is-bad).
const MARKERS: readonly { pct: number; label: string; tone: string }[] = [
  { pct: 30, label: "Wear", tone: "text-amber-200/70" },
  { pct: 50, label: "Strain", tone: "text-orange-200/80" },
  { pct: 70, label: "Danger", tone: "text-rose-300/85" },
  { pct: 90, label: "Critical", tone: "text-fuchsia-300/90" },
];

const TIER_TONE: Record<ConsequenceTier, { bar: string; frame: string; label: string }> = {
  none: {
    bar: "from-violet-700/70 to-fuchsia-600/60",
    frame: "border-violet-500/20",
    label: "Stable",
  },
  wear: {
    bar: "from-amber-500/80 to-violet-600/70",
    frame: "border-amber-400/25",
    label: "Creeping",
  },
  strain: {
    bar: "from-orange-500/85 to-fuchsia-600/75",
    frame: "border-orange-400/30",
    label: "Strained",
  },
  danger: {
    bar: "from-rose-500/90 to-fuchsia-600/85",
    frame: "border-rose-500/35",
    label: "Dangerous",
  },
  critical: {
    bar: "from-fuchsia-500 to-rose-500",
    frame: "border-fuchsia-400/50",
    label: "Critical",
  },
};

export default function CorruptionGauge({
  corruption,
  tier,
  mana,
  onVentCorruption,
}: CorruptionGaugeProps) {
  const clamped = Math.max(0, Math.min(MAX_CORRUPTION, corruption));
  const pct = (clamped / MAX_CORRUPTION) * 100;
  const tone = TIER_TONE[tier];
  const canVent = typeof onVentCorruption === "function" && (mana ?? 0) > 0;

  return (
    <div
      className={`rounded-[22px] border ${tone.frame} bg-[linear-gradient(135deg,rgba(40,15,60,0.35),rgba(8,10,18,0.92))] p-5 backdrop-blur`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-violet-200/55">
            Void Corruption
          </div>
          <div className="mt-1 text-lg font-black uppercase tracking-[0.1em] text-white">
            {tone.label}
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-violet-200/50">
            Instability load · exposure taxes flesh and soul
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Load
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums text-white">
            {Math.round(clamped)}
            <span className="text-sm font-semibold text-white/45"> / {MAX_CORRUPTION}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-black/40">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-[width] duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Threshold markers */}
        <div className="pointer-events-none absolute inset-0">
          {MARKERS.map((m) => (
            <div
              key={m.pct}
              className="absolute top-0 h-2 w-px bg-white/30"
              style={{ left: `${m.pct}%` }}
              aria-hidden
            />
          ))}
        </div>

        <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.18em] text-white/45">
          {MARKERS.map((m) => (
            <span key={m.pct} className={m.tone}>
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {canVent ? (
        <button
          type="button"
          onClick={onVentCorruption}
          className="mt-4 w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-400/15"
        >
          Vent with mana · {mana} avail
        </button>
      ) : null}
    </div>
  );
}
