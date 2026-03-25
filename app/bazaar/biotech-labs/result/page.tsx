"use client";

import Image from "next/image";
import Link from "next/link";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getLatestBiotechSpecimen } from "@/features/biotech-labs/specimenData";
import { useGame } from "@/features/game/gameContext";
import {
  formatResourceLabel,
  getResourceLoopMeaning,
  getNonZeroResourceEntries,
} from "@/features/game/gameFeedback";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import {
  getHungerLabel,
  HUNGER_PRESSURE_THRESHOLD,
} from "@/features/status/survival";
import { buildAfkFieldRunFeedback } from "@/features/hunting-ground/afkRunFeedback";
import {
  getContributionProfessionHint,
  getContributionRole,
} from "@/features/void-maps/realtime/contributionScoring";
import { getEmergingRoleHint } from "@/features/player/playerIdentity";

function formatResolvedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function getAftermathTakeaways(params: {
  condition: number;
  hunger: number;
  hasBioSamples: boolean;
  hasCredits: boolean;
  hasRuneDust: boolean;
}) {
  const takeaways: string[] = [];

  if (params.condition < 60) {
    takeaways.push(
      "Recover now. Do not push the next sweep from a deficit.",
    );
  } else {
    takeaways.push(
      "Condition holds. You can push the next sweep.",
    );
  }

  if (params.hunger < HUNGER_PRESSURE_THRESHOLD) {
    takeaways.push(
      "Stores are low. Refeed before another hard push.",
    );
  } else {
    takeaways.push(
      "Stores are holding. The next decision is yours.",
    );
  }

  if (params.hasBioSamples || params.hasRuneDust) {
    takeaways.push(
      "Bank biomass and residue for the next recovery call.",
    );
  }

  if (params.hasCredits) {
    takeaways.push(
      "If condition is the blocker, spend credits and stabilize.",
    );
  }

  return takeaways;
}

