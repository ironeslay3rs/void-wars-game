import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { statusScreenData } from "@/features/status/statusScreenData";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,70,120,0.28),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={statusScreenData.eyebrow}
          title={statusScreenData.title}
          subtitle={statusScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {statusScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Combat Identity"
            description="This section will later hold core stats, evolution alignment, and profession-linked modifiers."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for character power sheet, rune slots, condition state, and path scaling.
            </div>
          </SectionCard>

          <SectionCard
            title="Loadout Snapshot"
            description="Quick-glance equipment and active configuration panel."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for equipped gear, active set bonuses, and quick profile summary.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}