"use client";

import Link from "next/link";
import { useEffect } from "react";
import { playSound } from "@/features/audio/soundEngine";
import { useGame } from "@/features/game/gameContext";

/**
 * Death overlay — shown when the player's condition reaches 0 on the
 * void field. Dispatches APPLY_DEATH_PENALTY on mount (10% resource
 * loss + condition reset to 20%), plays the death sound, then shows
 * a forced retreat link to the Black Market.
 *
 * Design: death is NOT permanent. The penalty makes combat have STAKES
 * — you lose real resources when you fall. Recovery happens in the
 * Feast Hall or via time-based survival ticks.
 */
export default function DeathOverlay({
  playerName,
}: {
  playerName: string;
}) {
  const { dispatch } = useGame();

  useEffect(() => {
    playSound("death");
    // Apply the resource penalty + condition reset immediately on death.
    dispatch({ type: "APPLY_DEATH_PENALTY" });
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="mx-4 flex max-w-md flex-col items-center gap-6 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400/90">
          Condition Critical
        </div>
        <h1 className="text-4xl font-black uppercase tracking-[0.06em] text-red-100 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] md:text-5xl">
          You Fell
        </h1>
        <p className="text-sm leading-relaxed text-white/70">
          {playerName}&apos;s body gave out. The void doesn&apos;t negotiate
          with the broken — it just takes what you were carrying and waits
          for the next operative.
        </p>
        <div className="rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-xs text-red-200/80">
          Penalty applied: 10% of carried resources lost to the void.
          Condition restored to 20%.
        </div>
        <Link
          href="/bazaar/black-market"
          className="mt-2 rounded-xl border border-amber-300/50 bg-amber-500/20 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-amber-50 transition hover:bg-amber-500/30"
        >
          Retreat to Black Market
        </Link>
        <p className="text-[10px] text-white/40">
          Recover in the Feast Hall, then return stronger.
        </p>
      </div>
    </div>
  );
}
