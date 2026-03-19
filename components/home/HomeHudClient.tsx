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
      <section className="absolute left-5 top-6 z-30 w-[270px] xl:left-7 xl:w-[290px]">
        <MainMenuLeftRail />
      </section>

      <section className="absolute inset-x-[300px] top-5 z-20 hidden h-[78vh] xl:block">
        <MainMenuCenterStage selectedPath={selectedPath} />
      </section>

      <section className="absolute right-5 top-6 z-30 w-[300px] xl:right-7 xl:w-[340px]">
        <MainMenuRightRail
          selectedPath={selectedPath}
          onSelectPath={selectPath}
          state={state}
        />
      </section>

      <section className="absolute inset-x-[300px] bottom-[92px] z-30 hidden xl:block">
        <ResourceBar values={state.player.resources} />
      </section>

      <section className="absolute inset-x-5 bottom-3 z-30 xl:inset-x-7">
        <BottomNav />
      </section>
    </>
  );
}