"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";

function formatResolvedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function formatResourceLabel(key: string) {
  switch (key) {
    case "credits":
      return "Credits";
    case "ironOre":
      return "Iron Ore";
    case "scrapAlloy":
      return "Scrap Alloy";
    case "runeDust":
      return "Rune Dust";
    case "emberCore":
      return "Ember Core";
    case "bioSamples":
      return "Bio Samples";
    default:
      return key;
  }
}

export default function BiotechLabsResultPage() {
  const { state } = useGame();
  const latestHuntResult = state.player.lastHuntResult;

  const resourceEntries = Object.entries(
    latestHuntResult?.resourcesGained ?? {},
  ).filter(([, value]) => typeof value === "number" && value !== 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Biotech Labs / Hunt Result"
          title="Specimen Hunt Result"
          subtitle="Read-only Phase 1 summary for the latest resolved biotech hunt."
        />

        {!latestHuntResult ? (
          <SectionCard
            title="No Hunt Result"
            description="Resolve the biotech specimen hunt to generate a result summary."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No latest hunt result is stored yet.
            </div>
          </SectionCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard
              title={latestHuntResult.huntTitle}
              description={`Resolved at ${formatResolvedAt(latestHuntResult.resolvedAt)}`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Condition Delta
                  </div>
                  <div className="mt-2 text-2xl font-bold text-red-200">
                    {latestHuntResult.conditionDelta > 0
                      ? `+${latestHuntResult.conditionDelta}`
                      : latestHuntResult.conditionDelta}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Condition After Hunt
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {latestHuntResult.conditionAfter}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Rank XP Gained
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    +{latestHuntResult.rankXpGained}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Mastery Progress Gained
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    +{latestHuntResult.masteryProgressGained}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Influence Gained
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    +{latestHuntResult.influenceGained}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Rewards"
              description="Credits and materials awarded from the latest hunt resolution."
            >
              <div className="space-y-3">
                {resourceEntries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    No resources were awarded for this hunt.
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
            </SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}
