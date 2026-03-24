"use client";

import { useMemo, useState } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { getFactionHqsScreenData } from "@/features/factions/factionsScreenData";
import { factionData } from "@/features/factions/factionData";
import CharacterCard from "@/components/characters/CharacterCard";
import CharacterModal from "@/components/characters/CharacterModal";
import {
  charactersData,
  factionLabels,
  type CharacterFaction,
  type CharacterRecord,
} from "@/features/characters/charactersData";

type CharacterFilter = "all" | CharacterFaction;
const FACTION_ORDER: CharacterFaction[] = ["ember", "bio", "mecha", "rune"];

export default function FactionsScreen() {
  const { state } = useGame();
  const factionsScreenData = getFactionHqsScreenData(state);

  const [activeFilter, setActiveFilter] = useState<CharacterFilter>("all");
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterRecord | null>(null);

  const visibleFactions = useMemo(() => {
    if (activeFilter === "all") {
      return FACTION_ORDER;
    }

    return FACTION_ORDER.filter((faction) => faction === activeFilter);
  }, [activeFilter]);

  const totalVisibleUnits = useMemo(() => {
    if (activeFilter === "all") {
      return charactersData.length;
    }

    return charactersData.filter(
      (character) => character.faction === activeFilter,
    ).length;
  }, [activeFilter]);

  function getFilterButtonClasses(filter: CharacterFilter) {
    const isActive = activeFilter === filter;

    if (filter === "ember") {
      return isActive
        ? "border-orange-400/50 bg-orange-500/15 text-orange-200"
        : "border-white/10 bg-white/5 text-white/65 hover:border-orange-400/35 hover:bg-orange-500/10 hover:text-orange-100";
    }

    if (filter === "bio") {
      return isActive
        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
        : "border-white/10 bg-white/5 text-white/65 hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-emerald-100";
    }

    if (filter === "mecha") {
      return isActive
        ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
        : "border-white/10 bg-white/5 text-white/65 hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100";
    }

    if (filter === "rune") {
      return isActive
        ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
        : "border-white/10 bg-white/5 text-white/65 hover:border-violet-400/35 hover:bg-violet-500/10 hover:text-violet-100";
    }

    return isActive
      ? "border-white/20 bg-white/12 text-white"
      : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white";
  }

  function getFilterLabel(filter: CharacterFilter) {
    if (filter === "all") return "All";
    return factionLabels[filter];
  }

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,40,110,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <ScreenHeader
            eyebrow={factionsScreenData.eyebrow}
            title={factionsScreenData.title}
            subtitle={factionsScreenData.subtitle}
          />

          <div className="grid gap-6 md:grid-cols-3">
            {factionsScreenData.cards.map((card) => (
              <PlaceholderPanel
                key={card.label}
                label={card.label}
                value={card.value}
                hint={card.hint}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard
              title={factionsScreenData.sections[0].title}
              description={factionsScreenData.sections[0].description}
            >
              <div className="space-y-3">
                {factionData.map((faction) => (
                  <div
                    key={faction.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold tracking-[0.06em] text-white">
                          {faction.name}
                        </h3>
                        <p className="mt-1 text-sm text-cyan-300">
                          {faction.tagline}
                        </p>
                        <p className="mt-2 text-sm text-white/60">
                          {faction.description}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/45">
                        {faction.themeKey}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={factionsScreenData.sections[1].title}
              description={factionsScreenData.sections[1].description}
            >
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                {factionsScreenData.sections[1].body}
              </div>
            </SectionCard>
          </div>

          <section className="mt-6 space-y-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Active Unit Roster
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    Filter the current unit set by affiliation.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/55">
                  {totalVisibleUnits} Visible Units
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {(["all", ...FACTION_ORDER] as CharacterFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition duration-200",
                      getFilterButtonClasses(filter),
                    ].join(" ")}
                  >
                    {getFilterLabel(filter)}
                  </button>
                ))}
              </div>
            </div>

            {visibleFactions.map((faction) => {
              const factionCharacters = charactersData.filter(
                (character) => character.faction === faction,
              );

              if (factionCharacters.length === 0) return null;

              return (
                <div key={faction} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {factionLabels[faction]}
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        Active combat units aligned with this doctrine.
                      </p>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/55">
                      {factionCharacters.length} Units
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {factionCharacters.map((character) => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onClick={setSelectedCharacter}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <CharacterModal
        character={selectedCharacter}
        isOpen={selectedCharacter !== null}
        onClose={() => setSelectedCharacter(null)}
      />
    </>
  );
}
