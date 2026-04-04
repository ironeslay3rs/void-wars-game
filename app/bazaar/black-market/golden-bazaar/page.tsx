import Link from "next/link";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import GoldenBazaarExchange from "@/components/black-market/GoldenBazaarExchange";
import ScreenHeader from "@/components/shared/ScreenHeader";

export default function GoldenBazaarPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,90,20,0.22),_rgba(5,8,18,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <BazaarSubpageNav
          accentClassName="hover:border-amber-300/40"
          backHref="/bazaar/black-market"
          backLabel="Back to Black Market"
        />

        <ScreenHeader
          eyebrow="Black Market / Greed lane"
          title="Golden Bazaar"
          subtitle="Browse commodity listings, pay fees, and move stock through the neutral citadel. This is the first real transaction layer for the loop."
        />

        <p className="rounded-xl border border-cyan-400/22 bg-cyan-950/20 px-4 py-3 text-xs leading-relaxed text-cyan-100/85">
          Looking for <span className="font-semibold text-cyan-50">player-posted gear</span>
          ? The{" "}
          <Link
            href="/bazaar/auction-house"
            className="font-semibold text-cyan-200 underline decoration-cyan-400/40 underline-offset-2 hover:text-white"
          >
            Auction House
          </Link>{" "}
          route handles listing experiments separately from this commodity desk.
        </p>

        <GoldenBazaarExchange />
      </div>
    </main>
  );
}

