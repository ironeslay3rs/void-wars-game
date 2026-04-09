"use client";

import type { PathType } from "@/features/game/gameTypes";
import { brokerOffers } from "@/features/lore/puppyOnboardingData";

const ACCENT_MAP: Record<PathType, { border: string; selected: string; text: string }> = {
  bio: {
    border: "border-emerald-400/20 hover:border-emerald-300/40",
    selected: "border-emerald-400/50 shadow-[0_0_32px_rgba(52,211,153,0.22)]",
    text: "text-emerald-200",
  },
  mecha: {
    border: "border-cyan-400/20 hover:border-cyan-300/40",
    selected: "border-cyan-400/50 shadow-[0_0_32px_rgba(34,211,238,0.22)]",
    text: "text-cyan-200",
  },
  pure: {
    border: "border-amber-400/20 hover:border-amber-300/40",
    selected: "border-amber-400/50 shadow-[0_0_32px_rgba(251,191,36,0.22)]",
    text: "text-amber-200",
  },
};

export default function SchoolSelector({
  value,
  onChange,
}: {
  value: PathType | null;
  onChange: (next: PathType) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
        Step 2 — The Deal
      </div>
      <p className="text-xs text-white/50">
        Three brokers. Three stalls. Each one has something that shouldn&apos;t be
        for sale. Pick the one your gut says yes to — that&apos;s the only honest
        signal in this place.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {brokerOffers.map((offer) => {
          const active = value === offer.school;
          const accent = ACCENT_MAP[offer.school];
          return (
            <button
              key={offer.school}
              type="button"
              onClick={() => onChange(offer.school)}
              className={[
                "rounded-2xl border bg-black/30 p-5 text-left transition",
                active ? accent.selected : accent.border,
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={[
                    "text-base font-black uppercase tracking-[0.06em]",
                    accent.text,
                  ].join(" ")}
                >
                  {offer.offerTitle}
                </div>
              </div>

              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                {offer.brokerName} · {offer.stallLocation}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-white/65">
                {offer.offerFlavor}
              </p>

              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  The broker says
                </div>
                <p className="mt-1 text-[11px] italic leading-relaxed text-white/55">
                  {offer.brokerLine}
                </p>
              </div>

              <p className="mt-3 text-[10px] leading-snug text-white/35">
                {offer.consequenceHint}
              </p>

              {active ? (
                <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                  This is the deal
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
