import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { arenaScreenData } from "@/features/arena/arenaScreenData";

export default function ArenaPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(110,50,70,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={arenaScreenData.eyebrow}
          title={arenaScreenData.title}
          subtitle={arenaScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {arenaScreenData.cards.map((card) => (
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
            title="Battle Modes"
            description="Reserved for ranked queues, challenge modes, and faction combat formats."
          >
            <div className="space-y-3">
              {["Ranked", "Practice", "Tournament"].map((entry) => (
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
            title="Match Console"
            description="Future match preparation, status checks, and reward tracking."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for matchmaking state, rewards, and combat session entry.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}