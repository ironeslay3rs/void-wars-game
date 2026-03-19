import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { mercenaryGuildScreenData } from "@/features/mercenary-guild/mercenaryGuildScreenData";

export default function MercenaryGuildPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,90,40,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={mercenaryGuildScreenData.eyebrow}
          title={mercenaryGuildScreenData.title}
          subtitle={mercenaryGuildScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {mercenaryGuildScreenData.cards.map((card) => (
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
            title="Contract Board"
            description="Reserved for bounty listings, escort jobs, hunt missions, and faction-linked field work."
          >
            <div className="space-y-3">
              {["Bounties", "Escort Jobs", "Danger Zone Hunts"].map((entry) => (
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
            title="Guild Console"
            description="Future mission state, reputation checks, and payout tracking."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for mission acceptance, guild rank, and reward summary.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}