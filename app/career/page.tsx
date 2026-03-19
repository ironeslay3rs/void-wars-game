import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { careerScreenData } from "@/features/career/careerScreenData";

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,70,120,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={careerScreenData.eyebrow}
          title={careerScreenData.title}
          subtitle={careerScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {careerScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Career Tracks"
            description="Reserved for long-term identity choices and specialization branches."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for role paths, branching commitments, and future class development.
            </div>
          </SectionCard>

          <SectionCard
            title="Progress Outlook"
            description="Forward view of how your role path could evolve over time."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for synergy forecasting, class milestones, and role unlocks.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}