import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import BlackMarketMap from "@/components/black-market/BlackMarketMap";

export default function BlackMarketPage() {
  return (
    <main className="flex min-h-screen min-h-dvh flex-col bg-black text-white">
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-black/85 px-4 py-3 backdrop-blur-sm md:px-6">
        <BazaarSubpageNav accentClassName="hover:border-orange-300/40" />
      </header>
      <div className="relative min-h-0 w-full flex-1">
        <BlackMarketMap />
      </div>
    </main>
  );
}
