"use client";

/**
 * EngageConfirmModal — final confirmation wall before a Hollowfang attempt.
 *
 * Mirrors the layout pattern of components/mastery/BreakthroughConfirmModal:
 * apex accent, risk summary, disabled-when-blocked CTA. Presentational only —
 * props in, `onConfirm` / `onClose` callbacks out.
 */

import { useCallback } from "react";
import type { PrepCheck } from "@/features/hollowfang/prepRequirements";

export type EngageConfirmModalProps = {
  prep: PrepCheck;
  /** 0..1 readiness score — rendered as 0–100. */
  readiness: number;
  /** Expected outcome hint — "victory" | "partial" | "wipe". */
  previewTier: "victory" | "partial" | "wipe";
  /** Expected condition cost range (UI hint only). */
  expectedConditionCost?: number;
  /** Expected corruption gain range (UI hint only). */
  expectedCorruptionGain?: number;
  onConfirm: () => void;
  onClose: () => void;
};

const TIER_TONE: Record<
  EngageConfirmModalProps["previewTier"],
  { label: string; border: string; bg: string; btn: string; copy: string }
> = {
  victory: {
    label: "Likely Victory",
    border: "border-emerald-500/45",
    bg: "bg-emerald-950/95",
    btn: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30",
    copy: "Prep is solid. Readable tells, disciplined burst windows — expect a clean clear.",
  },
  partial: {
    label: "Risk · Partial",
    border: "border-amber-400/45",
    bg: "bg-amber-950/95",
    btn: "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30",
    copy: "The pit will take a piece. Condition tax elevated; only a partial bag if you break phase 1.",
  },
  wipe: {
    label: "Warning · Wipe Likely",
    border: "border-rose-500/50",
    bg: "bg-rose-950/95",
    btn: "border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30",
    copy: "Hollowfang will eat the attempt. Expect full corruption tax and severe condition damage.",
  },
};

export default function EngageConfirmModal({
  prep,
  readiness,
  previewTier,
  expectedConditionCost,
  expectedCorruptionGain,
  onConfirm,
  onClose,
}: EngageConfirmModalProps) {
  const tone = TIER_TONE[previewTier];
  const pct = Math.max(0, Math.min(100, Math.round(readiness * 100)));
  const blocked = !prep.ok;

  const handleConfirm = useCallback(() => {
    if (blocked) return;
    onConfirm();
  }, [blocked, onConfirm]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Engage Hollowfang confirmation"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md rounded-t-2xl border p-5 sm:rounded-2xl ${tone.bg} ${tone.border}`}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Prestige Engagement
        </div>
        <h3 className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white">
          Engage Hollowfang
        </h3>
        <p className="mt-1 text-xs text-white/60">{tone.label}</p>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-baseline justify-between">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                Readiness
              </div>
              <div className="text-sm font-bold tabular-nums text-white">
                {pct} / 100
              </div>
            </div>
            <p className="mt-1 text-[11px] text-white/55">{tone.copy}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-rose-400/25 bg-rose-500/8 p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-rose-200/80">
                Condition Cost
              </div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-white">
                {expectedConditionCost !== undefined
                  ? `~${expectedConditionCost}`
                  : "—"}
              </div>
              <p className="mt-1 text-[10px] text-white/50">
                Flesh pays for misreads.
              </p>
            </div>
            <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/8 p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-fuchsia-200/80">
                Corruption Gain
              </div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-white">
                {expectedCorruptionGain !== undefined
                  ? `+${expectedCorruptionGain}`
                  : "—"}
              </div>
              <p className="mt-1 text-[10px] text-white/50">
                The Void marks the attempt.
              </p>
            </div>
          </div>

          {blocked ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-400/35 bg-rose-950/50 p-3 text-[12px] text-rose-100"
            >
              {prep.blockers.length} prep gate
              {prep.blockers.length === 1 ? "" : "s"} still blocking. Resolve
              before engaging.
            </div>
          ) : null}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={blocked}
              className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${tone.btn}`}
            >
              Engage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
