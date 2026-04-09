"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import { getClosestUpgrade } from "@/features/upgrades/upgradeSelectors";
import { getSettlementFlavorLine } from "@/features/lore/settlementFlavorData";
import { getActiveSettlementPressure } from "@/features/lore/pressureVoiceData";
import MissionOriginBadge from "@/components/missions/MissionOriginBadge";
import type { MissionOriginTagId } from "@/features/game/gameTypes";

type SettlementLoreOverlayProps = {
  /** Origin tag of the completed mission (if available). */
  originTag?: MissionOriginTagId;
  /** Timestamp seed for deterministic flavor line selection. */
  resolvedAt?: number;
};

const SEVERITY_STYLES = {
  warning: "border-amber-400/25 bg-amber-500/8",
  critical: "border-red-400/25 bg-red-500/8",
};

export default function SettlementLoreOverlay({
  originTag,
  resolvedAt,
}: SettlementLoreOverlayProps) {
  const { state } = useGame();
  const closest = getClosestUpgrade(state);
  const pressure = getActiveSettlementPressure({
    alignment: state.player.factionAlignment,
    condition: state.player.condition,
    hunger: state.player.hunger,
    runInstability: state.player.runInstability,
  });

  const flavorLine = originTag
    ? getSettlementFlavorLine(originTag, resolvedAt)
    : null;

  return (
    <div className="space-y-3">
      {/* A) Origin flavor section */}
      {originTag && flavorLine ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2">
            <MissionOriginBadge originTagId={originTag} />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              Settlement report
            </span>
          </div>
          <p className="mt-2 text-xs italic leading-relaxed text-white/55">
            &ldquo;{flavorLine}&rdquo;
          </p>
        </div>
      ) : null}

      {/* C) Condition cost callout (path-voiced) */}
      {pressure ? (
        <div
          className={`rounded-xl border px-4 py-3 ${SEVERITY_STYLES[pressure.severity]}`}
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
            {pressure.severity === "critical" ? "Critical pressure" : "Pressure warning"}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-white/70">
            {pressure.voice.line}
          </p>
        </div>
      ) : null}

      {/* B) Upgrade nudge (return hook) */}
      {closest ? (
        <Link
          href={closest.ready ? closest.href : "/upgrades"}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/18 hover:bg-white/[0.05]"
        >
          <div className="min-w-0 flex-1">
            {closest.ready ? (
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300/80">
                Upgrade ready
              </div>
            ) : (
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                Next upgrade
              </div>
            )}
            <div className="mt-0.5 text-xs font-semibold text-white/80">
              {closest.ready
                ? `${closest.title} — claim now`
                : `${closest.gap}`}
            </div>
          </div>

          {/* Progress bar or ready indicator */}
          <div className="flex shrink-0 items-center gap-2">
            {closest.ready ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-[width]"
                    style={{ width: `${closest.progressPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold tabular-nums text-white/50">
                  {closest.progressPct}%
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : null}
    </div>
  );
}
