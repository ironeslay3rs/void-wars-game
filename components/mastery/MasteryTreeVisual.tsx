"use client";

import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import {
  getExecutionalTier,
  MAX_MINORS_PER_SCHOOL,
  RUNE_DEPTH_MAX,
} from "@/features/mastery/runeMasteryLogic";

const LABEL: Record<RuneSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

const RAIL: Record<
  RuneSchool,
  { stroke: string; fill: string; glow: string; muted: string }
> = {
  bio: {
    stroke: "rgba(52,211,153,0.55)",
    fill: "rgba(16,185,129,0.9)",
    glow: "rgba(52,211,153,0.35)",
    muted: "rgba(255,255,255,0.12)",
  },
  mecha: {
    stroke: "rgba(251,191,36,0.55)",
    fill: "rgba(245,158,11,0.9)",
    glow: "rgba(251,191,36,0.32)",
    muted: "rgba(255,255,255,0.12)",
  },
  pure: {
    stroke: "rgba(167,139,250,0.55)",
    fill: "rgba(139,92,246,0.9)",
    glow: "rgba(167,139,250,0.35)",
    muted: "rgba(255,255,255,0.12)",
  },
};

function SchoolRail({
  school,
  depth,
  tier,
  minors,
  isPrimary,
  canInstall,
  onInstall,
}: {
  school: RuneSchool;
  depth: number;
  tier: 0 | 1 | 2;
  minors: number;
  isPrimary: boolean;
  canInstall: boolean;
  onInstall: (school: RuneSchool) => void;
}) {
  const rail = RAIL[school];
  const levels = Array.from({ length: RUNE_DEPTH_MAX }, (_, i) => RUNE_DEPTH_MAX - i);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        className={[
          "mb-2 text-center text-[10px] font-black uppercase tracking-[0.18em]",
          isPrimary ? "text-white/95" : "text-white/60",
        ].join(" ")}
      >
        {LABEL[school]}
        {isPrimary ? (
          <span className="ml-1 text-[8px] font-bold text-cyan-200/80">
            (primary)
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-col items-center py-1">
        <div
          className="absolute bottom-2 top-2 w-px bg-gradient-to-b from-white/25 via-white/10 to-white/20"
          aria-hidden
        />
        <div className="relative flex flex-col gap-[7px]">
          {levels.map((lv) => {
            const active = lv <= depth;
            const isSetUnlockRow = lv === 4 && minors >= 3 && minors < 5;
            const isDeepSetRow = lv === 6 && minors >= 5;

            return (
              <div key={lv} className="relative flex items-center justify-center">
                <div
                  title={`Depth L${lv}`}
                  className="relative z-[1] flex h-[13px] w-[13px] items-center justify-center"
                >
                  <span
                    className="block rounded-full border transition-all duration-200"
                    style={{
                      width: active ? 13 : 10,
                      height: active ? 13 : 10,
                      borderColor: active ? rail.stroke : rail.muted,
                      backgroundColor: active ? rail.fill : "rgba(0,0,0,0.4)",
                      boxShadow: active
                        ? `0 0 12px ${rail.glow}, inset 0 0 6px rgba(255,255,255,0.12)`
                        : "none",
                    }}
                  />
                </div>
                {(isSetUnlockRow || (isDeepSetRow && tier >= 2)) && active ? (
                  <span
                    className="pointer-events-none absolute -right-1 left-[calc(50%+12px)] whitespace-nowrap text-[8px] font-bold uppercase leading-none tracking-wider text-emerald-200/85"
                    title="Executional set threshold"
                  >
                    {tier >= 2 ? "L3" : "L2"}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-center text-[9px] tabular-nums text-white/45">
        L{depth} · {minors}/{MAX_MINORS_PER_SCHOOL} minors
      </div>
      {tier === 0 ? (
        <div className="mt-1 h-4 text-[8px] text-white/25"> </div>
      ) : (
        <div className="mt-1 rounded-md border border-emerald-400/30 bg-emerald-950/35 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-100/90">
          Exec {tier === 2 ? "L3" : "L2"}
        </div>
      )}

      <button
        type="button"
        disabled={!canInstall}
        onClick={() => onInstall(school)}
        className="mt-2 h-7 w-full rounded-lg border border-white/15 bg-white/5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-30"
        title={canInstall ? `Install minor rune — ${LABEL[school]}` : "No mastery points available"}
      >
        + Install
      </button>
    </div>
  );
}

export default function MasteryTreeVisual({
  runeMastery,
  primarySchool,
  masteryPoints,
  onInstallMinor,
}: {
  runeMastery: PlayerRuneMasteryState;
  primarySchool: RuneSchool | null;
  masteryPoints?: number;
  onInstallMinor?: (school: RuneSchool) => void;
}) {
  const available = masteryPoints ?? 0;

  return (
    <div
      className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-black/35 to-black/20 px-3 py-4 md:px-6"
      aria-label="Mastery tree, three schools"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
          Tri-rail tree · L1 root → L7 apex
        </div>
        {available > 0 && (
          <div className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-200">
            {available} mastery pt{available !== 1 ? "s" : ""} available
          </div>
        )}
      </div>
      <div className="flex justify-between gap-1 md:gap-4">
        {RUNE_SCHOOLS.map((school) => {
          const minors = runeMastery.minorCountBySchool[school];
          const canInstall = available > 0 && minors < MAX_MINORS_PER_SCHOOL;
          return (
            <SchoolRail
              key={school}
              school={school}
              depth={runeMastery.depthBySchool[school]}
              tier={getExecutionalTier(runeMastery, school)}
              minors={minors}
              isPrimary={primarySchool === school}
              canInstall={canInstall}
              onInstall={onInstallMinor ?? (() => {})}
            />
          );
        })}
      </div>
    </div>
  );
}
