"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import StatusHeroCard from "@/components/status/StatusHeroCard";
import StatusScreenSummary from "@/components/status/StatusScreenSummary";
import StatusResourcesCard from "@/components/status/StatusResourcesCard";
import StatusSystemsCard from "@/components/status/StatusSystemsCard";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(90,20,20,0.22),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Operative Status"
          title="Player Status"
          subtitle="Check condition pressure, recover if needed, and confirm whether you should repeat the loop or stabilize first."
        />

        <StatusScreenSummary />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Operative Profile"
            description="Primary recovery and readiness panel for current condition, rank state, and whether the next loop step is safe."
          >
            <StatusHeroCard />
          </SectionCard>

          <div className="grid gap-6">
            <StatusResourcesCard />

            <StatusSystemsCard />

            <SectionCard
              title="Loadout Snapshot"
              description="Reserved for equipment slots, rune set, and profession-linked bonuses."
            >
              <div className="grid gap-3">
                {[
                  "Weapon Slot",
                  "Armor Slot",
                  "Core Slot",
                  "Rune Set",
                  "Profession Bind",
                ].map((entry) => (
                  <div
                    key={entry}
                    className="flex items-center justify-between rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-sm uppercase tracking-[0.08em] text-white/60">
                      {entry}
                    </span>
                    <span className="text-sm font-semibold text-white/35">
                      Empty
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
