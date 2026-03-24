"use client";

import { useRouter } from "next/navigation";
import ArenaConsoleCard from "@/components/arena/ArenaConsoleCard";
import ArenaModesCard from "@/components/arena/ArenaModesCard";
import ArenaRewardsCard from "@/components/arena/ArenaRewardsCard";
import ArenaRulesCard from "@/components/arena/ArenaRulesCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { arenaScreenData } from "@/features/arena/arenaScreenData";
import {
  battleModes,
  rewards,
  rules,
} from "@/features/arena/arenaContent";
import { useArenaQueue } from "@/features/arena/useArenaQueue";
import {
  formatFactionLabel,
  getArenaEligibility,
  getConditionLabel,
  getFactionAccent,
} from "@/features/arena/arenaView";
import { useGame } from "@/features/game/gameContext";

export default function ArenaScreen() {
  const router = useRouter();
  const { state } = useGame();
  const { player } = state;

  const factionAccent = getFactionAccent(player.factionAlignment);
  const conditionLabel = getConditionLabel(player.condition);
  const arenaEligibility = getArenaEligibility(player.condition);
  const { queueState, selectedMode, handleCancelQueue, handleQueue, handleSelectMode, resetQueue } =
    useArenaQueue({
      battleModes,
      arenaEligibility,
    });

  const liveCards = [
    {
      label: "Faction Alignment",
      value: formatFactionLabel(player.factionAlignment),
      hint: "Arena modifiers can later react to your active path.",
    },
    {
      label: "Condition",
      value: `${player.condition}%`,
      hint: `${conditionLabel} — live shared player state.`,
    },
    {
      label: "Arena Access",
      value: arenaEligibility,
      hint: "Eligibility is based on current combat condition.",
    },
  ];

  function handleEnterMatch() {
    resetQueue();
    router.push("/arena/match");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(110,50,70,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={arenaScreenData.eyebrow}
          title={arenaScreenData.title}
          subtitle={arenaScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {liveCards.map((card) => (
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
            title="Battle Modes"
            description="Core combat lanes for ranked pressure, controlled practice, and seasonal competitive events."
          >
            <ArenaModesCard
              battleModes={battleModes}
              chipClassName={factionAccent.chip}
              panelClassName={`${factionAccent.ring} ${factionAccent.glow}`}
              selectedModeTitle={selectedMode.title}
              onSelectMode={handleSelectMode}
            />
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Match Console"
              description="Live readiness, queue state, and match-entry checkpoint."
            >
              <ArenaConsoleCard
                arenaEligibility={arenaEligibility}
                condition={player.condition}
                barClassName={factionAccent.bar}
                selectedMode={selectedMode}
                queueState={queueState}
                onQueue={handleQueue}
                onCancelQueue={handleCancelQueue}
                onEnterMatch={handleEnterMatch}
              />
            </SectionCard>

            <SectionCard
              title="Combat Ruleset"
              description="Arena-specific tuning that will later balance PvP separately from PvE."
            >
              <ArenaRulesCard rules={rules} />
            </SectionCard>

            <SectionCard
              title="Reward Track"
              description="Planned reward categories for ranked, event, and progression-linked arena combat."
            >
              <ArenaRewardsCard rewards={rewards} />
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
