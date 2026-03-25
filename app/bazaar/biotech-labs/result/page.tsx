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
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import {
  getHungerLabel,
  HUNGER_PRESSURE_THRESHOLD,
} from "@/features/status/survival";
import { assets } from "@/lib/assets";

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

function getRewardIcon(resourceKey: string) {
  switch (resourceKey) {
    case "credits":
      return assets.icons.voidOrb;
    case "ironOre":
      return assets.icons.shatteredPlate;
    case "scrapAlloy":
      return assets.icons.shatteredSkull;
    case "runeDust":
      return assets.icons.voidCluster;
    case "emberCore":
      return assets.icons.emberCoreDevice;
    case "bioSamples":
      return assets.icons.bioVial;
    case "mossRations":
      return assets.icons.alchemyFlask;
    default:
      return null;
  }
}

export default function BiotechLabsResultPage() {
  const { state } = useGame();
  const latestHuntResult = state.player.lastHuntResult;
  const guidance = getFirstSessionGuidance(state);
  const specimen = getLatestBiotechSpecimen(latestHuntResult);
  const specimenBossAsset = specimen?.bossAsset ?? null;

  const resourceEntries = getNonZeroResourceEntries(
    latestHuntResult?.resourcesGained ?? {},
  );
  const nextStepHref = guidance.nextAction === "recover" ? "/status" : "/home";
  const nextStepLabel =
    guidance.nextAction === "recover"
      ? "Open Status and Recover"
      : "Return Home and Explore";
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
          eyebrow="Biotech Labs / Hunt Result"
          title="Specimen Hunt Result"
          subtitle="Payout, field cost, and next move."
        />

        {latestHuntResult ? (
          <ScreenStateSummary
            eyebrow="Loop State"
            title="Payout Applied"
            consequence="Specimen down. Haul banked. Choose: recover or keep pressure on the loop."
            nextStep={guidance.nextStepLabel}
            tone={guidance.nextAction === "recover" ? "warning" : "ready"}
          />
        ) : null}

        {!latestHuntResult ? (
          <SectionCard
            title="No Hunt Result"
            description="Resolve a biotech specimen hunt to generate a result summary here."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hunt result is available yet. Resolve a specimen hunt from Biotech
              Labs to populate this screen.
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
                    Kill Confirmed
                  </div>
                  <div className="mt-3 text-2xl font-black uppercase tracking-[0.04em] text-white md:text-[30px]">
                    Specimen Down
                  </div>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-emerald-50/85">
                    Haul banked. Cost logged.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-300/20 bg-black/20 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                        Gain
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        Secure payout and bank salvage.
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-300/20 bg-black/20 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-red-200/70">
                        Cost
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        Take the field wear into the next decision.
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/65">
                    The hunt is over. The next decision is not.
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
                      Condition spent on the kill and extraction.
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

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Rank XP Recorded
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{latestHuntResult.rankXpGained}
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
                      +{latestHuntResult.masteryProgressGained}
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
                      +{latestHuntResult.influenceGained}
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
              description="The haul is yours. Decide what the body can survive next."
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
                              {getRewardIcon(key) ? (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/20 bg-black/20 p-2">
                                  <Image
                                    src={getRewardIcon(key) as string}
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
                        </div>
                      ))}
                      {resourceEntries.slice(2).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {getRewardIcon(key) ? (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-2">
                                  <Image
                                    src={getRewardIcon(key) as string}
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
                    {guidance.nextAction === "recover"
                      ? "Recover before the loop breaks."
                      : "Field pressure is still yours to spend."}
                  </div>
                  <p className="mt-2 text-sm text-white/65">
                    {guidance.detail}
                  </p>
                  <Link
                    href={nextStepHref}
                    className="mt-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/45 hover:bg-cyan-300/18"
                  >
                    {nextStepLabel}
                  </Link>
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
                    {guidance.nextAction === "recover"
                      ? "Condition and stores are dictating the call. Recover first."
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
