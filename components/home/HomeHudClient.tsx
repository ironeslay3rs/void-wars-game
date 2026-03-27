"use client";

import Link from "next/link";
import MainMenuLeftRail from "@/components/home/MainMenuLeftRail";
import MainMenuCenterStage from "@/components/home/MainMenuCenterStage";
import MainMenuRightRail from "@/components/home/MainMenuRightRail";
import BottomNav from "@/components/layout/BottomNav";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";
import ConditionWidget from "@/components/home/ConditionWidget";
import MissionPanel from "@/components/home/MissionPanel";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { getProgressionMeaning } from "@/features/game/gameSelectors";

type PathSelection = Exclude<FactionAlignment, "unbound">;

function getSelectedPath(alignment: FactionAlignment): PathSelection | null {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const selectedPath = getSelectedPath(state.player.factionAlignment);
  const guidance = getFirstSessionGuidance(state);
  const progressionMeaning = getProgressionMeaning(state);

  return (
    <>
      <section className="fixed inset-x-3 top-[84px] bottom-[104px] z-30 overflow-y-auto lg:hidden">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 pb-4">
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
          <FactionPathPanel
            selectedPath={selectedPath}
            onSelectPath={selectPath}
          />
          <MissionPanel />
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/market"
              className="rounded-xl border border-white/15 bg-black/45 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/85"
            >
              Market
            </Link>
            <Link
              href="/market/black-market"
              className="rounded-xl border border-orange-300/25 bg-[linear-gradient(135deg,rgba(96,20,16,0.56),rgba(24,10,12,0.82))] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-amber-100/90"
            >
              Black Market
            </Link>
            <Link
              href="/social"
              className="rounded-xl border border-cyan-300/25 bg-black/45 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100/90"
            >
              Social
            </Link>
          </div>
        </div>
      </section>

      <section className="absolute left-5 top-6 z-30 hidden w-[270px] lg:block xl:left-7 xl:w-[290px]">
        <MainMenuLeftRail />
      </section>

      <section className="absolute inset-x-[300px] top-5 z-20 hidden h-[78vh] xl:block">
        <MainMenuCenterStage selectedPath={selectedPath} />
      </section>

      <section className="absolute right-5 top-6 z-30 hidden w-[300px] lg:block xl:right-7 xl:w-[340px]">
        <MainMenuRightRail
          selectedPath={selectedPath}
          onSelectPath={selectPath}
          state={state}
        />
      </section>

      <section className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 px-3 sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
          <HomeResourceStrip />
        </div>
      </section>

      <section className="absolute inset-x-3 bottom-3 z-30 xl:inset-x-7">
        <BottomNav />
      </section>
    </>
  );
}