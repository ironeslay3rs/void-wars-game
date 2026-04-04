"use client";

import Link from "next/link";
import type { ResourceKey } from "@/features/game/gameTypes";
import type { ExtractionSummary as ExtractionSummaryType } from "@/features/field/extractionLogic";

function rarityForResource(key: ResourceKey): "common" | "rare" | "epic" {
  if (key === "emberCore" || key === "ironHeart") return "epic";
  if (key === "runeDust" || key === "scrapAlloy" || key === "bioSamples") return "rare";
  return "common";
}

const rarityClass: Record<"common" | "rare" | "epic", string> = {
  common: "border-white/20 bg-white/10 text-white/90",
  rare: "border-cyan-300/40 bg-cyan-500/15 text-cyan-100",
  epic: "border-fuchsia-300/45 bg-fuchsia-500/15 text-fuchsia-100",
};

export default function ExtractionSummary({
  summary,
}: {
  summary: ExtractionSummaryType;
}) {
  const lootRows = Object.entries(summary.lootCollected).filter(([, amount]) => (amount ?? 0) > 0);

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-[min(760px,96vw)] rounded-2xl border border-white/15 bg-black/85 p-5 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/70">
          Extraction Complete
        </div>
        <h2 className="mt-1 text-2xl font-black">{summary.zoneName}</h2>

        <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
            Kills <span className="font-black">{summary.kills}</span>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
            XP Earned <span className="font-black">+{summary.xpEarned}</span>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
            Condition Spent <span className="font-black">-{summary.conditionSpent}</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-black/40 p-3">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">
            Loot Collected
          </div>
          {lootRows.length === 0 ? (
            <p className="mt-2 text-sm text-white/55">No loot secured.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {lootRows.map(([key, amount]) => {
                const rarity = rarityForResource(key as ResourceKey);
                return (
                  <span
                    key={key}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${rarityClass[rarity]}`}
                  >
                    {key} x{amount}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-violet-200/80">
          Void infusion rises with extraction load — heavy kills, wear, and cargo all count.
          Check Status for the full infusion readout (instability index).
        </p>

        <div className="mt-5">
          <Link
            href="/home"
            className="inline-flex rounded-lg border border-cyan-300/45 bg-cyan-500/18 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 hover:border-cyan-200/65 hover:bg-cyan-500/25"
          >
            Return to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

