"use client";

import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getLatestBiotechSpecimen } from "@/features/biotech-labs/specimenData";
import { useGame } from "@/features/game/gameContext";
import {
  formatResourceLabel,
  getNonZeroResourceEntries,
} from "@/features/game/gameFeedback";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";

function formatResolvedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export default function BiotechLabsResultPage() {
  const { state } = useGame();
  const latestHuntResult = state.player.lastHuntResult;
  const guidance = getFirstSessionGuidance(state);
  const specimen = getLatestBiotechSpecimen(latestHuntResult);

  const resourceEntries = getNonZeroResourceEntries(
    latestHuntResult?.resourcesGained ?? {},
  );
  const nextStepHref =
    guidance.nextAction === "recover" ? "/status" : "/home";
  const nextStepLabel =
    guidance.nextAction === "recover"
      ? "Open Status and Recover"
      : "Return Home and Explore";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Biotech Labs / Hunt Result"
          title="Specimen Hunt Result"
          subtitle="Clear payout, condition impact, and next-step summary for the latest biotech hunt."
        />

        {latestHuntResult ? (
          <ScreenStateSummary
            eyebrow="Hunt Result State"
            title="Resolved"
            consequence="The biotech hunt has been completed and the outcome is fully applied to your current state."
            nextStep={guidance.detail}
            tone="ready"
          />
        ) : null}

        {!latestHuntResult ? (
          <SectionCard
            title="No Hunt Result"
            description="Resolve a biotech specimen hunt to generate a result summary here."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hunt result is available yet. Resolve a specimen hunt from Biotech Labs to populate this screen.
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
                ) : null}

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                    Hunt Complete
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    Rewards secured. Specimen trace resolved.
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Your payout has been applied to progression, resources, and influence. Review the condition impact below, then follow the next-step guidance.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Condition Impact
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-200">
                      {latestHuntResult.conditionDelta > 0
                        ? `+${latestHuntResult.conditionDelta}`
                        : latestHuntResult.conditionDelta}
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      Condition spent during the hunt.
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Condition Now
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {latestHuntResult.conditionAfter}%
                    </div>
                    <div className="mt-2 text-sm text-white/55">
                      Current condition after payout resolution.
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Rank XP
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{latestHuntResult.rankXpGained}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Mastery
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{latestHuntResult.masteryProgressGained}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Influence
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      +{latestHuntResult.influenceGained}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Rewards and Next Step"
              description="Immediate payout breakdown plus the clearest follow-up action."
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                    Next Step
                  </div>
                  <div className="mt-2 text-base font-semibold text-white">
                    {guidance.objective}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {guidance.detail}
                  </p>
                  <Link
                    href={nextStepHref}
                    className="mt-4 inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/45 hover:bg-cyan-300/18"
                  >
                    {nextStepLabel}
                  </Link>
                </div>

                <div className="space-y-3">
                  {resourceEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                      No material payout was awarded for this hunt. Progression rewards and condition impact are still recorded above.
                    </div>
                  ) : (
                    resourceEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <span className="text-sm uppercase tracking-[0.08em] text-white/70">
                          {formatResourceLabel(key)}
                        </span>
                        <span className="text-base font-bold text-emerald-100">
                          +{value}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}
