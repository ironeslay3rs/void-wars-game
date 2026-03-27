"use client";

import type { PathType } from "@/features/game/gameTypes";

const SCHOOL_CARDS: Array<{
  id: PathType;
  title: string;
  tagline: string;
  doctrine: string;
  loop: string;
  starter: string;
  accent: string;
  border: string;
  selectedRing: string;
}> = [
  {
    id: "bio",
    title: "Bio",
    tagline: "Verdant Coil",
    doctrine: "We are what survives. The body is the weapon and the crucible.",
    loop: "Scan → hunt → absorb → mutate → evolve.",
    starter: "+Bio samples · +Moss rations · +Biotech salvage bias",
    accent: "text-emerald-200",
    border: "border-emerald-400/20 hover:border-emerald-300/40",
    selectedRing: "border-emerald-400/50 shadow-[0_0_32px_rgba(52,211,153,0.22)]",
  },
  {
    id: "mecha",
    title: "Mecha",
    tagline: "Chrome Synod",
    doctrine: "Perfection is property — and we own it. Structure defeats chaos.",
    loop: "Salvage → refine → forge → upgrade → deploy.",
    starter: "+Iron ore · +Scrap alloy · +Crafting material bias",
    accent: "text-cyan-200",
    border: "border-cyan-400/20 hover:border-cyan-300/40",
    selectedRing: "border-cyan-400/50 shadow-[0_0_32px_rgba(34,211,238,0.22)]",
  },
  {
    id: "pure",
    title: "Pure",
    tagline: "Ember Vault",
    doctrine: "Fire remembers. The soul path is the longest — and the deepest.",
    loop: "Attune → resonate → burn → refine → transcend.",
    starter: "+Rune dust · +Ember core · +Rune depth spine bias",
    accent: "text-fuchsia-200",
    border: "border-fuchsia-400/20 hover:border-fuchsia-300/40",
    selectedRing: "border-fuchsia-400/50 shadow-[0_0_32px_rgba(217,70,239,0.22)]",
  },
];

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
        Step 2 — Choose school
      </div>
      <p className="text-xs text-white/50">
        This sets your primary path, starter resources, and loop flavor. You
        can explore other schools later — this is your entry point.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {SCHOOL_CARDS.map((card) => {
          const active = value === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onChange(card.id)}
              className={[
                "rounded-2xl border bg-black/30 p-5 text-left transition",
                active ? card.selectedRing : card.border,
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div
                  className={[
                    "text-lg font-black uppercase tracking-[0.06em]",
                    card.accent,
                  ].join(" ")}
                >
                  {card.title}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {card.tagline}
                </div>
              </div>

              <p className="mt-3 text-xs italic leading-relaxed text-white/65">
                &ldquo;{card.doctrine}&rdquo;
              </p>

              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Loop
                </div>
                <div className="mt-1 text-[11px] text-white/70">{card.loop}</div>
              </div>

              <div className="mt-3 text-[11px] text-white/55">
                {card.starter}
              </div>

              {active ? (
                <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                  Selected
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
