"use client";

import BottomNav from "@/components/layout/BottomNav";
import ResourceBar from "@/components/layout/ResourceBar";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";
import ConditionWidget from "@/components/home/ConditionWidget";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import MissionPanel from "@/components/home/MissionPanel";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

function getSelectedPath(alignment: FactionAlignment) {
  return alignment === "unbound" ? null : alignment;
}

export default function HomeHudClient() {
  const { state, selectPath } = useGame();
  const guidance = getFirstSessionGuidance(state);

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

      {/* CONDITION / STATUS */}
      <section className="absolute right-8 top-[420px] z-30 w-[320px] xl:w-[360px]">
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
        />
      </section>

      {/* RESOURCE BAR */}
      <section className="absolute inset-x-8 bottom-20 z-30">
        <ResourceBar values={state.player.resources} />
      </section>

      {/* BOTTOM NAV */}
      <section className="absolute inset-x-8 bottom-4 z-30">
        <BottomNav />
      </section>
    </>
  );
}
