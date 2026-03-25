import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { pureEnclaveScreenData } from "@/features/spirit-enclave/spiritEnclaveScreenData";

export default function PureEnclavePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(90,50,140,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-violet-300/40" />

        <ScreenHeader
          eyebrow={pureEnclaveScreenData.eyebrow}
          title={pureEnclaveScreenData.title}
          subtitle={pureEnclaveScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {pureEnclaveScreenData.cards.map((card) => (
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
            title="Resonance Chambers"
            description="Reserved for soul attunement, ember rites, and rune-memory progression."
          >
            <div className="space-y-3">
              {["Soul Alignment", "Rune Memory", "Resonance Trial"].map(
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
            title="Pure Console"
            description="Future attunement state, soul capacity, and resonance tracking."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for Pure-path status, resonance depth, and rune-linked outcomes.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
