"use client";

/**
 * DailyHuntPanel — home-HUD card surfacing today's rotated hunt.
 * Presentational only. Consumes a `DailyHunt` from features/daily/huntRotation.
 *
 * Canon copy: Pure (NEVER "Spirit"). Loot theme "void_pure" renders as Pure.
 */

import type { DailyHunt, DailyHuntDifficulty } from "@/features/daily/huntRotation";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

const DIFFICULTY_LABEL: Record<DailyHuntDifficulty, string> = {
  standard: "Standard",
  elite: "Elite",
  apex: "Apex",
};

const DIFFICULTY_CHIP: Record<DailyHuntDifficulty, string> = {
  standard: "border-white/20 bg-white/5 text-white/75",
  elite: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  apex: "border-rose-400/40 bg-rose-500/14 text-rose-100",
};

const THEME_LABEL: Record<VoidZoneLootTheme, string> = {
  ash_mecha: "Ash · Mecha",
  bio_rot: "Bio · Rot",
  void_pure: "Void · Pure",
};

const THEME_TINT: Record<VoidZoneLootTheme, string> = {
  ash_mecha: "border-cyan-400/25 text-cyan-200/85",
  bio_rot: "border-emerald-400/25 text-emerald-200/85",
  void_pure: "border-amber-400/25 text-amber-200/85",
};

const DIFFICULTY_INTRO: Record<DailyHuntDifficulty, string> = {
  standard:
    "Rotation holds. Clear the quota, bank the baseline — any operative can walk this one.",
  elite:
    "Contract risk rated Elite. Expect denser swarms and tighter pace for a leaner share.",
  apex:
    "Apex hunt. The zone is in flare and the pay scales with it — bring a prepared loadout.",
};

export type DailyHuntPanelProps = {
  hunt: DailyHunt;
  /** Optional callback: host wires this to navigation / dispatch. */
  onEnterHunt?: (huntId: string) => void;
  className?: string;
};

export default function DailyHuntPanel({
  hunt,
  onEnterHunt,
  className,
}: DailyHuntPanelProps) {
  const diffLabel = DIFFICULTY_LABEL[hunt.difficulty];
  const diffChip = DIFFICULTY_CHIP[hunt.difficulty];
  const themeLabel = THEME_LABEL[hunt.lootTheme];
  const themeTint = THEME_TINT[hunt.lootTheme];
  const intro = DIFFICULTY_INTRO[hunt.difficulty];
  const multiplierText = `x${hunt.rewardMultiplier.toFixed(2)}`;
  const huntId = `${hunt.dateKey}:${hunt.zoneId}`;

  return (
    <section
      aria-label={`Daily hunt · ${hunt.zoneLabel} · ${diffLabel}`}
      className={`rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Daily hunt · {hunt.dateKey}
          </div>
          <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
            {hunt.zoneLabel}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${diffChip}`}
          aria-label={`Difficulty ${diffLabel}`}
        >
          {diffLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${themeTint}`}
        >
          {themeLabel}
        </span>
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
          Quota {hunt.clearQuota}
        </span>
        <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-100/90">
          Payout {multiplierText}
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/60">{intro}</p>

      {hunt.featuredMobs.length > 0 ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Featured quarry
          </div>
          <ul
            className="mt-1.5 flex flex-wrap gap-1.5"
            aria-label="Featured mobs for today's hunt"
          >
            {hunt.featuredMobs.map((mob) => (
              <li
                key={mob.id}
                className="rounded-md border border-white/12 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-white/75"
              >
                {mob.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {onEnterHunt ? (
        <button
          type="button"
          onClick={() => onEnterHunt(huntId)}
          className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.06] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/25 hover:bg-white/[0.09] active:scale-[0.98]"
        >
          Enter hunt
        </button>
      ) : null}
    </section>
  );
}
