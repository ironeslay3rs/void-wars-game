"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  countKeepsakes,
  getKeepsakeRewardMultiplier,
  KEEPSAKE_MAX_COUNT,
} from "@/features/broker-dialogue/humanityKeepsake";

/**
 * Home HUD chip surfacing the Humanity Theme.
 *
 * Canon quote from Humanity Theme.md:
 *   "People become stronger not only through personal effort,
 *    but through the sacrifices made for them by others."
 *
 * Renders a compact "Known by N / 10" counter when the player holds at
 * least one Keepsake. Hidden when N = 0 (no need for empty-state copy
 * on the command deck — the card appears the moment it means something).
 */
export default function HumanityKnownChip() {
  const { state } = useGame();
  const count = countKeepsakes(state.player.brokerKeepsakes);
  if (count === 0) return null;
  const bonusPct = Math.round(
    (getKeepsakeRewardMultiplier(state.player.brokerKeepsakes) - 1) * 100,
  );

  return (
    <Link
      href="/bazaar/black-market"
      className="block rounded-xl border border-amber-400/30 bg-amber-950/30 px-4 py-3 transition hover:border-amber-300/50 hover:bg-amber-900/35"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
            Humanity Keepsakes
          </div>
          <div className="mt-1 text-sm font-bold text-amber-100">
            Known by {count} of {KEEPSAKE_MAX_COUNT} brokers
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-amber-100 tabular-nums">
            +{bonusPct}%
          </div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-amber-200/60">
            mission rewards
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] italic leading-snug text-amber-100/60">
        &ldquo;Strength through the sacrifices made for them by others.&rdquo;
      </p>
    </Link>
  );
}
