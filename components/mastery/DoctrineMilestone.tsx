import type { PathType } from "@/features/game/gameTypes";
import type { DoctrineMilestone as DoctrineMilestoneType } from "@/features/mastery/doctrineData";

const PATH_ACCENT: Record<PathType, { border: string; bg: string; text: string }> = {
  bio: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/8",
    text: "text-emerald-200/80",
  },
  mecha: {
    border: "border-slate-400/30",
    bg: "bg-slate-400/8",
    text: "text-slate-200/80",
  },
  pure: {
    border: "border-amber-400/30",
    bg: "bg-amber-400/8",
    text: "text-amber-200/80",
  },
};

type DoctrineMilestoneCardProps = {
  milestone: DoctrineMilestoneType;
  school: PathType;
  /** True if the player has reached this depth. */
  unlocked: boolean;
  /** True if this is the next milestone to unlock. */
  isNext: boolean;
};

export default function DoctrineMilestoneCard({
  milestone,
  school,
  unlocked,
  isNext,
}: DoctrineMilestoneCardProps) {
  const accent = PATH_ACCENT[school];
  const isCanonGap = milestone.truth.includes("unnamed in the canon");

  if (!unlocked && !isNext) {
    // Locked — show only depth number and title (teaser)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3 opacity-50">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-xs font-black tabular-nums text-white/30">
          {isCanonGap ? "?" : milestone.depth}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white/30">
            {isCanonGap ? `Flame ${milestone.depth} — Unrevealed` : milestone.title}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/20">
            Depth {milestone.depth} · {isCanonGap ? "Not yet named" : "Sealed"}
          </div>
        </div>
      </div>
    );
  }

  if (isNext && !unlocked) {
    // Next to unlock — show title + hint, dim the teaching
    return (
      <div
        className={`rounded-xl border ${accent.border} ${accent.bg} px-4 py-4`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.border} bg-black/30 text-xs font-black tabular-nums ${accent.text}`}
          >
            {milestone.depth}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Next doctrine · Depth {milestone.depth}
            </div>
            <div className="mt-1 text-sm font-semibold text-white/80">
              {milestone.title}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs italic text-white/35">
          &ldquo;{milestone.truth}&rdquo;
        </p>
        <p className="mt-2 text-[10px] text-white/30">
          {milestone.mechanicHint}
        </p>
      </div>
    );
  }

  // Unlocked — full doctrine display
  return (
    <div
      className={`rounded-xl border ${accent.border} ${accent.bg} px-4 py-4`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.border} bg-black/30 text-xs font-black tabular-nums ${accent.text}`}
        >
          {isCanonGap ? "?" : milestone.depth}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accent.text}`}>
            Depth {milestone.depth}{isCanonGap ? " · Unrevealed" : ""}
          </div>
          <div className="mt-1 text-base font-bold text-white">
            {milestone.title}
          </div>
        </div>
      </div>

      {isCanonGap ? (
        <p className="mt-3 border-l-2 border-dashed border-white/10 pl-3 text-sm italic leading-relaxed text-white/40">
          This flame&apos;s name has not yet been revealed. Its doctrine waits in the forge.
        </p>
      ) : (
        <p className="mt-3 border-l-2 border-white/15 pl-3 text-sm italic leading-relaxed text-white/75">
          &ldquo;{milestone.truth}&rdquo;
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-white/55">
        {milestone.teaching}
      </p>

      <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-white/30">
        {milestone.mechanicHint}
      </p>
    </div>
  );
}
