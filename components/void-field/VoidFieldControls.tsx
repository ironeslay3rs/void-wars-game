"use client";

import Image from "next/image";
import { assets } from "@/lib/assets";

export default function VoidFieldControls({
  connected,
  isRunning,
  shellPracticeActive,
  onAttack,
  autoStrikeEngaged,
  autoStrikeActive,
  onAutoStrikeToggle,
}: {
  connected: boolean;
  isRunning: boolean;
  /** Realtime mobs empty — shell stand-ins; strikes work locally without hunt/WS. */
  shellPracticeActive: boolean;
  onAttack: () => void;
  /** User has Auto armed (may idle if hunt/link drops). */
  autoStrikeEngaged: boolean;
  /** Auto interval is actually running. */
  autoStrikeActive: boolean;
  onAutoStrikeToggle: () => void;
}) {
  const canUse = (connected && isRunning) || shellPracticeActive;

  return (
    <div className="relative z-30 flex shrink-0 items-center justify-center gap-2 border-t border-white/15 bg-black/75 px-3 py-3 backdrop-blur-md md:gap-3 md:px-6">
      <button
        type="button"
        onClick={onAttack}
        disabled={!canUse}
        title={
          canUse
            ? shellPracticeActive && !(connected && isRunning)
              ? "Strike shell mobs in range — local practice (Space)"
              : "Strike target in range, else nearest mob (Space)"
            : "No mobs in range or field unavailable"
        }
        className={[
          "flex min-h-[48px] min-w-[88px] items-center justify-center gap-2 rounded-xl border px-3 py-2 md:min-w-[108px]",
          canUse
            ? "border-cyan-400/45 bg-cyan-500/20 text-cyan-50 hover:border-cyan-300/55 hover:bg-cyan-500/28"
            : "cursor-not-allowed border-white/10 bg-black/30 text-white/35",
        ].join(" ")}
      >
        <Image
          src={assets.icons.emberSlash}
          alt=""
          width={26}
          height={26}
          className={
            canUse
              ? "opacity-95 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
              : "opacity-35"
          }
        />
        <span className="text-sm font-black uppercase tracking-[0.12em]">
          Attack
        </span>
      </button>
      <button
        type="button"
        onClick={onAutoStrikeToggle}
        title={
          autoStrikeActive
            ? "Auto strike on — click to stop"
            : autoStrikeEngaged
              ? "Auto armed — starts when hunt and link are active"
              : canUse
                ? "Auto strike — repeats strikes while a mob is in range"
                : "Toggle auto (arms for next hunt when field is idle)"
        }
        aria-pressed={autoStrikeEngaged}
        className={[
          "min-h-[48px] min-w-[72px] rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]",
          autoStrikeActive
            ? "border-amber-400/55 bg-amber-500/25 text-amber-50 shadow-[0_0_14px_rgba(251,191,36,0.25)]"
            : autoStrikeEngaged
              ? "border-amber-400/35 bg-amber-950/40 text-amber-200/70 hover:border-amber-400/50"
              : canUse
                ? "border-white/20 bg-white/5 text-white/75 hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-50"
                : "border-white/10 bg-black/25 text-white/40 hover:border-white/20 hover:text-white/55",
        ].join(" ")}
      >
        Auto
      </button>
      <button
        type="button"
        disabled
        title="Placeholder — not wired in M1"
        className="min-h-[48px] min-w-[88px] cursor-not-allowed rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/30"
      >
        Spore lash
      </button>
      <button
        type="button"
        disabled
        title="Placeholder — not wired in M1"
        className="min-h-[48px] min-w-[88px] cursor-not-allowed rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/30"
      >
        Veil step
      </button>
      <p className="ml-auto hidden max-w-[220px] text-[10px] leading-4 text-white/45 lg:block">
        AFK timer still pays out. Field actions adjust contribution only.
      </p>
    </div>
  );
}
