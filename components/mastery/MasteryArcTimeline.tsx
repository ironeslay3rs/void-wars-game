"use client";

import { masteryHr2040ArcSteps } from "@/features/mastery/masteryHr2040Arc";

export default function MasteryArcTimeline() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/75">
        Hour 20–40 · mastery spine
      </div>
      <p className="mt-1.5 text-xs text-white/50">
        Designed arc: specialization pays, hybrid tempts with lasting cap pressure, bosses
        feed phase‑2 named mats.
      </p>
      <ol className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {masteryHr2040ArcSteps.map((step, idx) => (
          <li
            key={step.id}
            className="flex min-w-[200px] snap-start flex-col rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 md:min-w-0 md:flex-1 md:basis-[140px]"
          >
            <span className="text-[9px] font-bold tabular-nums text-cyan-200/70">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[11px] font-bold text-white/90">{step.label}</span>
            <span className="mt-1 text-[10px] leading-snug text-white/45">{step.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
