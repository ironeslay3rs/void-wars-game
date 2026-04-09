import FactionPathPanel from "@/components/home/FactionPathPanel";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FactionAlignment, GameState } from "@/features/game/gameTypes";
import type { PlayerNextGuidance } from "@/features/guidance/playerNextGuidance";
import {
  getAfkExpeditionRead,
  getCultivationRead,
  getFusionContractModifiers,
  getFormationDoctrine,
} from "@/features/progression/fusionProgression";
import { getLaunchDirectives } from "@/features/progression/launchReadiness";
import {
  getDoctrineQueueGate,
} from "@/features/progression/launchDoctrine";
import { getCareerFocusHomeEffectLine } from "@/features/player/careerFocusModifiers";
import { getVoidInstabilityTierLabel } from "@/features/progression/phase3Progression";
import { VOID_INFUSION_HEADING } from "@/features/status/voidInfusionMetaphor";
import PlayerNextGuidanceCard from "@/components/home/PlayerNextGuidanceCard";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type MainMenuRightRailProps = {
  selectedPath: PathSelection | null;
  onSelectPath: (path: PathSelection) => void;
  state: GameState;
  nextGuidance: PlayerNextGuidance;
  ascensionBreakthrough: { headline: string; detail: string } | null;
};

function getConditionLabel(condition: number) {
  if (condition >= 80) return "System condition optimal.";
  if (condition >= 60) return "System condition stable.";
  if (condition >= 40) return "System condition strained.";
  return "System condition critical.";
}