export default function BiotechLabsResultPage() {
  const { state } = useGame();
  const latestHuntResult = state.player.lastHuntResult;
  const guidance = getFirstSessionGuidance(state);
  const specimen = getLatestBiotechSpecimen(latestHuntResult);
  const specimenBossAsset = specimen?.bossAsset ?? null;

  const resultMission = latestHuntResult
    ? (state.missions.find((m) => m.id === latestHuntResult.missionId) ?? null)
    : null;
  const isFieldContractResult =
    resultMission?.category === "hunting-ground";

  const fieldRunFeedback =
    latestHuntResult && resultMission && isFieldContractResult
      ? buildAfkFieldRunFeedback(latestHuntResult, resultMission, {
          rankLevel: state.player.rankLevel,
          masteryProgress: state.player.masteryProgress,
        })
      : null;

  const resourceEntries = getNonZeroResourceEntries(
    latestHuntResult?.resourcesGained ?? {},
  );
  const shouldRouteToFeastHall =
    guidance.nextAction === "recover" ||
    state.player.hunger < HUNGER_PRESSURE_THRESHOLD;

  const isRealtimeBonusApplied =
    latestHuntResult &&
    latestHuntResult.realtimeContributionAppliedForResolvedAt ===
      latestHuntResult.resolvedAt &&
    latestHuntResult.realtimeContributionBonusMultiplier !== null &&
    typeof latestHuntResult.realtimeContributionBonusMultiplier === "number";

  const roleTrendHint = isFieldContractResult
    ? getEmergingRoleHint(state.player.behaviorStats)
    : null;

  const baseRankXp =
    latestHuntResult?.baseRankXpGained ?? latestHuntResult?.rankXpGained ?? 0;
  const baseMastery =
    latestHuntResult?.baseMasteryProgressGained ??
    latestHuntResult?.masteryProgressGained ??
    0;
  const baseInfluence =
    latestHuntResult?.baseInfluenceGained ??
    latestHuntResult?.influenceGained ??
    0;
  const baseCredits =
    latestHuntResult?.baseResourcesGained?.credits ??
    latestHuntResult?.resourcesGained?.credits ??
    0;

  const bonusMultiplier = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeContributionBonusMultiplier ?? 0
    : 0;
  const bonusRankXp = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeRankXpBonusGained ?? 0
    : 0;
  const bonusMastery = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeMasteryProgressBonusGained ?? 0
    : 0;
  const bonusInfluence = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeInfluenceBonusGained ?? 0
    : 0;
  const bonusCredits = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeResourcesBonusGained?.credits ?? 0
    : 0;

  const realtimeBonusResourceEntries = isRealtimeBonusApplied
    ? getNonZeroResourceEntries(
        latestHuntResult?.realtimeResourcesBonusGained ?? {},
      )
    : [];

  const finalRankXp = latestHuntResult?.rankXpGained ?? baseRankXp;
  const finalMastery = latestHuntResult?.masteryProgressGained ?? baseMastery;
  const finalInfluence = latestHuntResult?.influenceGained ?? baseInfluence;
  const finalCredits = latestHuntResult?.resourcesGained?.credits ?? baseCredits;

  const realtimeTotalDamageDealt = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeTotalDamageDealt ?? 0
    : 0;
  const realtimeTotalHitsLanded = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeTotalHitsLanded ?? 0
    : 0;
  const realtimeMobsContributedTo = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeMobsContributedTo ?? 0
    : 0;
  const realtimeMobsKilled = isRealtimeBonusApplied
    ? latestHuntResult!.realtimeMobsKilled ?? 0
    : 0;

  const contributionRole = !isFieldContractResult || !isRealtimeBonusApplied
    ? null
    : getContributionRole({
        totalDamage: realtimeTotalDamageDealt,
        totalHits: realtimeTotalHitsLanded,
        mobsContributedTo: realtimeMobsContributedTo,
        mobsKilled: realtimeMobsKilled,
      });

  const contributionProfessionHint = !isFieldContractResult || !isRealtimeBonusApplied
    ? null
    : getContributionProfessionHint({
        totalDamage: realtimeTotalDamageDealt,
        totalHits: realtimeTotalHitsLanded,
        mobsContributedTo: realtimeMobsContributedTo,
        mobsKilled: realtimeMobsKilled,
      });

  let nextStepHref = shouldRouteToFeastHall
    ? "/bazaar/black-market/feast-hall"
    : "/home";
  let nextStepLabel = shouldRouteToFeastHall
    ? "Open Feast Hall and Stabilize"
    : "Return Home and Explore";

  let secondaryFieldStep: { href: string; label: string } | null = null;

  if (isFieldContractResult) {
    if (shouldRouteToFeastHall) {
      nextStepHref = "/bazaar/black-market/feast-hall";
      nextStepLabel = "Open Feast Hall and Stabilize";
      secondaryFieldStep = {
        href: "/bazaar/mercenary-guild",
        label: "Return to Hunting Ground",
      };
    } else {
      nextStepHref = "/bazaar/mercenary-guild";
      nextStepLabel = "Return to Hunting Ground";
      secondaryFieldStep = {
        href: "/home",
        label: "Command Deck (Home)",
      };
    }
  }

  const hungerLabel = getHungerLabel(state.player.hunger);
  const aftermathTakeaways = latestHuntResult
    ? getAftermathTakeaways({
        condition: state.player.condition,
        hunger: state.player.hunger,
        hasBioSamples:
          (latestHuntResult.resourcesGained.bioSamples ?? 0) > 0,
        hasCredits: (latestHuntResult.resourcesGained.credits ?? 0) > 0,
        hasRuneDust: (latestHuntResult.resourcesGained.runeDust ?? 0) > 0,
      })
    : [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-emerald-300/40" />

        <ScreenHeader
          eyebrow={
            isFieldContractResult
              ? "Field Ops / Hunt Result"
              : "Biotech Labs / Hunt Result"
          }
          title={
            isFieldContractResult ? "Contract Payout" : "Specimen Hunt Result"
          }
          subtitle={
            isFieldContractResult
              ? fieldRunFeedback
                ? `${fieldRunFeedback.contractStrideLabel} · ${fieldRunFeedback.extractionLabel} · ${fieldRunFeedback.intensityLabel}`
                : "AFK hunting-ground contract settled through the shared mission timer."
              : "Payout, field cost, and next move."
          }
        />

        {fieldRunFeedback ? (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100">
              {fieldRunFeedback.contractStrideLabel}
            </span>
            <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
              {fieldRunFeedback.intensityLabel}
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
              {fieldRunFeedback.extractionLabel}
            </span>
          </div>
        ) : null}

        {latestHuntResult ? (
          <ScreenStateSummary
            eyebrow="Loop State"
            title="Payout Applied"
            consequence={
              isFieldContractResult
                ? fieldRunFeedback?.consequenceLine ??
                  "Contract is closed. Haul and wear are logged. Recover or queue another deploy based on condition and stores."
                : "Specimen down. Haul banked. The next question is whether the body should recover, refeed, or reopen the loop."
            }
            nextStep={
              isFieldContractResult
                ? shouldRouteToFeastHall
                  ? "Feast Hall if pressure is flashing; otherwise the Hunting Ground contract board for another deploy."
                  : "Hunting Ground for another deploy, or Home to shift the wider loop."
                : shouldRouteToFeastHall
                  ? "Open Feast Hall to spend the haul on stabilization before the next run."
                  : guidance.nextStepLabel
            }
            tone={shouldRouteToFeastHall ? "warning" : "ready"}
          />
        ) : null}

        {!latestHuntResult ? (
          <SectionCard
            title="No Hunt Result"
            description="Resolve a hunt from the field or Biotech Labs to generate a payout summary here."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hunt result on record yet. Finish an AFK contract from the
              Hunting Ground, use Deploy Into the Void on Home, or resolve a specimen hunt
              from Biotech Labs.
            </div>
          </SectionCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard
              title="Outcome Summary"
              description={`Resolved from ${latestHuntResult.huntTitle} at ${formatResolvedAt(latestHuntResult.resolvedAt)}.`}
            >
              <div className="space-y-4">
                {specimen ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                              Resolved Specimen
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                              {specimen.name}
                            </div>
                          </div>

                          <div className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                            {specimen.threatLabel}
                          </div>
                        </div>

                        <div className="mt-3 text-sm font-medium uppercase tracking-[0.08em] text-white/70">
                          {specimen.category}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/65">
                          {specimen.description}
                        </p>
                      </div>

                      {specimenBossAsset ? (
                        <div className="mx-auto w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl border border-emerald-400/20 bg-black/20 p-3">
                          <Image
                            src={specimenBossAsset}
                            alt={`${specimen.name} trophy profile`}
                            width={220}
                            height={220}
                            className="h-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.5)]"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/75">
                    {isFieldContractResult ? "Contract Closed" : "Kill Confirmed"}
                  </div>
                  <div className="mt-3 text-2xl font-black uppercase tracking-[0.04em] text-white md:text-[30px]">
                    {isFieldContractResult
                      ? fieldRunFeedback?.outcomeTitle ?? "Payout Logged"
                      : "Specimen Down"}
                  </div>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-emerald-50/85">
                    {isFieldContractResult
                      ? fieldRunFeedback?.heroTagline ??
                        "Field team returned. Haul banked; field cost applied."
                      : "Haul banked. Cost logged."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-300/20 bg-black/20 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                        Gain
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {isFieldContractResult
                          ? "Contract payout and salvage are in your stock."
                          : "Secure payout and bank salvage."}
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-300/20 bg-black/20 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-red-200/70">
                        Cost
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {isFieldContractResult
                          ? "Contract wear hits condition like any timed mission."
                          : "Take the field wear into the next decision."}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/65">
                    {isFieldContractResult
                      ? fieldRunFeedback?.footerLine ??
                        "Timer cleared. Decide recovery or redeploy while the body can still hold."
                      : "The hunt is over. The next decision is not."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Field Cost
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-200">
                      {latestHuntResult.conditionDelta > 0
                        ? `+${latestHuntResult.conditionDelta}`
                        : latestHuntResult.conditionDelta}
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {isFieldContractResult
                        ? "Condition spent on the contract run."
                        : "Condition spent on the kill and extraction."}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Field Condition Now
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {latestHuntResult.conditionAfter}%
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Current field-readiness after settlement.
                    </div>
                  </div>

                  {isFieldContractResult ? (
                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 p-4 sm:col-span-2">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                        Realtime Contribution Bonus
                      </div>
                      {isRealtimeBonusApplied ? (
                        <>
                          <div className="mt-2 text-sm text-white/70">
                            Multiplier: +{Math.round(bonusMultiplier * 100)}%
                          </div>
                          <div className="mt-3 space-y-1 text-sm text-white/75">
                            <div>
                              Rank XP: Base +{baseRankXp} · Bonus +{bonusRankXp} · Final +{finalRankXp}
                            </div>
                            <div>
                              Mastery: Base +{baseMastery} · Bonus +{bonusMastery} · Final +{finalMastery}
                            </div>
                            <div>
                              Influence: Base +{baseInfluence} · Bonus +{bonusInfluence} · Final +{finalInfluence}
                            </div>
                            <div>
                              Credits: Base +{baseCredits} · Bonus +{bonusCredits} · Final +{finalCredits}
                            </div>
                          </div>
                          {contributionRole ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                                Field Role (Realtime)
                              </div>
                              <div className="mt-2 text-sm font-semibold text-white/85">
                                {contributionRole}
                              </div>
                              {contributionProfessionHint ? (
                                <div className="mt-1 text-xs text-white/60">
                                  Specialization Hint: {contributionProfessionHint}
                                </div>
                              ) : null}
                              {roleTrendHint ? (
                                <div className="mt-1 text-xs text-white/60">
                                  {roleTrendHint.label}: {roleTrendHint.dominantRole} ({roleTrendHint.dominancePct}%)
                                </div>
                              ) : null}
                              <div className="mt-2 space-y-1 text-sm text-white/70">
                                <div>
                                  Damage Dealt: +{realtimeTotalDamageDealt}
                                </div>
                                <div>Hits Landed: {realtimeTotalHitsLanded}</div>
                                <div>
                                  Mobs Contributed: {realtimeMobsContributedTo}
                                </div>
                                <div>Mobs Killed: {realtimeMobsKilled}</div>
                              </div>
                            </div>
                          ) : null}
                          {realtimeBonusResourceEntries.length > 0 ? (
                            <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                                Realtime Bonus Resources
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-white/75">
                                {realtimeBonusResourceEntries.map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <span className="text-sm uppercase tracking-[0.08em] text-white/78">
                                      {formatResourceLabel(key)}
                                    </span>
                                    <span className="text-sm font-semibold text-emerald-100">
                                      +{value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div className="mt-3 text-xs text-white/55">
                            This is an alpha-safe add-on: the AFK contract payout is the baseline, realtime contribution adds a capped bonus.
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 text-sm text-white/60">
                          Realtime bonus pending (settles a moment after contract resolution).
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Rank XP Recorded
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{finalRankXp}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      Rank progress.
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Mastery Recorded
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{finalMastery}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      Long-run growth.
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Influence Recorded
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{finalInfluence}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      City standing.
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Salvage and Aftermath"
              description={
                isFieldContractResult
                  ? "Contract haul is banked. Feed recovery or queue another deploy."
                  : "The haul is yours. Decide what the body can survive next."
              }
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/8 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                    Salvage Secured
                  </div>
                  <div className="mt-2 text-base font-semibold text-white">
                    {resourceEntries.length > 0
                      ? "Usable stock secured."
                      : "No physical salvage from this run."}
                  </div>
                  <p className="mt-2 text-sm text-white/65">
                    Bank the haul, then decide whether to recover or continue.
                  </p>
                </div>

                <div className="space-y-3">
                  {resourceEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                      No material payout. Progress and field wear still stand.
                    </div>
                  ) : (
                    <>
                      {resourceEntries.slice(0, 2).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {getResourceIcon(key) ? (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/20 bg-black/20 p-2">
                                  <Image
                                    src={getResourceIcon(key)}
                                    alt={formatResourceLabel(key)}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 object-contain"
                                  />
                                </div>
                              ) : null}
                              <span className="text-sm uppercase tracking-[0.08em] text-white/78">
                                {formatResourceLabel(key)}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-emerald-100">
                              +{value}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/60">
                            {getResourceLoopMeaning(key)}
                          </p>
                          {isRealtimeBonusApplied ? (
                            <p className="mt-1 text-xs text-white/55">
                              Base +{latestHuntResult?.baseResourcesGained?.[key] ?? 0} ·
                              Bonus +{latestHuntResult?.realtimeResourcesBonusGained?.[key] ?? 0}
                            </p>
                          ) : null}
                        </div>
                      ))}
                      {resourceEntries.slice(2).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {getResourceIcon(key) ? (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-2">
                                  <Image
                                    src={getResourceIcon(key)}
                                    alt={formatResourceLabel(key)}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 object-contain"
                                  />
                                </div>
                              ) : null}
                              <span className="text-sm uppercase tracking-[0.08em] text-white/70">
                                {formatResourceLabel(key)}
                              </span>
                            </div>
                            <span className="text-base font-bold text-emerald-100">
                              +{value}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/55">
                            {getResourceLoopMeaning(key)}
                          </p>
                          {isRealtimeBonusApplied ? (
                            <p className="mt-1 text-xs text-white/50">
                              Base +{latestHuntResult?.baseResourcesGained?.[key] ?? 0} ·
                              Bonus +{latestHuntResult?.realtimeResourcesBonusGained?.[key] ?? 0}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Decision Pressure
                  </div>
                  <div className="mt-3 space-y-3">
                    {aftermathTakeaways.map((takeaway) => (
                      <div
                        key={takeaway}
                        className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/68"
                      >
                        {takeaway}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                    Decide Now
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {isFieldContractResult
                      ? shouldRouteToFeastHall
                        ? "Stabilize first, then reopen the contract board."
                        : "Redeploy from the Hunting Ground or step back to Home."
                      : shouldRouteToFeastHall
                        ? "Take the haul to Feast Hall before the loop frays."
                        : "Field pressure is still yours to spend."}
                  </div>
                  <p className="mt-2 text-sm text-white/65">
                    {isFieldContractResult
                      ? shouldRouteToFeastHall
                        ? "Pressure says Black Market recovery. After that, the Hunting Ground uses the same timer queue for the next AFK contract."
                        : "Hunting Ground contracts share the live mission queue with other ops. Deploy Into the Void on Home still queues a short hunt and can route here when it finishes."
                      : shouldRouteToFeastHall
                        ? "Condition or hunger says the safer next stop is Black Market recovery. Stabilize there, then decide whether to craft utility or reopen exploration."
                        : guidance.detail}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link
                      href={nextStepHref}
                      className="inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/45 hover:bg-cyan-300/18"
                    >
                      {nextStepLabel}
                    </Link>
                    {secondaryFieldStep ? (
                      <Link
                        href={secondaryFieldStep.href}
                        className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/88 transition hover:border-white/28 hover:bg-white/10"
                      >
                        {secondaryFieldStep.label}
                      </Link>
                    ) : null}
                    <Link
                      href="/bazaar/black-market"
                      className="inline-flex rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/40 hover:bg-emerald-300/16"
                    >
                      Black Market (Hub)
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Pressure Remaining
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                        Condition
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">
                        {state.player.condition}%
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                        Hunger
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">
                        {state.player.hunger}% - {hungerLabel}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-white/60">
                    {shouldRouteToFeastHall
                      ? "Condition and stores are dictating the call. Feast Hall is the clearest recovery handoff from this result screen."
                      : state.player.hunger < HUNGER_PRESSURE_THRESHOLD
                        ? "Stores are slipping. You can push, but the next run gets harsher."
                        : "The body is still holding. Continue only if you want the pressure."}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}
