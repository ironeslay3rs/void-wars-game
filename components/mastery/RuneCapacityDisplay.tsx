"use client";

import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import { MAX_MINORS_PER_SCHOOL } from "@/features/mastery/runeMasteryLogic";

const SCHOOL_LABEL: Record<string, string> = {
  bio: "Bio (Blood)",
  mecha: "Mecha (Frame)",
  pure: "Pure (Resonance)",
};

const SCHOOL_COLOR: Record<string, string> = {
  bio: "bg-emerald-500/70",
  mecha: "bg-amber-500/70",
  pure: "bg-violet-500/70",
};

export default function RuneCapacityDisplay({
  runeMastery,
}: {
  runeMastery: PlayerRuneMasteryState;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-white/50">
        Rune Capacity
      </div>
      <div className="space-y-4">
        {RUNE_SCHOOLS.map((school) => {
          const installed = runeMastery.minorCountBySchool[school];
          const pct = Math.min(100, (installed / MAX_MINORS_PER_SCHOOL) * 100);
          return (
            <div key={school}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-white/70">{SCHOOL_LABEL[school]}</span>
                <span className="text-xs tabular-nums text-white/50">
                  {installed} / {MAX_MINORS_PER_SCHOOL} minors
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${SCHOOL_COLOR[school]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Each installed minor rune deepens the school rail. Reaching 3 minors unlocks Executional L2. 5 minors unlocks L3.
      </p>
    </div>
  );
}
