"use client";

import { useEffect, useState } from "react";
import type { FactionAlignment } from "@/features/game/gameTypes";
import {
  getHuntNarrationBeats,
  type NarrationBeat,
} from "@/features/hunt/huntNarrationData";

const TONE_STYLES = {
  neutral: "text-white/65",
  danger: "text-amber-200/75",
  triumph: "text-cyan-100/85",
};

/**
 * Hunt narration — school-voiced combat beats during the resolution timer.
 * Cycles through narration lines to make hunts feel like fights, not loading bars.
 */
export default function HuntNarration({
  alignment,
  durationMs = 2600,
}: {
  alignment: FactionAlignment;
  /** Total resolution time to spread beats across. */
  durationMs?: number;
}) {
  const beats = getHuntNarrationBeats(alignment);
  const [currentBeat, setCurrentBeat] = useState<NarrationBeat>(beats[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (beats.length <= 1) return;

    const interval = durationMs / beats.length;
    let idx = 0;

    const tick = () => {
      idx++;
      if (idx >= beats.length) return;
      // Fade out, swap, fade in
      setFade(false);
      const swapId = window.setTimeout(() => {
        setCurrentBeat(beats[idx]);
        setFade(true);
      }, 200);

      const nextId = window.setTimeout(tick, interval);
      timers.push(swapId, nextId);
    };

    const timers: number[] = [];
    const firstId = window.setTimeout(tick, interval);
    timers.push(firstId);

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [beats, durationMs]);

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
        Encounter in progress
      </div>
      <p
        className={[
          "mt-2 text-sm leading-relaxed transition-opacity duration-200",
          TONE_STYLES[currentBeat.tone],
          fade ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {currentBeat.text}
      </p>
      {/* Subtle progress indicator */}
      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/25"
          style={{
            animation: `huntProgress ${durationMs}ms linear forwards`,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes huntProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
