"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/features/audio/soundEngine";
import { useGame } from "@/features/game/gameContext";

const RANK_NAMES: Record<number, string> = {
  1: "Puppy",
  2: "Operative",
  3: "Veteran",
  4: "Specialist",
  5: "Elite",
  6: "Commander",
  7: "Knight",
  8: "Champion",
  9: "Warden",
  10: "Legend",
};

/**
 * Global rank-up celebration banner. Watches the player's rankLevel
 * and shows a dramatic 3-second banner when it increments.
 *
 * Mount this inside GameProvider / AuthProvider so it fires on any
 * route. The banner overlays everything with a brief flash + fanfare.
 */
export default function RankUpBanner() {
  const { state } = useGame();
  const prevRankRef = useRef(state.player.rankLevel);
  const [show, setShow] = useState(false);
  const [rankInfo, setRankInfo] = useState({ level: 0, name: "" });

  useEffect(() => {
    const prev = prevRankRef.current;
    const cur = state.player.rankLevel;
    prevRankRef.current = cur;

    if (cur > prev && prev > 0) {
      const name = RANK_NAMES[cur] ?? `Rank ${cur}`;
      setRankInfo({ level: cur, name });
      setShow(true);
      playSound("rank-up");
      const t = window.setTimeout(() => setShow(false), 3500);
      return () => window.clearTimeout(t);
    }
  }, [state.player.rankLevel]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] flex items-center justify-center">
      {/* Flash overlay */}
      <div
        className="absolute inset-0 bg-amber-400/20"
        style={{
          animation: "void-field-boss-spawn-flash 1.5s ease-out forwards",
          opacity: 0.4,
        }}
      />
      {/* Banner content */}
      <div
        className="relative flex flex-col items-center gap-3 text-center"
        style={{
          animation: "void-field-boss-spawn-flash 3.5s ease-out forwards",
        }}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-300/90">
          Rank Up
        </div>
        <div className="text-5xl font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_0_40px_rgba(251,191,36,0.6)] md:text-6xl">
          {rankInfo.name}
        </div>
        <div className="rounded-full border border-amber-300/40 bg-amber-500/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-amber-100">
          Level {rankInfo.level}
        </div>
      </div>
    </div>
  );
}
