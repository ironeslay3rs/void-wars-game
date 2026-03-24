"use client";

import MainMenuLeftRail from "@/components/home/MainMenuLeftRail";
import MainMenuCenterStage from "@/components/home/MainMenuCenterStage";
import MainMenuRightRail from "@/components/home/MainMenuRightRail";
import ResourceBar from "@/components/layout/ResourceBar";
import BottomNav from "@/components/layout/BottomNav";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

function getSelectedPath(alignment: FactionAlignment): PathSelection | null {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const selectedPath = getSelectedPath(state.player.factionAlignment);

  return (
    <>
      <div className="relative z-20 flex flex-col gap-4 px-4 pb-4 pt-20 sm:px-6 xl:hidden">
        <MainMenuCenterStage selectedPath={selectedPath} />
        <MainMenuLeftRail />
        <MainMenuRightRail
          selectedPath={selectedPath}
          onSelectPath={selectPath}
          state={state}
        />
        <ResourceBar values={state.player.resources} />
      </div>

      <section className="absolute left-5 top-6 z-30 hidden w-[270px] xl:left-7 xl:block xl:w-[290px]">
        <MainMenuLeftRail />
      </section>

      <section className="absolute inset-x-[300px] top-5 z-20 hidden h-[78vh] xl:block">
        <MainMenuCenterStage selectedPath={selectedPath} />
      </section>

      <section className="absolute right-5 top-6 z-30 hidden w-[300px] xl:right-7 xl:block xl:w-[340px]">
        <MainMenuRightRail
          selectedPath={selectedPath}
          onSelectPath={selectPath}
          state={state}
        />
      </section>

      <section className="absolute inset-x-[300px] bottom-[92px] z-30 hidden xl:block">
        <ResourceBar values={state.player.resources} />
      </section>

      <section className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,10,16,0.2),rgba(6,8,14,0.94))] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md xl:absolute xl:inset-x-5 xl:bottom-3 xl:border-t-0 xl:bg-transparent xl:px-0 xl:pb-0 xl:pt-0 xl:backdrop-blur-none xl:inset-x-7">
        <BottomNav />
      </section>
    </>
  );
}
