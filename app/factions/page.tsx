import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { factionsScreenData } from "@/features/factions/factionsScreenData";
import { factionData } from "@/features/factions/factionData";

export default function FactionsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,40,110,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={factionsScreenData.eyebrow}
          title={factionsScreenData.title}
          subtitle={factionsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {factionsScreenData.cards.map((card) => (
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
            title="Power Blocs"
            description="Major ideological forces competing for influence across the evolving world."
          >
            <div className="space-y-3">
              {factionData.map((faction) => (
                <div
                  key={faction.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold tracking-[0.06em] text-white">
                        {faction.name}
                      </h3>
                      <p className="mt-1 text-sm text-cyan-300">
                        {faction.tagline}
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        {faction.description}
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/45">
                      {faction.themeKey}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Faction Standing"
            description="Reserved for reputation systems, unlock tiers, and future alliance choices."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for faction reputation, rank rewards, path loyalty, and alliance consequences.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}