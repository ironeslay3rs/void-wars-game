"use client";

import BottomNav from "@/components/layout/BottomNav";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";
import ConditionWidget from "@/components/home/ConditionWidget";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import MissionPanel from "@/components/home/MissionPanel";
import HomeProgressionPanel from "@/components/home/HomeProgressionPanel";
import ExplorationScreenSummary from "@/components/exploration/ExplorationScreenSummary";
import FirstSessionObjective from "@/components/guidance/FirstSessionObjective";
import CurrentOpportunityCard from "@/components/guidance/CurrentOpportunityCard";
import ExplorationPanel from "@/components/exploration/ExplorationPanel";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { getProgressionMeaning } from "@/features/game/gameSelectors";

function getSelectedPath(alignment: FactionAlignment) {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const guidance = getFirstSessionGuidance(state);
  const progressionMeaning = getProgressionMeaning(state);

  return (
    <>
      {/* MOBILE STACK (single column, scrollable) */}
      <section className="fixed inset-x-3 top-[84px] bottom-[104px] z-30 overflow-y-auto lg:hidden">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 pb-4">
          <ConditionWidget
            path={getSelectedPath(state.player.factionAlignment)}
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

          <FactionPathPanel
            selectedPath={getSelectedPath(state.player.factionAlignment)}
            onSelectPath={selectPath}
          />
          <MissionPanel />
          <div className="hidden sm:block">
            <HomeProgressionPanel />
          </div>
          <div className="hidden sm:block">
            <ExplorationScreenSummary />
          </div>
          <FirstSessionObjective />
          <div className="hidden sm:block">
            <CurrentOpportunityCard />
          </div>
          <div className="mx-auto hidden w-full max-w-md sm:block">
            <ExplorationPanel />
          </div>
        </div>
      </section>

      {/* DESKTOP PANELS */}
      <section className="absolute left-8 top-16 z-30 hidden w-[320px] lg:block">
        <ConditionWidget
          path={getSelectedPath(state.player.factionAlignment)}
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
      </section>

      <section className="absolute inset-x-0 top-20 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-30 hidden overflow-y-auto px-4 lg:block">
        <div className="mx-auto flex w-full max-w-[740px] flex-col gap-4 pb-6">
          <HomeProgressionPanel />
          <ExplorationScreenSummary />
          <MissionPanel />
          <FirstSessionObjective />
          <CurrentOpportunityCard />
          <div className="mx-auto w-full max-w-md">
            <ExplorationPanel />
          </div>
        </div>
      </section>

      <section className="absolute right-8 top-16 z-30 hidden w-[320px] lg:block xl:w-[360px]">
        <FactionPathPanel
          selectedPath={getSelectedPath(state.player.factionAlignment)}
          onSelectPath={selectPath}
        />
      </section>

      <section className="absolute right-8 top-[430px] z-30 hidden w-[320px] lg:block xl:w-[360px]">
        <CurrentOpportunityCard />
      </section>

      <section className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 px-4 sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
          <HomeResourceStrip />
        </div>
      </section>

      {/* BOTTOM NAV */}
      <section className="absolute inset-x-4 bottom-4 z-30 lg:inset-x-8">
        <BottomNav />
      </section>
    </>
  );
}
