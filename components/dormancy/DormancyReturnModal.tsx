"use client";

/**
 * DormancyReturnModal — welcome-back confirmation shown on re-entry when
 * the player's new tier is ≥ Strained. Summarizes the condition and
 * corruption delta absorbed while offline, the pending recovery cost,
 * and asks the player to confirm applying the reintegration payment.
 *
 * Pattern mirrors `components/events/EventClaimModal.tsx` for shape.
 *
 * Canon: tier names verbatim from lore-canon/CLAUDE.md Offline Lifecycle.
 * Pure, never "Spirit".
 *
 * Presentational only — host owns dispatch. Callers pass a
 * DormancyProjection they already computed (with their own `now: Date`).
 */

import {
  DORMANCY_LABEL,
  type DormancyTier,
} from "@/features/dormancy/dormancyTiers";
import type { DormancyProjection } from "@/features/dormancy/dormancyRecovery";

const TIER_CHIP: Record<DormancyTier, string> = {
  stable: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
  strained: "border-amber-400/40 bg-amber-500/14 text-amber-100",
  dormant: "border-rose-400/45 bg-rose-500/15 text-rose-100",
  displaced: "border-fuchsia-400/55 bg-fuchsia-500/18 text-fuchsia-100",
};

const TIER_HEADLINE: Record<DormancyTier, string> = {
  stable: "You return unmarked.",
  strained: "You return strained.",
  dormant: "You return dormant.",
  displaced: "You return displaced.",
};

const TIER_BODY: Record<DormancyTier, string> = {
  stable:
    "The vessel is intact. No reintegration is required.",
  strained:
    "The Void noticed your absence. A shallow bite — but a bite.",
  dormant:
    "You drifted past the grace window. Body and soul have been negotiating in your absence, and the terms were not in your favor.",
  displaced:
    "You are not where you left yourself. Reintegration is possible, but it will cost, and it will not be quick.",
};

function formatHours(h: number): string {
  if (h < 1) return `${Math.max(0, Math.round(h * 60))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  const days = h / 24;
  return `${days.toFixed(1)}d`;
}

export type DormancyReturnModalProps = {
  open: boolean;
  /** Null hides the modal (nothing to confirm). */
  projection: DormancyProjection | null;
  /** Optional: current credits. If provided, gates the Confirm CTA. */
  credits?: number;
  /** Fires when player accepts the reintegration payment. */
  onConfirm?: (projection: DormancyProjection) => void;
  /** Fires on backdrop/cancel. */
  onDismiss?: () => void;
};

export default function DormancyReturnModal({
  open,
  projection,
  credits,
  onConfirm,
  onDismiss,
}: DormancyReturnModalProps) {
  if (!open || !projection) return null;
  const { newTier } = projection;
  // Only show for ≥ Strained per spec — fallback safety.
  if (newTier === "stable") return null;

  const cost = projection.pendingRecoveryCost;
  const insufficient = typeof credits === "number" && credits < cost;
  const canConfirm = typeof onConfirm === "function" && !insufficient;
  const rewardShavePct = Math.round((1 - projection.rewardPenaltyMult) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Dormancy return — ${DORMANCY_LABEL[newTier]}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(14,16,26,0.98),rgba(7,9,15,0.99))] p-5 text-white shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              Welcome back
            </div>
            <div className="mt-0.5 text-base font-black uppercase tracking-[0.06em] text-white">
              {TIER_HEADLINE[newTier]}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${TIER_CHIP[newTier]}`}
          >
            {DORMANCY_LABEL[newTier]}
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-white/60">
          {TIER_BODY[newTier]}
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Offline drift
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
            Away {formatHours(projection.elapsedHours)}
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-white/80">
            <li className="flex justify-between gap-3">
              <span>Condition</span>
              <span className="tabular-nums font-semibold text-rose-200/90">
                {projection.conditionDelta === 0
                  ? "—"
                  : `${projection.conditionDelta.toFixed(1)}`}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Corruption</span>
              <span className="tabular-nums font-semibold text-fuchsia-200/90">
                {projection.corruptionDelta === 0
                  ? "—"
                  : `+${projection.corruptionDelta.toFixed(1)}`}
              </span>
            </li>
            {rewardShavePct > 0 ? (
              <li className="flex justify-between gap-3">
                <span>Reward shave</span>
                <span className="tabular-nums font-semibold text-amber-200/90">
                  -{rewardShavePct}%
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Reintegration cost
          </div>
          <div className="mt-1 text-sm font-black tabular-nums text-white">
            {cost > 0 ? `${cost} cr` : "Free"}
          </div>
          {insufficient ? (
            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-rose-300/85">
              Need {cost - (credits ?? 0)} more credits to stabilize now
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-xl border border-white/12 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] active:scale-[0.98]"
          >
            Defer
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(projection)}
            disabled={!canConfirm}
            className="flex-1 rounded-xl border border-white/25 bg-white/[0.12] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/40 hover:bg-white/[0.18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stabilize
          </button>
        </div>
      </div>
    </div>
  );
}
