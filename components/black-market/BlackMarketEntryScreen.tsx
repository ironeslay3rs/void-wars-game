import Link from "next/link";
import { ArrowLeft, Shield, Soup, Store } from "lucide-react";

const entryPanels = [
  {
    title: "Citadel Status",
    description:
      "Black Market now resolves as a real Bazaar destination and remains framed as neutral survivor ground.",
    icon: Shield,
  },
  {
    title: "Feast Hall Reserve",
    description:
      "The first Gluttony lane is reserved here, but only as future space. No lane systems or gameplay open in Step A.",
    icon: Soup,
  },
  {
    title: "Entry Surface",
    description:
      "This page is intentionally thin: a route, a container, and a clean handoff point for later Book 1 work.",
    icon: Store,
  },
];

export default function BlackMarketEntryScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(28,90,76,0.22),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/70">
              Bazaar / Hub Entry
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Black Market
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-white/70">
              A neutral survivor citadel inside the Bazaar network. This route is
              now a real entry surface, held intentionally thin so Feast Hall can
              land here later as the first Gluttony lane.
            </p>
          </div>

          <Link
            href="/bazaar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bazaar
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {entryPanels.map((panel) => {
            const Icon = panel.icon;

            return (
              <article
                key={panel.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)] transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]">
                      {panel.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">
                      {panel.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
              Book 1 Scope
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Replay Boundary</h2>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Real route and page container added.
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Bazaar map destination now resolves cleanly.
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                No Feast Hall gameplay, economy, or reducer logic yet.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
              Reserved Next
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Feast Hall</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">
              Recovery remains unresolved and no verified Feast Hall winner is
              asserted here. This entry exists only to preserve a clean future
              seam for one Gluttony lane inside Black Market.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
