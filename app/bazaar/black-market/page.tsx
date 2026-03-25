import FeastHallScreen from "@/components/black-market/FeastHallScreen";
import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  blackMarketLanePlaceholders,
  blackMarketRoleSummary,
} from "@/features/black-market/blackMarketScreenData";

export default function BlackMarketPage() {
  const futureLanes = blackMarketLanePlaceholders.filter(
    (lane) => lane.status === "placeholder",
  );
  const lockedLaneNames = futureLanes.map((lane) => lane.lane).join(" - ");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,60,20,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={blackMarketRoleSummary.eyebrow}
          title={blackMarketRoleSummary.title}
          subtitle={blackMarketRoleSummary.subtitle}
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Citadel Law"
            description="The Black Market is a neutral survivor citadel. Its first duty is keeping operatives alive long enough to return to the war."
          >
            <div className="space-y-4 text-sm leading-6 text-white/72">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
                Deals are sacred; betrayal costs more than death.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Neutrality matters here. The market serves Bio, Mecha, and Pure
                through survival logic: recover, provision, and return to the
                front without a new currency layer or a safe, casual tone.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Live Service"
            description="Book 1 keeps the Black Market narrow: one live lane tied directly to survival pressure."
          >
            <div className="space-y-4 text-sm leading-6 text-white/72">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/8 p-4">
                Gluttony / Feast Hall is the active lane. It turns current
                credits, salvage, hunger, and condition pressure into a hard
                recovery choice before the next push.
              </div>
              <Link
                href="/bazaar/black-market/feast-hall"
                className="inline-flex w-full items-center justify-center rounded-xl border border-amber-300/40 bg-amber-300/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-amber-50 transition hover:border-amber-200/60 hover:bg-amber-300/20"
              >
                Enter Feast Hall Lane
              </Link>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                This keeps scope inside Book 1: one route, one lane, and one
                real recovery location in the world instead of a broader hub
                rollout.
              </div>
            </div>
          </SectionCard>
        </div>

        <FeastHallScreen embedded />

        <SectionCard
          title="Other Lanes"
          description="The remaining sin lanes stay inactive in this slice. Feast Hall is the only live Black Market service on this route."
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/68">
            Locked but not active: {lockedLaneNames}. They remain canon-safe
            placeholders only while Feast Hall carries the current survival loop.
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
