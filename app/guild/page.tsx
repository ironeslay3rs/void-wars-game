import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { guildScreenData } from "@/features/guild/guildScreenData";

export default function GuildPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,90,90,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={guildScreenData.eyebrow}
          title={guildScreenData.title}
          subtitle={guildScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {guildScreenData.cards.map((card) => (
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
            title="Guild Structure"
            description="Reserved for member roles, rank hierarchy, and team organization."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for guild roster, rank structure, and internal management.
            </div>
          </SectionCard>

          <SectionCard
            title="Collective Progress"
            description="Future guild progression, shared objectives, and territory systems."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for guild milestones, influence, and cooperative rewards.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}