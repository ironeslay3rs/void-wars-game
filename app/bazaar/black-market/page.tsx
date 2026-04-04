import Link from "next/link";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import BlackMarketMap from "@/components/black-market/BlackMarketMap";

export default function BlackMarketPage() {
  return (
    <main className="flex min-h-screen min-h-dvh flex-col bg-black text-white">
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur-sm md:px-6">
        <BazaarSubpageNav accentClassName="hover:border-orange-300/40" />
      </header>

      <div className="shrink-0 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,12,8,0.96),rgba(8,6,4,0.98))] px-4 py-3 md:px-6">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/35">
              Black Market · The Underground City
            </div>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              The largest hidden city built beneath civilization. Ruled by Erick — co-founder of the Slay3rs and sovereign of the underground. Each of the Seven Sins operates a covert storefront here under a false identity. Black Market law is absolute: deals are sacred, and betrayal costs more than death.
            </p>
            <p className="mt-2 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-[11px] leading-relaxed text-white/50">
              <span className="font-semibold text-amber-200/85">M1 loop:</span>{" "}
              Feast Hall, Mirror House, Velvet Den, Silent Garden, and Ivory Tower service
              deals update your save when you can pay.{" "}
              <span className="text-white/60">Golden Bazaar (Greed)</span> is the citadel
              commodity desk.{" "}
              <Link
                href="/bazaar/auction-house"
                className="font-semibold text-cyan-200/90 underline decoration-cyan-500/35 underline-offset-2 hover:text-white"
              >
                Auction House
              </Link>{" "}
              is a separate player-listing experiment (realtime when wired).
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/70">
            7 Districts
          </div>
        </div>
      </div>

      <div className="relative min-h-0 w-full flex-1">
        <BlackMarketMap />
      </div>
    </main>
  );
}
