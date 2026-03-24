"use client";

import { useGame } from "@/features/game/gameContext";

export default function StatusResourcesCard() {
  const { state } = useGame();
  const { resources } = state.player;

  const resourceList = [
    { label: "Credits", value: resources.credits },
    { label: "Iron Ore", value: resources.ironOre },
    { label: "Scrap Alloy", value: resources.scrapAlloy },
    { label: "Rune Dust", value: resources.runeDust },
    { label: "Ember Core", value: resources.emberCore },
    { label: "Bio Samples", value: resources.bioSamples },
    { label: "Field Rations", value: resources.fieldRations },
  ];

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.9),rgba(8,10,16,0.95))] p-5 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">
        Resource Ledger
      </div>

      <div className="mt-4 space-y-3">
        {resourceList.map((res) => (
          <div
            key={res.label}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <span className="text-sm uppercase tracking-[0.06em] text-white/70">
              {res.label}
            </span>

            <span className="text-base font-black text-white">
              {res.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
