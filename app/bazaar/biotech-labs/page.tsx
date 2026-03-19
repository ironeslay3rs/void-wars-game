import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { biotechLabsScreenData } from "@/features/biotech-labs/biotechLabsScreenData";

export default function BiotechLabsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={biotechLabsScreenData.eyebrow}
          title={biotechLabsScreenData.title}
          subtitle={biotechLabsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {biotechLabsScreenData.cards.map((card) => (
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
            title="Mutation Bays"
            description="Reserved for genetic harvest, body adaptation, and organic enhancement systems."
          >
            <div className="space-y-3">
              {["Gene Extraction", "Mutation Trials", "Tissue Refinement"].map(
                (entry) => (
                  <div
                    key={entry}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                  >
                    {entry}
                  </div>
                )
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Bio Console"
            description="Future mutation state, instability checks, and specimen tracking."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for adaptation status, harvested samples, and mutation results.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}