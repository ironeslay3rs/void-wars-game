"use client";

import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import MasteryDepthPanel from "@/components/career/MasteryDepthPanel";
import MythicAscensionPanel from "@/components/mastery/MythicAscensionPanel";
import RuneCapacityDisplay from "@/components/mastery/RuneCapacityDisplay";
import { masteryScreenData } from "@/features/mastery/masteryScreenData";
import { getMasteryHubCards } from "@/features/mastery/masteryHubCards";
import { useGame } from "@/features/game/gameContext";
import DoctrineMilestoneCard from "@/components/mastery/DoctrineMilestone";
import {
  schoolDoctrines,
  getUnlockedDoctrines,
  getNextLockedDoctrine,
} from "@/features/mastery/doctrineData";
import type { PathType } from "@/features/game/gameTypes";
import DoctrineEncounterOverlay from "@/components/mastery/DoctrineEncounterOverlay";

export default function MasteryScreen() {
  const { state } = useGame();
  const hubCards = getMasteryHubCards(state.player);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,60,120,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <DoctrineEncounterOverlay />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
          eyebrow={masteryScreenData.eyebrow}
          title={masteryScreenData.title}
          subtitle={masteryScreenData.subtitle}
        />

        <p className="-mt-4 max-w-3xl text-sm text-white/55">
          Mirror of the{" "}
          <Link
            href="/career"
            className="text-cyan-200/90 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
          >
            Career
          </Link>{" "}
          spine — same mastery tree and installs.
        </p>

        <MasteryDepthPanel />

        {/* Doctrine milestones — the path teaches the player */}
        {state.player.factionAlignment !== "unbound" ? (() => {
          const school = state.player.factionAlignment as PathType;
          const doctrine = schoolDoctrines[school];
          const primaryDepth = state.player.runeMastery.depthBySchool[school];
          const unlocked = getUnlockedDoctrines(school, primaryDepth);
          const next = getNextLockedDoctrine(school, primaryDepth);
          return (
            <SectionCard
              title={doctrine.name}
              description={`"${doctrine.tagline}" — Embodies: ${doctrine.embodies}`}
            >
              <div className="space-y-3">
                {unlocked.map((m) => (
                  <DoctrineMilestoneCard
                    key={m.depth}
                    milestone={m}
                    school={school}
                    unlocked
                    isNext={false}
                  />
                ))}
                {next ? (
                  <DoctrineMilestoneCard
                    milestone={next}
                    school={school}
                    unlocked={false}
                    isNext
                  />
                ) : null}
                {doctrine.milestones
                  .filter(
                    (m) =>
                      m.depth > primaryDepth &&
                      (!next || m.depth !== next.depth),
                  )
                  .map((m) => (
                    <DoctrineMilestoneCard
                      key={m.depth}
                      milestone={m}
                      school={school}
                      unlocked={false}
                      isNext={false}
                    />
                  ))}
              </div>
            </SectionCard>
          );
        })() : null}

        <RuneCapacityDisplay runeMastery={state.player.runeMastery} />

        <MythicAscensionPanel />

        <SectionCard
          title="Rune crafting spine (Book 1)"
          description="High-end installs link mastery depth to district workbenches — clear the mythic gates here, route materials through the bazaar loop."
        >
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              When{" "}
              <span className="font-semibold text-white/90">L3 rare sets</span> and the{" "}
              <span className="font-semibold text-white/90">Rune Crafter</span> license are
              earned above, spend{" "}
              <span className="font-semibold text-amber-200/90">Ironheart</span>, rune dust,
              and field pulls in the crafting district for obsidian-cycle cuts.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/bazaar/crafting-district"
                className="rounded-lg border border-cyan-400/35 bg-cyan-500/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 hover:border-cyan-300/50"
              >
                Crafting district
              </Link>
              <Link
                href="/bazaar/war-exchange"
                className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100 hover:border-amber-200/45"
              >
                War Exchange
              </Link>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 md:grid-cols-3">
          {hubCards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {masteryScreenData.sections.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              description={section.description}
            >
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                {section.body}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
