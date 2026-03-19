"use client";

import FactionPathPanel from "@/components/home/FactionPathPanel";
import ConditionWidget from "@/components/home/ConditionWidget";
import ResourceBar from "@/components/layout/ResourceBar";
import BottomNav from "@/components/layout/BottomNav";
import { useGame } from "@/features/game/gameContext";

export default function HomeHudClient() {
  const { state, selectPath } = useGame();

  return (
    <>
      <section className="absolute right-8 top-16 z-30 w-[320px] xl:w-[360px]">
        <FactionPathPanel
          selectedPath={state.path}
          onSelectPath={selectPath}
        />
      </section>

      <section className="absolute right-8 bottom-28 z-30 w-[320px] xl:w-[360px]">
        <ConditionWidget
          path={state.path}
          rank={state.rank}
          rankLevel={state.rankLevel}
          rankXp={state.rankXp}
          rankXpToNext={state.rankXpToNext}
          condition={state.condition}
          masteryProgress={state.masteryProgress}
          activeMissionId={state.activeMissionId}
        />
      </section>

      <section className="absolute inset-x-8 bottom-16 z-30">
        <ResourceBar
          credits={state.credits}
          voidCrystals={state.voidCrystals}
          bioEssence={state.bioEssence}
        />
      </section>

      <section className="absolute inset-x-8 bottom-3 z-30">
        <BottomNav />
      </section>
    </>
  );
}