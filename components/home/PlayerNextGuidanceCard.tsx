"use client";

import Link from "next/link";
import type { PlayerNextGuidance } from "@/features/guidance/playerNextGuidance";

type Props = {
  guidance: PlayerNextGuidance;
  breakthroughBanner?: { headline: string; detail: string } | null;
};

const urgencyRing: Record<
  PlayerNextGuidance["urgency"],
  { border: string; chip: string; glow: string }
> = {
  high: {
    border: "border-amber-400/45",
    chip: "border-amber-300/40 bg-amber-500/15 text-amber-100",
    glow: "shadow-[0_0_28px_rgba(251,191,36,0.12)]",
  },
  medium: {
    border: "border-cyan-400/35",
    chip: "border-cyan-300/35 bg-cyan-500/12 text-cyan-100",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.08)]",
  },
  low: {
    border: "border-white/12",
    chip: "border-white/15 bg-white/5 text-white/75",
    glow: "",
  },
};

export default function PlayerNextGuidanceCard({
  guidance,
  breakthroughBanner = null,
}: Props) {
  const ring = urgencyRing[guidance.urgency];

  return (
    <section
      className={`rounded-[24px] border bg-[linear-gradient(165deg,rgba(22,18,32,0.92),rgba(8,8,14,0.96))] p-4 backdrop-blur-md sm:p-5 ${ring.border} ${ring.glow}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/40">
          Current doctrine · Next breakthrough
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${ring.chip}`}
        >
          {guidance.urgency} priority
        </span>
      </div>

      {breakthroughBanner ? (
        <div className="mt-3 rounded-xl border border-amber-200/35 bg-amber-500/10 px-3 py-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-50">
            {breakthroughBanner.headline}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-100/88">
            {breakthroughBanner.detail}
          </p>
        </div>
      ) : null}

      <h2 className="mt-3 text-base font-bold leading-snug text-white sm:text-lg">
        {guidance.headline}
      </h2>

      <p className="mt-2 text-[13px] leading-relaxed text-white/70">
        {guidance.reason}
      </p>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200/55">
          What to do next
        </div>
        <p className="mt-1 text-sm font-semibold text-white/90">
          {guidance.recommendedActionLabel}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/55">
          {guidance.rewardPreview}
        </p>
      </div>

      <Link
        href={guidance.recommendedRoute}
        className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/20 bg-gradient-to-r from-cyan-600/25 to-violet-600/25 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/35 hover:from-cyan-500/30 hover:to-violet-500/30"
      >
        {guidance.recommendedActionLabel} →
      </Link>
    </section>
  );
}
