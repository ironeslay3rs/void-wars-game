"use client";

import MainMenuLeftRail from "@/components/home/MainMenuLeftRail";
import MainMenuRightRail from "@/components/home/MainMenuRightRail";
import BottomNav from "@/components/layout/BottomNav";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import MissionPanel from "@/components/home/MissionPanel";
import HomeProgressionPanel from "@/components/home/HomeProgressionPanel";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";

function getSelectedPath(alignment: FactionAlignment) {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const selectedPath = getSelectedPath(state.player.factionAlignment);

  return (
    <>
      {/* MOBILE (< lg): single scrollable column */}
      <section
        className="fixed inset-x-3 top-[88px] z-30 overflow-y-auto lg:hidden"
        style={{ bottom: "calc(7rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4">
          <MissionPanel />
          <FactionPathPanel selectedPath={selectedPath} onSelectPath={selectPath} />
          <HomeProgressionPanel />
        </div>
      </section>

      {/* DESKTOP (lg+): left rail */}
      <div
        className="absolute left-5 top-[88px] z-30 hidden w-[290px] xl:w-[320px] lg:block"
        style={{ maxHeight: "calc(100dvh - 8rem)", overflowY: "auto" }}
      >
        <MainMenuLeftRail />
      </div>

      {/* DESKTOP (lg+): right rail */}
      <div
        className="absolute right-5 top-[88px] z-30 hidden w-[300px] xl:w-[340px] lg:block"
        style={{ maxHeight: "calc(100dvh - 8rem)", overflowY: "auto" }}
      >
        <MainMenuRightRail
          selectedPath={selectedPath}
          onSelectPath={selectPath}
          state={state}
        />
      </div>

      {/* Resource strip — above bottom nav */}
      <section
        className="fixed inset-x-0 z-30 px-3 sm:px-4"
        style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-5xl">
          <HomeResourceStrip />
        </div>
      </section>

      {/* Bottom nav */}
      <section
        className="fixed inset-x-3 z-30 lg:inset-x-5"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <BottomNav />
      </section>
    </>
  );
}
