"use client";

/**
 * CapacityMeter — Blood / Frame / Resonance used-vs-max display.
 * Presentational only; consumes `getCapacitySnapshots(player)` from
 * features/mastery/capacityCosts.
 *
 * Canon copy: Pure (NEVER "Spirit"). Pool labels follow canon mapping
 * Bio→Blood, Mecha→Frame, Pure→Resonance.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import type { RuneCapacityPool } from "@/features/mastery/runeMasteryTypes";
import {
  getCapacitySnapshots,
  type CapacityPoolSnapshot,
} from "@/features/mastery/capacityCosts";

const POOL_LABEL: Record<RuneCapacityPool, string> = {
  blood: "Blood",
  frame: "Frame",
  resonance: "Resonance",
};

const POOL_SCHOOL: Record<RuneCapacityPool, string> = {
  blood: "Bio pool",
  frame: "Mecha pool",
  resonance: "Pure pool",
};

const POOL_BAR: Record<RuneCapacityPool, string> = {
  blood: "bg-emerald-500/80",
  frame: "bg-cyan-500/80",
  resonance: "bg-amber-500/80",
};

const POOL_TRACK: Record<RuneCapacityPool, string> = {
  blood: "bg-emerald-900/30",
  frame: "bg-cyan-900/30",
  resonance: "bg-amber-900/30",
};

function PoolRow({ snap }: { snap: CapacityPoolSnapshot }) {
  const used = Math.max(0, snap.max - snap.current);
  const pct = snap.max <= 0 ? 0 : Math.min(100, (used / snap.max) * 100);
  const ariaLabel = `${POOL_LABEL[snap.pool]} (${POOL_SCHOOL[snap.pool]}): ${used} of ${snap.max} used, ${snap.headroom} headroom`;
  return (
    <div aria-label={ariaLabel}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
          {POOL_LABEL[snap.pool]}
          <span className="ml-1.5 text-[10px] font-normal tracking-normal text-white/35">
            {POOL_SCHOOL[snap.pool]}
          </span>
        </span>
        <span className="text-xs tabular-nums text-white/55">
          {used} / {snap.max}
          <span className="ml-2 text-[10px] text-white/40">
            +{snap.headroom} free
          </span>
        </span>
      </div>
      <div
        className={`h-2 w-full overflow-hidden rounded-full ${POOL_TRACK[snap.pool]}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={snap.max}
        aria-valuenow={used}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${POOL_BAR[snap.pool]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export type CapacityMeterProps = {
  player: PlayerState;
  className?: string;
  /** When true, hides the framing card and renders just the bars. */
  bare?: boolean;
};

export default function CapacityMeter({
  player,
  className,
  bare = false,
}: CapacityMeterProps) {
  const snaps = getCapacitySnapshots(player);
  const drain = player.runeMastery.hybridDrainStacks;

  const body = (
    <div className="space-y-4">
      {snaps.map((snap) => (
        <PoolRow key={snap.pool} snap={snap} />
      ))}
    </div>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <section
      aria-label="Rune capacity pools"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
          Capacity
        </div>
        {drain > 0 ? (
          <div
            className="text-[10px] uppercase tracking-[0.18em] text-rose-300/80"
            title="Cross-school installs permanently tighten capacity ceilings."
          >
            Hybrid Drain x{drain}
          </div>
        ) : null}
      </div>
      {body}
      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Blood backs Bio, Frame backs Mecha, Resonance backs Pure. Cross-path installs tax every pool and erode maxima.
      </p>
    </section>
  );
}
