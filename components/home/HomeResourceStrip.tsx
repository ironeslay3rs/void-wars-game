"use client";

import Image from "next/image";
import { useGame } from "@/features/game/gameContext";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import type { ResourceKey } from "@/features/game/gameTypes";

const homeResources: Array<{ key: ResourceKey; label: string }> = [
  { key: "credits", label: "Credits" },
  { key: "bioSamples", label: "Bio Samples" },
  { key: "runeDust", label: "Rune Dust" },
  { key: "emberCore", label: "Ember Core" },
];

export default function HomeResourceStrip() {
  const { state } = useGame();

  return (
    <section className="rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(10,18,30,0.88),rgba(6,10,18,0.94))] px-4 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        <div className="pr-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
          Field Stock
        </div>

        {homeResources.map((resource) => (
          <div
            key={resource.key}
            className="flex min-w-[132px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-1.5">
              <Image
                src={getResourceIcon(resource.key)}
                alt={resource.label}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                {resource.label}
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {state.player.resources[resource.key]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
