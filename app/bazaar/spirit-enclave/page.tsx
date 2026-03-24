import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { spiritEnclaveScreenData } from "@/features/spirit-enclave/spiritEnclaveScreenData";

export default function SpiritEnclavePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(90,50,140,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={spiritEnclaveScreenData.eyebrow}
          title={spiritEnclaveScreenData.title}
          subtitle={spiritEnclaveScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {spiritEnclaveScreenData.cards.map((card) => (
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
            title="Ember Doctrines"
            description="Runes, memory, and saintcraft define the Pure school. Set resonance and soul-fire trials live here."
          >
            <div className="space-y-3">
              {[
                "Rune Memory Recovery",
                "Set Resonance Chamber",
                "Saintcraft Trial",
              ].map((entry) => (
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
            title="Fusion Pressure"
            description="Pure is necessary, but not sufficient. This console frames how the Ember Vault supports the final trinity."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm leading-6 text-white/50">
              The Ember Vault preserves the soul-side of humanity through fire, runes,
              and memory. Future systems here should connect rune sets, saint tiers,
              and fusion prerequisites with Bio and Mecha progression.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
