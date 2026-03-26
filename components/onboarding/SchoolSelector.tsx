"use client";

import type { PathType } from "@/features/game/gameTypes";

const SCHOOL_CARDS: Array<{
  id: PathType;
  title: string;
  quote: string;
  preview: string;
  accent: string;
  border: string;
}> = [
  {
    id: "bio",
    title: "Bio",
    quote: "Verdant Coil doctrine: adapt, endure, consume what the war leaves behind.",
    preview: "+Biotech salvage, rations-first survival loop.",
    accent: "text-emerald-200",
    border: "border-emerald-400/25 hover:border-emerald-300/45",
  },
  {
    id: "mecha",
    title: "Mecha",
    quote: "Chrome Synod doctrine: rebuild, reinforce, impose structure on chaos.",
    preview: "+Refining utility, alloy discipline, pressure control.",
    accent: "text-cyan-200",
    border: "border-cyan-400/25 hover:border-cyan-300/45",
  },
  {
    id: "pure",
    title: "Pure",
    quote: "Ember Vault doctrine: attune, refine, burn away weakness under oath.",
    preview: "+Rune depth spine, ember rites, stable pressure cadence.",
    accent: "text-fuchsia-200",
    border: "border-fuchsia-400/25 hover:border-fuchsia-300/45",
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
        Step 2 — Choose school lean
      </div>
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
                card.border,
                active ? "shadow-[0_0_28px_rgba(217,70,239,0.25)]" : "",
              ].join(" ")}
            >
              <div className={["text-lg font-black uppercase tracking-[0.06em]", card.accent].join(" ")}>
                {card.title}
              </div>
              <div className="mt-2 text-xs leading-relaxed text-white/70">
                {card.quote}
              </div>
              <div className="mt-3 text-[11px] font-semibold text-white/60">
                {card.preview}
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

