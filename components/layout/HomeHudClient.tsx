"use client";

import BottomNav from "@/components/layout/BottomNav";
import ResourceBar from "@/components/layout/ResourceBar";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";
import ConditionWidget from "@/components/home/ConditionWidget";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import MissionPanel from "@/components/home/MissionPanel";
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
      <section className="fixed inset-x-4 top-[92px] bottom-[108px] z-30 overflow-y-auto lg:hidden">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4">
          <MissionPanel />

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
        </div>
      </section>

      {/* DESKTOP PANELS */}
      <section className="absolute left-8 top-16 z-30 hidden w-[320px] lg:block">
        <MissionPanel />
      </section>

      <section className="absolute right-8 top-16 z-30 hidden w-[320px] lg:block xl:w-[360px]">
        <FactionPathPanel
          selectedPath={getSelectedPath(state.player.factionAlignment)}
          onSelectPath={selectPath}
        />
      </section>

      <section className="absolute right-8 top-[420px] z-30 hidden w-[320px] lg:block xl:w-[360px]">
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

      {/* BOTTOM NAV */}
      <section className="absolute inset-x-4 bottom-4 z-30 lg:inset-x-8">
        <BottomNav />
      </section>
    </>
  );
}
