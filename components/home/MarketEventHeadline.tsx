"use client";

import { useGame } from "@/features/game/gameContext";
import { getActiveMarketEvent } from "@/features/lore/marketEventData";

export default function MarketEventHeadline() {
  const { state } = useGame();
  const event = getActiveMarketEvent(state);

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
        Black Market
      </div>
      <p className="mt-1 text-[11px] leading-snug text-white/50">
        {event.text}
      </p>
    </div>
  );
}
