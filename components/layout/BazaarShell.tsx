import Image from "next/image";
import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import BazaarTopHeader from "@/components/layout/BazaarTopHeader";
import BazaarMapCanvas from "@/components/bazaar/BazaarMapCanvas";
import { canonBazaar } from "@/features/canonRegistry";
import { assets } from "@/lib/assets";

export default function BazaarShell() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src={assets.maps.blackMarketHub}
        alt="Black Market district map backdrop"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,160,60,0.12),transparent_30%),linear-gradient(to_bottom,rgba(2,4,10,0.45),rgba(2,4,10,0.86)),linear-gradient(to_right,rgba(0,0,0,0.52),transparent_20%,transparent_80%,rgba(0,0,0,0.52))] opacity-95" />

      <ScreenLines />
      <FrameOverlay />
      <CornerBrackets />

      <div className="pointer-events-none absolute inset-x-6 bottom-6 z-20 md:inset-x-10">
        <div className="mx-auto max-w-[980px] rounded-2xl border border-amber-300/15 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/70">
            Black Market Law
          </div>
          <p className="mt-1 text-sm leading-relaxed text-amber-50/82">
            {canonBazaar.law}
          </p>
        </div>
      </div>

      <div className="relative z-20 min-h-screen px-6 py-6 md:px-10">
        <BazaarTopHeader />
        <BazaarMapCanvas />
      </div>
    </main>
  );
}
