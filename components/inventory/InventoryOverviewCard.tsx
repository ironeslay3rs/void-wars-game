"use client";

import { useGame } from "@/features/game/gameContext";
import { formatAffiliationLabel } from "@/lib/format";

function getFactionAccent(faction: string) {
  if (faction === "bio") {
    return {
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      glow: "shadow-[0_0_35px_rgba(16,185,129,0.14)]",
      ring: "border-emerald-500/20",
    };
  }

  if (faction === "mecha") {
    return {
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      glow: "shadow-[0_0_35px_rgba(34,211,238,0.14)]",
      ring: "border-cyan-500/20",
    };
  }

  if (faction === "spirit") {
    return {
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      glow: "shadow-[0_0_35px_rgba(168,85,247,0.14)]",
      ring: "border-violet-500/20",
    };
  }

  return {
    chip: "border-white/15 bg-white/5 text-white/90",
    glow: "shadow-[0_0_28px_rgba(255,255,255,0.05)]",
    ring: "border-white/15",
  };
}

export default function InventoryOverviewCard() {
  const { state } = useGame();
  const { player } = state;

  const factionAccent = getFactionAccent(player.factionAlignment);

  const totalStoredItems =
    player.resources.ironOre +
    player.resources.scrapAlloy +
    player.resources.runeDust +
    player.resources.emberCore +
    player.resources.bioSamples;

  const capacityUsed = totalStoredItems;
  const capacityMax = 120;
  const capacityPercent = Math.max(
    0,
    Math.min(100, (capacityUsed / capacityMax) * 100),
  );

  return (
    <div
      className={[
        "rounded-[24px] border bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.96))] p-5",
        factionAccent.ring,
        factionAccent.glow,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
            Active Storage Profile
          </div>
          <div className="mt-3 text-2xl font-black uppercase tracking-[0.05em] text-white">
            Inventory Grid
          </div>
          <div className="mt-2 text-sm text-white/65">
            Resource-aware storage scaffold for Void Wars: Oblivion.
          </div>
        </div>

        <div
          className={[
            "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
            factionAccent.chip,
          ].join(" ")}
        >
          {formatAffiliationLabel(player.factionAlignment)}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Capacity Load
          </div>
          <div className="text-sm font-bold text-white/85">
            {capacityUsed} / {capacityMax}
          </div>
        </div>

        <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-emerald-300"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>

        <div className="mt-3 text-sm text-white/60">
          This prototype currently counts tracked materials as stored inventory units.
        </div>
      </div>
    </div>
  );
}