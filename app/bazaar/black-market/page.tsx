import Link from "next/link";
import { ArrowLeft, Drumstick, UtensilsCrossed } from "lucide-react";

const blackMarketLanes = [
  {
    id: "feast-hall",
    title: "Feast Hall",
    lane: "Gluttony Lane",
    description:
      "A den of heavy meals, stimulant broths, and condition-restoring cuts for crews running too hot.",
    href: "/bazaar/black-market/feast-hall",
    icon: Drumstick,
  },
];

export default function BlackMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,70,10,0.22),rgba(5,8,18,1)_60%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-300/75">
              Bazaar / Black Market
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Black Market
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Book 1 lane unlock: one load-bearing slice is now active. Start in
              Feast Hall under the Gluttony lane.
            </p>
          </div>

          <Link
            href="/bazaar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bazaar
          </Link>
        </div>

        <section className="grid gap-4 md:max-w-3xl md:grid-cols-1">
          {blackMarketLanes.map((lane) => {
            const Icon = lane.icon;

            return (
              <Link
                key={lane.id}
                href={lane.href}
                className="rounded-2xl border border-amber-300/20 bg-amber-500/5 p-5 shadow-[0_0_28px_rgba(0,0,0,0.22)] transition hover:border-amber-300/40 hover:bg-amber-500/10"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <Icon className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
                      {lane.lane}
                    </div>
                    <h2 className="mt-1 text-base font-bold uppercase tracking-[0.06em]">
                      {lane.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/70">{lane.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/25 p-6 md:max-w-3xl">
          <div className="flex items-center gap-2 text-amber-300/75">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Scope Guardrail</span>
          </div>
          <p className="mt-3 text-sm text-white/70">
            This iteration intentionally ships only one lane. No war-map layer,
            no profession tracks, and no broad economy rewrites are included.
          </p>
        </section>
      </div>
    </main>
  );
}
