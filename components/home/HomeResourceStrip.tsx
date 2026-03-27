"use client";

import Image from "next/image";
import { useGame } from "@/features/game/gameContext";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import type { ResourceKey } from "@/features/game/gameTypes";

const PRIMARY: Array<{ key: ResourceKey; label: string }> = [
  { key: "credits", label: "Credits" },
  { key: "runeDust", label: "Void Crystals" },
  { key: "bioSamples", label: "Bio Essence" },
];

const SECONDARY: Array<{ key: ResourceKey; label: string }> = [
  { key: "ironOre", label: "Iron Ore" },
  { key: "scrapAlloy", label: "Scrap Alloy" },
  { key: "emberCore", label: "Ember Core" },
  { key: "mossRations", label: "Rations" },
];

function ResourceChip({ label, value, resourceKey }: { label: string; value: number; resourceKey: ResourceKey }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/30 p-0.5">
        <Image
          src={getResourceIcon(resourceKey)}
          alt={label}
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-[10px]">
          {label}
        </div>
        <div className="text-xs font-black tabular-nums text-white sm:text-sm">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function HomeResourceStrip() {
  const { state } = useGame();
  const r = state.player.resources;

  return (
    <div className="flex items-stretch rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(8,12,20,0.96),rgba(12,16,26,0.94))] shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-white/30 [writing-mode:vertical-rl] flex items-center">
        Resources
      </div>

      <div className="h-px w-px self-stretch bg-white/8" />

      {/* Primary resources — always visible */}
      <div className="flex flex-1 divide-x divide-white/8">
        {PRIMARY.map((res) => (
          <ResourceChip key={res.key} label={res.label} value={r[res.key]} resourceKey={res.key} />
        ))}
      </div>

      {/* Secondary resources — hidden on small screens */}
      <div className="hidden divide-x divide-white/8 sm:flex">
        {SECONDARY.map((res) => (
          <ResourceChip key={res.key} label={res.label} value={r[res.key]} resourceKey={res.key} />
        ))}
      </div>
    </div>
  );
}
