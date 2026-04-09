"use client";

import Link from "next/link";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import SchoolListByEmpire from "@/components/schools/SchoolListByEmpire";
import type { Empire } from "@/features/empires/empireTypes";
import { useGame } from "@/features/game/gameContext";

type EmpireDetailScreenProps = {
  empire: Empire;
};

export default function EmpireDetailScreen({ empire }: EmpireDetailScreenProps) {
  const { state } = useGame();
  const playerAlignment = state.player.factionAlignment;
  const isAligned = playerAlignment === empire.id;

  return (
    <main
      className="min-h-screen px-6 py-10 text-white md:px-10"
      style={{
        background: `radial-gradient(circle at top, ${empire.accentHex}33, rgba(5,8,20,1) 60%)`,
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={`${empire.doctrineWord} · Empire`}
          title={empire.name}
          subtitle={empire.tagline}
          backHref="/empires"
          backLabel="Back to Empires"
        />

        {isAligned ? (
          <div
            className="rounded-xl border bg-white/5 p-4 text-sm text-white/80"
            style={{ borderColor: `${empire.accentHex}66` }}
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: empire.accentHex }}
            >
              You stand with the {empire.name}.
            </span>{" "}
            Your stipend, doctrine, and HQ access flow through this banner.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Philosophy"
            description="What this empire claims about humanity's future."
          >
            <div className="space-y-4 text-sm leading-6 text-white/75">
              <p className="text-base italic text-white/85">
                &ldquo;{empire.claim}&rdquo;
              </p>
              <p>{empire.philosophy}</p>
              <p>{empire.longForm}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Rolling pressure"
            description="Doctrine word and identity stripe."
          >
            <div className="space-y-4">
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: `${empire.accentHex}55`, background: `${empire.accentHex}14` }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: empire.accentHex }}
                >
                  Doctrine word
                </p>
                <p className="mt-1 text-3xl font-black tracking-tight text-white">
                  {empire.doctrineWord}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Schools owned
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {empire.schoolIds.length}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Each school holds a sin and pairs with a Blackcity lane.
                </p>
              </div>

              <Link
                href="/factions"
                className="block rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/30 hover:bg-white/10"
              >
                Open the war front
              </Link>
            </div>
          </SectionCard>
        </div>

        <SchoolListByEmpire empire={empire} />
      </div>
    </main>
  );
}
