"use client";

import EmpireOverviewCard from "@/components/empires/EmpireOverviewCard";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getAllEmpires } from "@/features/empires/empireSelectors";
import { useGame } from "@/features/game/gameContext";

export default function EmpiresIndexPage() {
  const { state } = useGame();
  const empires = getAllEmpires();
  const playerAlignment = state.player.factionAlignment;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,30,80,0.28),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow="World · Macro layer"
          title="The Three Empires"
          subtitle="Three civilizational answers to survival. Each empire wears 2-3 schools as its public face, and each school carries a sin into the open. Pick where you stand."
          backHref="/home"
          backLabel="Back to Home"
        />

        <SectionCard
          title="Why three?"
          description="From lore-canon/01 Master Canon/Empires/The Three Empires.md."
        >
          <p className="text-sm leading-6 text-white/75">
            The empires are not just political bodies — they are civilizational
            expressions of different evolutionary answers. <strong>Bio</strong>{" "}
            adapts through flesh. <strong>Mecha</strong> builds through
            structure. <strong>Pure</strong> remembers through soul. The war
            between them never fully ends, because each believes it understands
            the correct future of humanity.
          </p>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-3">
          {empires.map((empire) => (
            <EmpireOverviewCard
              key={empire.id}
              empire={empire}
              isAligned={playerAlignment === empire.id}
            />
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/55">
          Looking for the schools below the empires?{" "}
          <a
            href="/schools"
            className="text-white/85 underline-offset-4 hover:underline"
          >
            See all 7 schools →
          </a>
        </div>
      </div>
    </main>
  );
}
