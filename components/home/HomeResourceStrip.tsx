"use client";

import Image from "next/image";
import { useGame } from "@/features/game/gameContext";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import type { ResourceKey } from "@/features/game/gameTypes";

const homeResources: Array<{ key: ResourceKey; label: string }> = [
  { key: "credits", label: "Credits" },
  { key: "bioSamples", label: "Bio" },
  { key: "runeDust", label: "Rune" },
  { key: "emberCore", label: "Ember" },
  { key: "scrapAlloy", label: "Alloy" },
  { key: "mossRations", label: "Rations" },
];

export default function HomeResourceStrip() {
  const { state } = useGame();

  return (
    <section className="rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(10,18,30,0.92),rgba(6,10,18,0.96))] px-3 py-2.5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.26em] text-white/38">
        Field Stock
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {homeResources.map((resource) => (
          <div
            key={resource.key}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-1">
              <Image
                src={getResourceIcon(resource.key)}
                alt={resource.label}
                width={22}
                height={22}
                className="h-[22px] w-[22px] object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/40">
                {resource.label}
              </div>
              <div className="text-sm font-bold tabular-nums text-white">
                {state.player.resources[resource.key]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
