import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { missionsScreenData } from "@/features/missions/missionsScreenData";

export default function MissionsScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,90,120,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title={missionsScreenData.sections[0].title}
            description={missionsScreenData.sections[0].description}
          >
            <div className="space-y-3">
              {missionsScreenData.sections[0].items?.map((entry) => (
                <div
                  key={entry}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                >
                  {entry}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={missionsScreenData.sections[1].title}
            description={missionsScreenData.sections[1].description}
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              {missionsScreenData.sections[1].body}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}