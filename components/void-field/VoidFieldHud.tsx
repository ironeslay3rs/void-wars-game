"use client";

import Link from "next/link";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

type ThreatBand = "low" | "medium" | "high";

export default function VoidFieldHud({
  className = "",
  zoneLabel,
  threatBand,
  threatLevel,
  huntStateLine,
  spawnWavesLine,
  playerCount,
  connected,
  contractPayoutPreview = null,
  showTimerHandoff = false,
  runComplete = false,
  feastHallLockoutChip = null,
  nextRunChip = null,
  bossChip = null,
}: {
  className?: string;
  zoneLabel: string;
  threatBand: ThreatBand;
  threatLevel: number;
  huntStateLine: string;
  spawnWavesLine: string;
  playerCount: number;
  connected: boolean;
  /** Base mission payout line while hunt timer runs; excludes final realtime math. */
  contractPayoutPreview?: string | null;
  /** When true, show copy that timer settlement leads to Hunt Result. */
  showTimerHandoff?: boolean;
  /** Hunt timer finished — reinforce handoff to payout screen. */
  runComplete?: boolean;
  /** Optional next-run handoff cue when Feast Hall recovery lockout is active. */
  feastHallLockoutChip?: string | null;
  /** Optional cue for a primed Crafting District modifier. */
  nextRunChip?: string | null;
  /** Optional cue for local-only roaming boss state (shell mode). */
  bossChip?: string | null;
}) {
  return (
    <header
      className={`pointer-events-none z-40 flex shrink-0 flex-col gap-1.5 border-b border-white/10 bg-gradient-to-b from-black/80 via-black/45 to-transparent px-3 py-3 backdrop-blur-[2px] md:flex-row md:items-start md:justify-between md:px-5 ${className}`}
    >
      <div className="pointer-events-auto min-w-0">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/65">
          Void field
        </div>
        <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-white drop-shadow md:text-2xl">
          {zoneLabel}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
          <span>
            Threat{" "}
            <span className="font-semibold text-white">{threatLevel}</span>
            <span className="text-white/50"> · </span>
            <span className="font-semibold text-white/90">
              {threatBand.toUpperCase()}
            </span>
          </span>
          <span className="hidden text-white/35 sm:inline">|</span>
          <span>
            In session:{" "}
            <span className="font-semibold text-white">
              {playerCount}{" "}
              {playerCount === 1 ? "operative" : "operatives"}
            </span>
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/85">
            {huntStateLine}
          </span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-950/40 px-2.5 py-1 text-cyan-100">
            Waves {spawnWavesLine}
          </span>
          {feastHallLockoutChip ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-950/40 px-2.5 py-1 text-amber-100">
              {feastHallLockoutChip}
            </span>
          ) : null}
          {nextRunChip ? (
            <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-950/35 px-2.5 py-1 text-fuchsia-100">
              {nextRunChip}
            </span>
          ) : null}
          {bossChip ? (
            <span className="rounded-full border border-rose-400/25 bg-rose-950/35 px-2.5 py-1 text-rose-100">
              {bossChip}
            </span>
          ) : null}
          {!connected ? (
            <span className="rounded-full border border-amber-400/35 bg-amber-950/35 px-2.5 py-1 text-amber-100">
              Linking…
            </span>
          ) : (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-950/35 px-2.5 py-1 text-emerald-100">
              Linked
            </span>
          )}
        </div>
        {contractPayoutPreview ? (
          <p className="mt-2 max-w-xl text-[11px] font-medium normal-case leading-snug tracking-normal text-emerald-100/85">
            {contractPayoutPreview}
          </p>
        ) : null}
        {runComplete ? (
          <p className="mt-2 max-w-xl text-[11px] font-semibold normal-case leading-snug text-emerald-100/95">
            Run complete — open{" "}
            <Link
              href="/bazaar/biotech-labs/result"
              className="text-cyan-200/95 underline decoration-cyan-400/40 underline-offset-2 hover:text-white"
            >
              Hunt Result
            </Link>{" "}
            for base, bonus, and final payout.
          </p>
        ) : null}
        {showTimerHandoff && !runComplete ? (
          <p className="mt-1 text-[10px] font-medium normal-case tracking-normal text-white/45">
            Timer end → full breakdown on{" "}
            <Link
              href="/bazaar/biotech-labs/result"
              className="text-cyan-200/90 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
            >
              Hunt Result
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div className="pointer-events-auto flex flex-shrink-0 flex-wrap items-center gap-2 md:justify-end md:pt-0.5">
        <Link
          href="/bazaar/biotech-labs/result"
          className="rounded-lg border border-emerald-400/25 bg-emerald-950/30 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-100/90 hover:border-emerald-300/40 hover:bg-emerald-950/45"
        >
          Hunt Result
        </Link>
        <Link
          href={VOID_EXPEDITION_PATH}
          className="rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85 hover:border-white/35 hover:bg-black/60"
        >
          Expedition
        </Link>
      </div>
    </header>
  );
}
