import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { professionsScreenData } from "@/features/professions/professionsScreenData";

export default function ProfessionsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(50,80,110,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={professionsScreenData.eyebrow}
          title={professionsScreenData.title}
          subtitle={professionsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {professionsScreenData.cards.map((card) => (
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
            title="Profession Classes"
            description="Core profession families that will define combat, crafting, and support roles."
          >
            <div className="space-y-3">
              {["Combat", "Crafting", "Gathering"].map((entry) => (
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
            title="Role Development"
            description="Reserved for profession depth, synergy, and specialization systems."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for role progression, advanced branches, and profession synergy.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}