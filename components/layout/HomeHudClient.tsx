"use client";

import BottomNav from "@/components/layout/BottomNav";
import CurrentOpportunityCard from "@/components/guidance/CurrentOpportunityCard";
import ExplorationPanel from "@/components/exploration/ExplorationPanel";
import ExplorationScreenSummary from "@/components/exploration/ExplorationScreenSummary";
import FirstSessionObjective from "@/components/guidance/FirstSessionObjective";
import HomeProgressionPanel from "@/components/home/HomeProgressionPanel";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import ConditionWidget from "@/components/home/ConditionWidget";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import MissionPanel from "@/components/home/MissionPanel";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { getProgressionMeaning } from "@/features/game/gameSelectors";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";

function getSelectedPath(alignment: FactionAlignment) {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const guidance = getFirstSessionGuidance(state);
  const progressionMeaning = getProgressionMeaning(state);
  const selectedPath = getSelectedPath(state.player.factionAlignment);

  const centerContent = (
    <div className="flex flex-col gap-4">
      <HomeProgressionPanel />
      <ExplorationScreenSummary />
      <FirstSessionObjective />
      <CurrentOpportunityCard />
      <ExplorationPanel />
    </div>
  );

  return (
    <>
      {/* MOBILE (< lg): single scrollable column */}
      <section className="fixed inset-x-4 top-[92px] bottom-[108px] z-30 overflow-y-auto lg:hidden">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4">
          {centerContent}
          <MissionPanel />
          <ConditionWidget
            path={selectedPath}
            rank={state.player.rank}
            rankLevel={state.player.rankLevel}
            rankXp={state.player.rankXp}
            rankXpToNext={state.player.rankXpToNext}
            condition={state.player.condition}
            hunger={state.player.hunger}
            masteryProgress={state.player.masteryProgress}
            loopStateLabel={guidance.stateLabel}
            nextStepLabel={guidance.nextStepLabel}
            progressionMeaning={progressionMeaning}
          />
          <FactionPathPanel selectedPath={selectedPath} onSelectPath={selectPath} />
        </div>
      </section>

      {/* DESKTOP (lg+): left rail */}
      <section className="absolute left-8 top-16 z-30 hidden w-[280px] xl:w-[300px] lg:block">
        <div className="flex flex-col gap-4">
          <MissionPanel />
          <ConditionWidget
            path={selectedPath}
            rank={state.player.rank}
            rankLevel={state.player.rankLevel}
            rankXp={state.player.rankXp}
            rankXpToNext={state.player.rankXpToNext}
            condition={state.player.condition}
            hunger={state.player.hunger}
            masteryProgress={state.player.masteryProgress}
            loopStateLabel={guidance.stateLabel}
            nextStepLabel={guidance.nextStepLabel}
            progressionMeaning={progressionMeaning}
          />
        </div>
      </section>

      {/* DESKTOP (lg+): center scrollable column */}
      <section className="pointer-events-none fixed inset-x-0 top-[76px] bottom-[120px] z-20 hidden overflow-y-auto lg:block">
        <div className="pointer-events-auto mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-4">
          {centerContent}
        </div>
      </section>

      {/* DESKTOP (lg+): right rail */}
      <section className="absolute right-8 top-16 z-30 hidden w-[300px] xl:w-[340px] lg:block">
        <FactionPathPanel selectedPath={selectedPath} onSelectPath={selectPath} />
      </section>

      {/* Resource strip */}
      <section className="fixed inset-x-0 bottom-[4.5rem] z-30 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <HomeResourceStrip />
        </div>
      </section>

      {/* Bottom nav */}
      <section className="fixed inset-x-4 bottom-4 z-30 lg:inset-x-8">
        <BottomNav />
      </section>
    </>
  );
}
