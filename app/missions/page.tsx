import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { missionsScreenData } from "@/features/missions/missionsScreenData";

export default function MissionsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(80,50,120,0.25),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={missionsScreenData.eyebrow}
          title={missionsScreenData.title}
          subtitle={missionsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {missionsScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Mission Chain"
            description="Primary contract flow, story branches, and progression milestones."
          >
            <div className="space-y-3">
              {["Prologue Entry", "First Assignment", "District Access"].map((step, index) => (
                <div
                  key={step}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                >
                  <span className="mr-3 text-cyan-300">0{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Objective Console"
            description="Auxiliary tasks, timers, daily loops, and reward preview space."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for daily objectives, timed events, and early retention loop systems.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}