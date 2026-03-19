"use client";

import FactionPathPanel from "@/components/home/FactionPathPanel";
import ResourceBar from "@/components/layout/ResourceBar";
import BottomNav from "@/components/layout/BottomNav";
import MissionPanel from "@/components/home/MissionPanel";

import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";

function getSelectedPath(alignment: FactionAlignment) {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();

  return (
    <>
      {/* LEFT SIDE */}
      <section className="absolute left-8 top-16 z-30 w-[320px]">
        <MissionPanel />
      </section>

      {/* RIGHT SIDE */}
      <section className="absolute right-8 top-16 z-30 w-[320px] xl:w-[360px]">
        <FactionPathPanel
          selectedPath={getSelectedPath(state.player.factionAlignment)}
          onSelectPath={selectPath}
        />
      </section>

      {/* BOTTOM */}
      <section className="absolute inset-x-8 bottom-16 z-30">
        <ResourceBar values={state.player.resources} />
      </section>

      <section className="absolute inset-x-8 bottom-3 z-30">
        <BottomNav />
      </section>
    </>
  );
}