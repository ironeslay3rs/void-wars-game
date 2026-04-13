"use client";

/**
 * RuneSlotDisplay — renders the six minor-rune slots per school and their
 * lock/available/filled status. Presentational only. Consumes
 * `getAllRuneSlots(player)` from features/mastery/runeSlots.
 *
 * Canon copy: Pure (NEVER "Spirit"). Aria-labels mirror visible copy.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import type {
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import {
  getRuneSlotsForSchool,
  type RuneSlotInfo,
} from "@/features/mastery/runeSlots";

const SCHOOL_LABEL: Record<RuneSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

const SCHOOL_TINT: Record<RuneSchool, string> = {
  bio: "border-emerald-400/30 text-emerald-200",
  mecha: "border-cyan-400/30 text-cyan-200",
  pure: "border-amber-400/30 text-amber-200",
};

const SCHOOL_FILL: Record<RuneSchool, string> = {
  bio: "bg-emerald-500/80 border-emerald-300/60",
  mecha: "bg-cyan-500/80 border-cyan-300/60",
  pure: "bg-amber-500/80 border-amber-300/60",
};

function slotAriaLabel(slot: RuneSlotInfo, schoolLabel: string): string {
  const idx = slot.index + 1;
  if (slot.status === "filled") {
    return `${schoolLabel} minor slot ${idx}: filled`;
  }
  if (slot.status === "available") {
    return `${schoolLabel} minor slot ${idx}: available`;
  }
  return `${schoolLabel} minor slot ${idx}: locked, unlocks at rank ${slot.unlocksAtRank}`;
}

function SlotPip({
  slot,
  school,
}: {
  slot: RuneSlotInfo;
  school: RuneSchool;
}) {
  const label = slotAriaLabel(slot, SCHOOL_LABEL[school]);
  if (slot.status === "filled") {
    return (
      <span
        aria-label={label}
        title={label}
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${SCHOOL_FILL[school]}`}
      />
    );
  }
  if (slot.status === "available") {
    return (
      <span
        aria-label={label}
        title={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/5"
      />
    );
  }
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-bold tabular-nums text-white/40"
    >
      {slot.unlocksAtRank}
    </span>
  );
}

export type RuneSlotDisplayProps = {
  player: PlayerState;
  /** Optional: restrict to a single school. Otherwise renders all three. */
  school?: RuneSchool;
  className?: string;
};

export default function RuneSlotDisplay({
  player,
  school,
  className,
}: RuneSlotDisplayProps) {
  const schools = school ? [school] : RUNE_SCHOOLS;
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
          Minor Rune Slots
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Rank {player.rankLevel}
        </div>
      </div>
      <div className="space-y-3">
        {schools.map((s) => {
          const slots = getRuneSlotsForSchool(
            player.runeMastery,
            s,
            player.rankLevel,
          );
          const filled = slots.filter((x) => x.status === "filled").length;
          const available = slots.filter(
            (x) => x.status === "available",
          ).length;
          return (
            <div
              key={s}
              className={`rounded-xl border bg-black/20 p-3 ${SCHOOL_TINT[s]}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.14em]">
                  {SCHOOL_LABEL[s]}
                </span>
                <span className="text-[10px] tabular-nums text-white/50">
                  {filled} filled / {available} open
                </span>
              </div>
              <div
                className="flex items-center gap-2"
                role="list"
                aria-label={`${SCHOOL_LABEL[s]} rune slots`}
              >
                {slots.map((slot) => (
                  <div key={slot.index} role="listitem">
                    <SlotPip slot={slot} school={s} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Numbered pips are locked — the digit is the rank level at which they open. Solid pips are installed minors.
      </p>
    </div>
  );
}
