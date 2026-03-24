"use client";

import { useGame } from "@/features/game/gameContext";
import { resourceData } from "@/features/resources/resourceData";

export default function StatusResourcesCard() {
  const { state } = useGame();
  const { resources } = state.player;

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.9),rgba(8,10,16,0.95))] p-5 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">
        Resource Ledger
      </div>

      <div className="mt-4 space-y-3">
        {resourceData.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <span className="text-sm uppercase tracking-[0.06em] text-white/70">
              {resource.label}
            </span>

            <span className="text-base font-black text-white">
              {resources[resource.id]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
