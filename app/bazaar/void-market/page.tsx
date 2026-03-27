import Link from "next/link";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import VoidMarketExchange from "@/components/bazaar/VoidMarketExchange";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

export default function VoidMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,90,20,0.18),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-amber-300/40" />

        <ScreenHeader
          eyebrow="Bazaar / Void Market"
          title="Void Market"
          subtitle="M3 commodity desk: taxed buys, fee-bearing sells, and profession-adjusted quotes — legal trade complement to Black Market sin lanes."
        />

        <VoidMarketExchange />

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard
            title="Contracts & field"
            description="Economy ties back to work you can take today."
          >
            <div className="flex flex-col gap-3 text-sm text-white/70">
              <p>
                Mission payouts and void contracts use your save resources; field
                pickups respect Gathering focus and mastery-aligned zone bonuses.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/missions"
                  className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/16"
                >
                  Mission queue
                </Link>
                <Link
                  href={VOID_EXPEDITION_PATH}
                  className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10"
                >
                  Void Expedition
                </Link>
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="Black Market"
            description="Risk, services, and Greed-lane pressure valves."
          >
            <p className="text-sm text-white/70">
              The surface exchange stays predictable. For feast contracts, arena
              blood-work, and the rest of the citadel, use the Black Market hub —
              Greed&apos;s Golden Bazaar links here for above-board commodity
              trades.
            </p>
            <div className="mt-4">
              <Link
                href="/market/black-market"
                className="inline-flex rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/16"
              >
                Black Market map
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
