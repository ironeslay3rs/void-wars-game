"use client";

/**
 * ActiveBlessingsHud — compact strip of picked blessings for the run.
 * Shows per-blessing chips and a stacked-effect summary line. Pure
 * presentational; reads a BlessingSummary + the active entries.
 *
 * Canon copy: "Pure" (never "Spirit"); empire label via blessingStyles.
 */
import type {
  ActiveBlessing,
  BlessingSummary,
} from "@/features/incursion/blessingTypes";
import {
  FUSION_ACCENT,
  FUSION_PAIR_LABEL,
  SCHOOL_ACCENT,
  SCHOOL_SHORT_LABEL,
} from "./blessingStyles";
import { effectLines } from "./blessingFormat";

export type ActiveBlessingsHudProps = {
  entries: readonly ActiveBlessing[];
  summary: BlessingSummary;
  /** Optional chip click — e.g. pop a BlessingDetailCard popover. */
  onEntryClick?: (blessingId: string) => void;
};

export default function ActiveBlessingsHud({
  entries,
  summary,
  onEntryClick,
}: ActiveBlessingsHudProps) {
  const stacked = effectLines(summary.totals);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/45">
        No blessings claimed this run.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Active Blessings
        </div>
        <div className="text-[10px] tabular-nums text-white/45">
          {summary.count} stacked
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {entries.map((entry, i) => {
          const accent =
            entry.kind === "fusion"
              ? FUSION_ACCENT
              : SCHOOL_ACCENT[entry.blessing.school];
          const tag =
            entry.kind === "fusion"
              ? FUSION_PAIR_LABEL[entry.blessing.pair]
              : SCHOOL_SHORT_LABEL[entry.blessing.school];
          const b = entry.blessing;
          const chip = (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${accent.chip}`}
            >
              <span className="opacity-60">{tag}</span>
              <span className="text-white">{b.name}</span>
            </span>
          );
          return onEntryClick ? (
            <button
              key={`${b.id}-${i}`}
              type="button"
              onClick={() => onEntryClick(b.id)}
              className="transition hover:opacity-90"
            >
              {chip}
            </button>
          ) : (
            <span key={`${b.id}-${i}`}>{chip}</span>
          );
        })}
      </div>

      {stacked.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/70">
          {stacked.map((line) => (
            <span key={line} className="font-semibold">
              {line}
            </span>
          ))}
        </div>
      ) : null}

      {(summary.corruptionPaid > 0 ||
        summary.conditionPaid > 0 ||
        summary.capacityStress.blood > 0 ||
        summary.capacityStress.frame > 0 ||
        summary.capacityStress.resonance > 0) && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-rose-200/80">
          {summary.corruptionPaid > 0 ? (
            <span>+{summary.corruptionPaid} Corruption</span>
          ) : null}
          {summary.conditionPaid > 0 ? (
            <span>-{summary.conditionPaid} Condition</span>
          ) : null}
          {summary.capacityStress.blood > 0 ? (
            <span>+{summary.capacityStress.blood} Blood</span>
          ) : null}
          {summary.capacityStress.frame > 0 ? (
            <span>+{summary.capacityStress.frame} Frame</span>
          ) : null}
          {summary.capacityStress.resonance > 0 ? (
            <span>+{summary.capacityStress.resonance} Resonance</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
