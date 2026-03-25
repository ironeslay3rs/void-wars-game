import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  blackMarketLanePlaceholders,
  blackMarketRoleSummary,
} from "@/features/black-market/blackMarketScreenData";

export default function BlackMarketPage() {
  const liveLane = blackMarketLanePlaceholders.find(
    (lane) => lane.status === "live",
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,60,20,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-orange-300/40" />

        <ScreenHeader
          eyebrow={blackMarketRoleSummary.eyebrow}
          title={blackMarketRoleSummary.title}
          subtitle={blackMarketRoleSummary.subtitle}
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Citadel Law"
            description="The Black Market is a neutral survivor citadel. It exists to keep operatives alive, supplied, and pointed back toward the war."
          >
            <div className="space-y-4 text-sm leading-6 text-white/72">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
                Deals are sacred; betrayal costs more than death.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                This is not a comfort stop. Every lane in the market should
                read as survival under pressure: recover, pay the cost, and
                return to the front without menu sprawl or a fake economy.
              </div>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/8 p-4">
                Book 1 keeps this route intentionally narrow. One live lane is
                enough if the player understands why it matters.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Live Lane"
            description="Gluttony / Feast Hall is the only active Black Market lane in this slice."
          >
            {liveLane ? (
              <div className="space-y-4 text-sm leading-6 text-white/72">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/8 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-amber-100/75">
                    {liveLane.sin} / {liveLane.lane}
                  </div>
                  <p className="mt-2">
                    Feast Hall is where condition gets stabilized at a cost.
                    Credits, salvage, hunger, and cooldown all stay in the
                    decision. Recovery here is valuable because it is not free.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    Authority
                  </div>
                  <p className="mt-2">
                    Use the dedicated Feast Hall route for the live service.
                    This hub only establishes purpose, stakes, and lane status.
                  </p>
                </div>

                <Link
                  href="/bazaar/black-market/feast-hall"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-amber-300/40 bg-amber-300/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-amber-50 transition hover:border-amber-200/60 hover:bg-amber-300/20"
                >
                  Enter Feast Hall
                </Link>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <SectionCard
          title="Lane Registry"
          description="The remaining sin lanes stay visible as canon-safe placeholders. Feast Hall is the only route with live interaction in M1."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {blackMarketLanePlaceholders.map((lane) => (
              <div
                key={lane.id}
                className={[
                  "rounded-2xl border p-4",
                  lane.status === "live"
                    ? "border-amber-300/25 bg-amber-500/8"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">
                    {lane.lane}
                  </div>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      lane.status === "live"
                        ? "border border-amber-300/30 bg-amber-300/12 text-amber-100"
                        : "border border-white/10 bg-black/20 text-white/55",
                    ].join(" ")}
                  >
                    {lane.status}
                  </span>
                </div>

                <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {lane.sin}
                </div>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  {lane.note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
