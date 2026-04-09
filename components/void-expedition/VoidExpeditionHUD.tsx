"use client";

import type { ReactNode } from "react";
import CharacterPortraitImage from "@/components/character/CharacterPortraitImage";
import type { CharacterPortraitId } from "@/features/characters/characterPortraits";
import {
  type ExpeditionReadiness,
  formatExpeditionReadinessBand,
} from "@/features/expedition/expeditionReadiness";
import type { VoidZone } from "@/features/void-maps/zoneData";
import { lootThemeToRuneSchool } from "@/features/mastery/masteryGameplayEffects";

function pathLabelFromLootTheme(theme: VoidZone["lootTheme"]) {
  const path = lootThemeToRuneSchool(theme);
  return path === "bio" ? "Bio" : path === "mecha" ? "Mecha" : "Pure";
}

export default function VoidExpeditionHUD({
  selectedZone,
  dropBiasLabel,
  isUnlocked,
  isRecommended,
  mastery,
  nextLockLine,
  deployDisabled,
  deployLabel,
  deployHint,
  onDeploy,
  playerName,
  characterPortraitId,
  expeditionReadiness = null,
  expeditionStabilityBonusDelta = 3,
}: {
  selectedZone: VoidZone;
  dropBiasLabel: string;
  isUnlocked: boolean;
  isRecommended: boolean;
  mastery: number;
  nextLockLine: string;
  deployDisabled: boolean;
  deployLabel?: string;
  deployHint: ReactNode;
  onDeploy: () => void;
  playerName: string;
  characterPortraitId: CharacterPortraitId;
  expeditionReadiness?: ExpeditionReadiness | null;
  /** Shown when band is ready — matches `EXPEDITION_READY_STABILITY_DELTA`. */
  expeditionStabilityBonusDelta?: number;
}) {
  const bandStyles = expeditionReadiness
    ? expeditionReadiness.readinessBand === "ready"
      ? "border-emerald-400/35 bg-emerald-950/35 text-emerald-50/95"
      : expeditionReadiness.readinessBand === "strained"
        ? "border-cyan-400/30 bg-cyan-950/30 text-cyan-50/90"
        : expeditionReadiness.readinessBand === "risky"
          ? "border-amber-400/35 bg-amber-950/35 text-amber-50/92"
          : "border-rose-400/40 bg-rose-950/40 text-rose-50/92"
    : "";

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 border-t border-white/15 bg-black/80 px-4 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3 md:mb-4 md:pb-3.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-cyan-400/25 bg-black/55 shadow-[0_0_16px_rgba(34,211,238,0.12)] md:h-14 md:w-14">
              <CharacterPortraitImage
                portraitId={characterPortraitId}
                className="h-full w-full"
                sizes="56px"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/45">
                Operative
              </div>
              <div className="truncate text-sm font-bold text-white md:text-base">
                {playerName}
              </div>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">
            Selected realm
          </div>
          <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
            {selectedZone.label}
          </h2>
          <p className="mt-2 text-sm text-white/60">{selectedZone.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/80">
              Threat level {selectedZone.threatLevel} ·{" "}
              {selectedZone.threatBand.toUpperCase()}
            </span>
            <span
              className={[
                "rounded-full border px-2.5 py-1 font-semibold",
                isUnlocked
                  ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100"
                  : "border-white/15 bg-white/5 text-white/50",
              ].join(" ")}
            >
              {isUnlocked ? "Unlocked" : "Locked"}
            </span>
            <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-white/70">
              Mastery {mastery}
            </span>
            <span
              className={[
                "rounded-full border px-2.5 py-1 font-semibold",
                isRecommended
                  ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                  : "border-red-400/35 bg-red-500/12 text-red-100",
              ].join(" ")}
            >
              {isRecommended ? "Recommended" : "High risk"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/55">
              Drop bias: {dropBiasLabel}
            </span>
          </div>
          {selectedZone.category === "special" ? (
            <p className="mt-2 text-xs font-semibold text-fuchsia-200/90">
              Boss zone
            </p>
          ) : null}
          {(selectedZone.minRuneDepth !== undefined ||
            selectedZone.minExecutionalTier !== undefined) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedZone.minRuneDepth !== undefined ? (
                <span className="rounded-full border border-violet-400/35 bg-violet-950/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100/90">
                  Mastery · deepest depth {selectedZone.minRuneDepth}+
                </span>
              ) : null}
              {selectedZone.minExecutionalTier !== undefined ? (
                <span className="rounded-full border border-emerald-400/35 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/90">
                  {`Executional tier ${selectedZone.minExecutionalTier}+ (${pathLabelFromLootTheme(selectedZone.lootTheme)} path)`}
                </span>
              ) : null}
            </div>
          )}
          <p className="mt-2 text-xs text-white/45">{nextLockLine}</p>

          {expeditionReadiness ? (
            <div
              className={[
                "mt-3 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed shadow-md backdrop-blur-sm",
                bandStyles,
              ].join(" ")}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                  Expedition readiness
                </span>
                <span className="text-[10px] font-black tabular-nums text-white/90">
                  {expeditionReadiness.readinessScore}/100 ·{" "}
                  {formatExpeditionReadinessBand(expeditionReadiness.readinessBand)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-fuchsia-500/75 transition-[width]"
                  style={{
                    width: `${Math.max(0, Math.min(100, expeditionReadiness.readinessScore))}%`,
                  }}
                />
              </div>
              {expeditionReadiness.readinessBand === "ready" ? (
                <p className="mt-2 text-[10px] font-semibold text-emerald-100/88">
                  Ledger is tight — first hunt closeout trims {expeditionStabilityBonusDelta}{" "}
                  wear if you hold this posture into deploy.
                </p>
              ) : null}
              {expeditionReadiness.primaryWarning ? (
                <p className="mt-2 text-[11px] font-semibold text-white/88">
                  {expeditionReadiness.primaryWarning}
                </p>
              ) : null}
              {expeditionReadiness.suggestedFix ? (
                <p className="mt-1 text-[10px] text-white/65">
                  {expeditionReadiness.suggestedFix}
                </p>
              ) : null}
              <p className="mt-2 border-t border-white/10 pt-2 text-[9px] uppercase tracking-[0.12em] text-white/40">
                Deploy is never locked — the void does not care if you listen.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto md:items-end">
          <button
            type="button"
            onClick={onDeploy}
            disabled={deployDisabled}
            className={[
              "w-full rounded-xl border px-6 py-3 text-sm font-black uppercase tracking-[0.12em] md:w-auto md:min-w-[240px]",
              deployDisabled
                ? "cursor-not-allowed border-white/10 bg-white/5 text-white/40"
                : "border-cyan-400/45 bg-cyan-500/20 text-cyan-50 hover:border-cyan-300/55 hover:bg-cyan-500/28",
            ].join(" ")}
          >
            {deployLabel ?? `Deploy into ${selectedZone.label}`}
          </button>
          {deployHint ? (
            <div className="max-w-md text-right text-xs text-amber-200/85 md:text-left">
              {deployHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
