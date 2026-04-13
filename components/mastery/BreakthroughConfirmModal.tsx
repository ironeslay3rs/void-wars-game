"use client";

/**
 * BreakthroughConfirmModal — confirmation wall for promoting rune depth
 * across L1→L2, L2→L3, L3→L4. Presentational only. Consumes
 * getBreakthroughRequirement + canAttemptBreakthrough from
 * features/mastery/breakthroughLogic. Fires `onConfirm(school, fromDepth)`.
 *
 * Canon copy: Pure (NEVER "Spirit"). Apex icons come from resourceIconMap.
 */

import Image from "next/image";
import { useCallback } from "react";
import type { PlayerState } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import {
  BREAKTHROUGH_BASE_SUCCESS_PCT,
  canAttemptBreakthrough,
  getApexMaterialForSchool,
  getBreakthroughRequirement,
} from "@/features/mastery/breakthroughLogic";
import { resourceIconMap } from "@/features/game/resourceIconMap";

const SCHOOL_LABEL: Record<RuneSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

const SCHOOL_ACCENT: Record<
  RuneSchool,
  { border: string; bg: string; btn: string }
> = {
  bio: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/95",
    btn: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30",
  },
  mecha: {
    border: "border-cyan-400/40",
    bg: "bg-slate-950/95",
    btn: "border-cyan-400/40 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30",
  },
  pure: {
    border: "border-amber-400/40",
    bg: "bg-amber-950/95",
    btn: "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30",
  },
};

const APEX_LABEL: Record<string, string> = {
  bloodvein: "Bloodvein",
  ironHeart: "Ironheart",
  ashveil: "Ashveil",
};

export type BreakthroughConfirmModalProps = {
  player: PlayerState;
  school: RuneSchool;
  /** Depth the player is promoting FROM. Must be one of the walls (2,4,6). */
  fromDepth: number;
  onConfirm: (school: RuneSchool, fromDepth: number) => void;
  onClose: () => void;
};

export default function BreakthroughConfirmModal({
  player,
  school,
  fromDepth,
  onConfirm,
  onClose,
}: BreakthroughConfirmModalProps) {
  const accent = SCHOOL_ACCENT[school];
  const req = getBreakthroughRequirement(school, fromDepth);
  const gate = canAttemptBreakthrough(player, school, fromDepth);
  const apexKey = getApexMaterialForSchool(school);
  const apexHeld = player.resources[apexKey] ?? 0;
  const apexIcon = resourceIconMap[apexKey];
  const targetDepth = fromDepth + 1;

  const handleConfirm = useCallback(() => {
    if (!gate.ok) return;
    onConfirm(school, fromDepth);
  }, [gate.ok, onConfirm, school, fromDepth]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${SCHOOL_LABEL[school]} breakthrough confirmation`}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md rounded-t-2xl border p-5 sm:rounded-2xl ${accent.bg} ${accent.border}`}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Sevenfold Wall
        </div>
        <h3 className="mt-1 text-lg font-bold text-white">
          {SCHOOL_LABEL[school]} Breakthrough
        </h3>
        <p className="mt-1 text-xs text-white/55">
          Promote depth {fromDepth} → {targetDepth}
        </p>

        {req ? (
          <div className="mt-4 space-y-3">
            {/* Apex cost */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
              <Image
                src={apexIcon}
                alt={APEX_LABEL[apexKey] ?? apexKey}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg border border-white/15 bg-black/40 p-1"
              />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Apex Cost
                </div>
                <div className="text-sm font-bold text-white">
                  {req.apexAmount} × {APEX_LABEL[apexKey] ?? apexKey}
                </div>
                <div
                  className={`text-[11px] tabular-nums ${
                    apexHeld >= req.apexAmount
                      ? "text-white/50"
                      : "text-rose-300"
                  }`}
                >
                  Held: {apexHeld}
                </div>
              </div>
            </div>

            {/* Capacity headroom */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                Capacity Headroom
              </div>
              <div className="mt-0.5 text-sm font-bold text-white">
                {req.capacityHeadroomNeeded} on {SCHOOL_LABEL[school]} pool
              </div>
              <p className="mt-1 text-[11px] text-white/45">
                The body must have room to grow before the wall yields.
              </p>
            </div>

            {/* Odds */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-baseline justify-between">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Base Success
                </div>
                <div className="text-sm font-bold tabular-nums text-white">
                  {BREAKTHROUGH_BASE_SUCCESS_PCT}%
                </div>
              </div>
              <p className="mt-1 text-[11px] text-white/45">
                On failure, half of the apex is still consumed (minimum 1).
              </p>
            </div>

            {!gate.ok ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-400/30 bg-rose-950/40 p-3 text-[12px] text-rose-200"
              >
                {gate.reason}
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
                disabled={!gate.ok}
                className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${accent.btn}`}
              >
                Attempt
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-[12px] text-white/60">
              No breakthrough wall at this depth.
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-[48px] w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition ${accent.btn}`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