export default function MainMenuRightRail({
  selectedPath,
  onSelectPath,
  state,
  nextGuidance,
  ascensionBreakthrough,
}: MainMenuRightRailProps) {
  const [now, setNow] = useState(() => Date.now());
  const condition = state.player.condition;
  const mastery = state.player.masteryProgress;
  const hasMeaningfulCondition = condition > 0 || state.player.rankLevel > 1;
  const alignment =
    state.player.factionAlignment === "unbound"
      ? "UNBOUND"
      : state.player.factionAlignment.toUpperCase();
  const cultivation = getCultivationRead(state.player);
  const afkRead = getAfkExpeditionRead(state.player, now);
  const fusionContract = getFusionContractModifiers(
    state.player,
    now,
    afkRead.queueLoad,
  );
  const doctrine = getFormationDoctrine(state.player);
  const launchDirectives = getLaunchDirectives(state.player, now);
  const doctrineQueueGate = getDoctrineQueueGate(state.player, now);
  const launchReadiness = doctrineQueueGate.readiness;
  const doctrineQueueCap = doctrineQueueGate.cap;
  const voidStrain = state.player.voidInstability;
  const voidStrainRead = getVoidInstabilityTierLabel(voidStrain);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <PlayerNextGuidanceCard
        guidance={nextGuidance}
        breakthroughBanner={ascensionBreakthrough}
      />

      <FactionPathPanel
        selectedPath={selectedPath}
        onSelectPath={onSelectPath}
      />

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,12,22,0.86),rgba(8,8,14,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Condition
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="text-[52px] font-black leading-none text-white">
            {hasMeaningfulCondition ? `${condition}%` : "—"}
          </div>

          <div className="pb-1 text-right text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Vital Monitor
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,70,70,0.9),rgba(0,220,255,0.92))]"
            style={{
              width: `${hasMeaningfulCondition ? Math.max(0, Math.min(100, condition)) : 0}%`,
            }}
          />
        </div>

        <div className="mt-3 text-sm text-white/65">
          {hasMeaningfulCondition
            ? getConditionLabel(condition)
            : "No field data yet. Deploy once to establish a live condition readout."}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              Alignment
            </div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {alignment}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              Mastery
            </div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {mastery}%
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[18px] border border-white/10 bg-black/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Career focus
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/68">
            {getCareerFocusHomeEffectLine(state.player.careerFocus)}
          </p>
        </div>

        <div className="mt-3 rounded-[18px] border border-violet-400/22 bg-violet-950/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/65">
                {VOID_INFUSION_HEADING}
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100/90">
                {voidStrainRead.label}
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/58">
                {voidStrainRead.hint}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-black tabular-nums text-white">
                {Math.round(voidStrain)}
              </div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                / 100
              </div>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/35">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600/85 to-fuchsia-500/75 transition-[width] duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, voidStrain))}%`,
              }}
            />
          </div>
          <Link
            href="/status"
            className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-violet-200 underline decoration-violet-400/45 underline-offset-2 hover:text-violet-100"
          >
            Full readout →
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,14,30,0.88),rgba(8,8,16,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-200/65">
          Fusion Directive
        </div>
        <div className="mt-1 text-xs text-white/55">
          Ascension discipline, contract cadence, and doctrine pressure tuned
          for live-launch survival operations.
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-[18px] border border-violet-300/20 bg-violet-500/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100/70">
              Cultivation Stage
            </div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {cultivation.stage.label}
            </div>
            <div className="mt-1 text-xs text-white/70">
              {cultivation.stage.doctrine}
            </div>
            <div className="mt-2 text-[11px] text-violet-100/80">
              {cultivation.nextStage
                ? `${cultivation.progressToNext}% toward ${cultivation.nextStage.label}`
                : "Top stage reached under current launch ladder"}
            </div>
          </div>

          <div className="rounded-[18px] border border-cyan-300/20 bg-cyan-500/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
              AFK Contract Read
            </div>
            <div className="mt-2 text-sm font-semibold text-white">
              {afkRead.rhythmLabel}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-cyan-50/85">
              <div className="rounded-md border border-white/10 bg-black/25 px-2 py-1">
                Idle window: {afkRead.idleMinutes}m
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 px-2 py-1">
                Queue load: {afkRead.queueLoad}/{doctrineQueueCap}
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 px-2 py-1">
                Forecast +{afkRead.estimatedCredits} credits
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 px-2 py-1">
                Forecast +{afkRead.estimatedMastery}% mastery
              </div>
            </div>
            <div className="mt-2 rounded-md border border-cyan-200/20 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-50/90">
              Live modulation: x{fusionContract.rewardMultiplier.toFixed(2)}{" "}
              payout · condition{" "}
              {fusionContract.conditionDeltaOffset > 0
                ? `+${fusionContract.conditionDeltaOffset}`
                : fusionContract.conditionDeltaOffset}
            </div>
            {!doctrineQueueGate.canQueue && doctrineQueueGate.reason ? (
              <div className="mt-2 rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1 text-[11px] text-red-100/90">
                {doctrineQueueGate.reason}
              </div>
            ) : null}
          </div>

          <div className="rounded-[18px] border border-amber-300/20 bg-amber-500/10 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100/70">
              Formation Doctrine
            </div>
            <div className="mt-2 text-xs text-white/75">{doctrine}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.86),rgba(10,10,14,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
          Launch Directive
        </div>
        <div className="mt-1 text-xs text-white/55">
          Priority actions to keep your public-release loop understandable and
          moving.
        </div>
        <div className="mt-3 rounded-[14px] border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Loop readiness
            </div>
            <div
              className={[
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                launchReadiness.status === "critical"
                  ? "border-red-300/30 bg-red-500/15 text-red-100"
                  : launchReadiness.status === "at-risk"
                    ? "border-amber-300/35 bg-amber-500/15 text-amber-100"
                    : launchReadiness.status === "stable"
                      ? "border-cyan-300/30 bg-cyan-500/15 text-cyan-100"
                      : "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
              ].join(" ")}
            >
              {launchReadiness.status}
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {launchReadiness.score}
            <span className="ml-1 text-sm text-white/55">/100</span>
          </div>
          <div className="mt-2 text-xs text-white/70">{launchReadiness.summary}</div>
          {launchReadiness.blockers.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[11px] text-white/65">
              {launchReadiness.blockers.map((blocker) => (
                <li key={blocker}>• {blocker}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-4 space-y-2.5">
          {launchDirectives.map((directive) => (
            <div
              key={`${directive.id}-${directive.label}`}
              className={[
                "rounded-[14px] border px-3 py-2.5",
                directive.tone === "critical"
                  ? "border-red-300/30 bg-red-500/10"
                  : directive.tone === "warning"
                    ? "border-amber-300/30 bg-amber-500/10"
                    : "border-emerald-300/25 bg-emerald-500/10",
              ].join(" ")}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                {directive.label}
              </div>
              <div className="mt-1 text-xs text-white/72">{directive.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
