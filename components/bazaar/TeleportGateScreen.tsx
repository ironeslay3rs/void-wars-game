"use client";

import Link from "next/link";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

const linkClass =
  "inline-flex rounded-xl border px-4 py-3 text-sm font-semibold transition";

export default function TeleportGateScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.14),rgba(6,8,18,1)_50%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-cyan-400/35" />

        <ScreenHeader
          eyebrow="Bazaar / Travel"
          title="Teleport Gate"
          subtitle="Staging point for expeditions and contract runs. Void Expedition assigns realm and opens the live field; the Hunting Ground is the full contract board."
        />

        <SectionCard
          title="Deploy routes"
          description="Same mission queue everywhere—pick the screen that matches what you need next."
        >
          <div className="flex flex-col gap-3">
            <Link
              href={VOID_EXPEDITION_PATH}
              className={`${linkClass} border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100 hover:border-fuchsia-300/50 hover:bg-fuchsia-500/16`}
            >
              Void Expedition — realm path & field
            </Link>
            <Link
              href="/bazaar/mercenary-guild"
              className={`${linkClass} border-amber-400/35 bg-amber-500/10 text-amber-50 hover:border-amber-300/50 hover:bg-amber-500/16`}
            >
              Hunting Ground — contract board
            </Link>
            <Link
              href="/bazaar/biotech-labs/result"
              className={`${linkClass} border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/45 hover:bg-cyan-500/16`}
            >
              Hunt result
            </Link>
            <Link
              href="/home"
              className={`${linkClass} border-white/12 bg-black/25 text-white/80 hover:border-white/25 hover:text-white`}
            >
              Command Deck (Home)
            </Link>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
