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
import BrokerCard from "@/components/shared/BrokerCard";
import { getBrokersByDistrict } from "@/features/lore/brokerData";

export default function ArenaScreen() {
  const router = useRouter();
  const { state } = useGame();
  const { player } = state;

  const factionAccent = getFactionAccent(player.factionAlignment);
  const conditionLabel = getConditionLabel(player.condition);
  const arenaEligibility = getArenaEligibility(player.condition);
  const {
    queueState,
    selectedMode,
    canQueueSelectedMode,
    handleCancelQueue,
    handleQueue,
    handleSelectMode,
    resetQueue,
  } = useArenaQueue({
    battleModes,
    condition: player.condition,
  });

  const liveCards = [
    {
      label: "Affiliation",
      value: formatFactionLabel(player.factionAlignment),
      hint: "Arena modifiers can later react to your active path.",
    },
    {
      label: "Condition",
      value: `${player.condition}%`,
      hint: `${conditionLabel} - live shared player state.`,
    },
    {
      label: "Arena Access",
      value: arenaEligibility,
      hint: "Eligibility is based on current combat condition.",
    },
    {
      label: "Ranked Season 1",
      value: `SR ${player.mythicAscension.arenaRankedSeason1Rating}`,
      hint: "Skill rating shell for Season 1 rewards track — updates when ranked queue goes live.",
    },
  ];

  function handleEnterMatch() {
    resetQueue();
    router.push(`/arena/match?mode=${encodeURIComponent(selectedMode.id)}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(110,50,70,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
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
              selectedModeId={selectedMode.id}
              onSelectMode={handleSelectMode}
            />
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Match Console"
              description="Live readiness, queue state, and match-entry checkpoint."
            >
              <ArenaConsoleCard
                condition={player.condition}
                barClassName={factionAccent.bar}
                selectedMode={selectedMode}
                canQueueSelectedMode={canQueueSelectedMode}
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
        {getBrokersByDistrict("coliseum").length > 0 ? (
          <div className="mt-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Authority</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {getBrokersByDistrict("coliseum").map((b) => (
                <BrokerCard key={b.id} broker={b} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
