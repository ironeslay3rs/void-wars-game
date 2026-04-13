"use client";

/**
 * BlessingDetailCard — expandable single-blessing card showing flavor,
 * effect numbers, and costs. Presentational; no dispatch.
 *
 * Canon copy: "Pure" (never "Spirit"); empire names via blessingStyles.
 */
import { useState } from "react";
import type {
  Blessing,
  FusionBlessing,
} from "@/features/incursion/blessingTypes";
import {
  FUSION_ACCENT,
  FUSION_PAIR_LABEL,
  SCHOOL_ACCENT,
  SCHOOL_EMPIRE_LABEL,
  type SchoolAccent,
} from "./blessingStyles";
import {
  costLine,
  costsFor,
  effectLines,
  rarityLabel,
} from "./blessingFormat";

export type BlessingDetailCardProps = {
  blessing: Blessing | FusionBlessing;
  /** Start expanded (default: true). */
  defaultExpanded?: boolean;
  /** Optional click-through for the CTA button; omits the button if absent. */
  onChoose?: (blessingId: string) => void;
  /** CTA label. Defaults to "Take". */
  chooseLabel?: string;
  /** Disable the CTA button. */
  disabled?: boolean;
};

function accentFor(b: Blessing | FusionBlessing): SchoolAccent {
  return b.rarity === "fusion" ? FUSION_ACCENT : SCHOOL_ACCENT[b.school];
}

function subtitleFor(b: Blessing | FusionBlessing): string {
  return b.rarity === "fusion"
    ? `Black City — ${FUSION_PAIR_LABEL[b.pair]}`
    : SCHOOL_EMPIRE_LABEL[b.school];
}

export default function BlessingDetailCard({
  blessing,
  defaultExpanded = true,
  onChoose,
  chooseLabel = "Take",
  disabled = false,
}: BlessingDetailCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const accent = accentFor(blessing);
  const effects = effectLines(blessing.effect);
  const costs = costsFor(blessing);

  return (
    <div
      className={`rounded-2xl border p-4 ${accent.bg} ${accent.border}`}
      data-blessing-id={blessing.id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent.tint}`}
          >
            {rarityLabel(blessing)}
          </div>
          <h4 className="mt-0.5 truncate text-base font-bold text-white">
            {blessing.name}
          </h4>
          <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
            {subtitleFor(blessing)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 hover:bg-white/10"
          aria-expanded={expanded}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      {expanded ? (
        <>
          <p className="mt-3 text-[12px] italic text-white/70">
            {blessing.flavor}
          </p>

          {effects.length > 0 ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                Effects this run
              </div>
              <ul className="mt-1 space-y-0.5 text-sm font-semibold text-white">
                {effects.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
              Cost preview
            </div>
            <ul className="mt-1 space-y-0.5 text-sm font-bold text-white">
              {costs.map((c, i) => (
                <li key={`${c.kind}-${i}`}>{costLine(c)}</li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-white/45">
              The Void takes its tax; costs persist after the run ends.
            </p>
          </div>

          {onChoose ? (
            <button
              type="button"
              onClick={() => onChoose(blessing.id)}
              disabled={disabled}
              className={`mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${accent.btn}`}
            >
              {chooseLabel}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
