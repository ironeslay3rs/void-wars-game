import FeastHallScreen from "@/components/black-market/FeastHallScreen";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";

export default function BlackMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,60,20,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow="Black Market / Neutral Citadel"
          title="Black Market"
          subtitle="A survivor citadel between Bio, Mecha, and Pure. For Book 1, the first live lane is Gluttony / Feast Hall."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Citadel Law"
            description="The Black Market exists to keep operatives alive long enough to return to the war."
          >
            <div className="space-y-4 text-sm leading-6 text-white/72">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
                Deals are sacred; betrayal costs more than death.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Neutrality matters here. The market serves Bio, Mecha, and Pure
                without collapsing into faction ritual or reward clutter.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="First Live Lane"
            description="The Black Market becomes real in gameplay when it supports the existing loop instead of promising future systems."
          >
            <div className="space-y-4 text-sm leading-6 text-white/72">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/8 p-4">
                Feast Hall is the first playable lane because it turns existing
                pressure into a survival service: spend what the front gave you,
                recover, and return to the field.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                This keeps the scope inside Book 1: one lane, one recovery
                service family, and no new economy framework.
              </div>
            </div>
          </SectionCard>
        </div>

        <FeastHallScreen embedded />
      </div>
    </main>
  );
}
