"use client";

/**
 * RuneSetBonusIndicator — per-school chip row showing rune-set activation
 * status (inactive / 2-set / 3-set) and the flat reward bonus each active
 * set contributes. Presentational only; consumes
 * `detectPlayerRuneSets(player)` from features/mastery/setDetection.
 *
 * Canon copy: Pure (NEVER "Spirit"). School tokens use apex icons from
 * resourceIconMap (bio→bloodvein, mecha→ironHeart, pure→ashveil).
 */

import Image from "next/image";
import type { PlayerState } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import {
  detectPlayerRuneSets,
  type RuneSetActivation,
} from "@/features/mastery/setDetection";
import { resourceIconMap } from "@/features/game/resourceIconMap";

const SCHOOL_LABEL: Record<RuneSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

const SCHOOL_ICON: Record<RuneSchool, string> = {
  bio: resourceIconMap.bloodvein,
  mecha: resourceIconMap.ironHeart,
  pure: resourceIconMap.ashveil,
};

const SCHOOL_TINT: Record<
  RuneSchool,
  { active: string; inactive: string; pill: string }
> = {
  bio: {
    active: "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
    inactive: "border-white/10 bg-white/[0.02] text-white/40",
    pill: "bg-emerald-500/25 text-emerald-100",
  },
  mecha: {
    active: "border-cyan-400/50 bg-cyan-500/10 text-cyan-100",
    inactive: "border-white/10 bg-white/[0.02] text-white/40",
    pill: "bg-cyan-500/25 text-cyan-100",
  },
  pure: {
    active: "border-amber-400/50 bg-amber-500/10 text-amber-100",
    inactive: "border-white/10 bg-white/[0.02] text-white/40",
    pill: "bg-amber-500/25 text-amber-100",
  },
};

function tierLabel(tier: 2 | 3): string {
  return tier === 3 ? "3-set" : "2-set";
}

function chipAriaLabel(
  school: RuneSchool,
  activation: RuneSetActivation | null,
): string {
  const name = SCHOOL_LABEL[school];
  if (!activation) return `${name} rune set: inactive`;
  return `${name} rune set: ${tierLabel(activation.tier)} active, +${activation.rewardBonusPct}% reward bonus`;
}

function SchoolChip({
  school,
  activation,
}: {
  school: RuneSchool;
  activation: RuneSetActivation | null;
}) {
  const tint = SCHOOL_TINT[school];
  const active = activation !== null;
  const label = chipAriaLabel(school, activation);
  return (
    <div
      role="listitem"
      aria-label={label}
      title={label}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${active ? tint.active : tint.inactive}`}
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/30 ${active ? "" : "opacity-50 grayscale"}`}
      >
        <Image
          src={SCHOOL_ICON[school]}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
        />
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.14em]">
        {SCHOOL_LABEL[school]}
      </span>
      {active ? (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${tint.pill}`}
        >
          {tierLabel(activation!.tier)} +{activation!.rewardBonusPct}%
        </span>
      ) : (
        <span className="ml-1 text-[10px] uppercase tracking-[0.14em] text-white/35">
          Inactive
        </span>
      )}
    </div>
  );
}

export type RuneSetBonusIndicatorProps = {
  player: PlayerState;
  className?: string;
  /** When true, hides the framing card and renders just the chips. */
  bare?: boolean;
};

export default function RuneSetBonusIndicator({
  player,
  className,
  bare = false,
}: RuneSetBonusIndicatorProps) {
  const activations = detectPlayerRuneSets(player);
  const bySchool: Record<RuneSchool, RuneSetActivation | null> = {
    bio: null,
    mecha: null,
    pure: null,
  };
  for (const act of activations) bySchool[act.school] = act;
  const activeCount = activations.length;

  const body = (
    <div
      role="list"
      aria-label="Rune set bonuses per school"
      className="flex flex-wrap gap-2"
    >
      {RUNE_SCHOOLS.map((s) => (
        <SchoolChip key={s} school={s} activation={bySchool[s]} />
      ))}
    </div>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <section
      aria-label="Rune set bonuses"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
          Set Bonuses
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          {activeCount} active
        </div>
      </div>
      {body}
      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Install 2 minors in a school for a 2-set (+2% mission reward). 3 minors promote to a 3-set (+4%). Bonuses stack across Bio, Mecha, and Pure, capped at +12%.
      </p>
    </section>
  );
}
