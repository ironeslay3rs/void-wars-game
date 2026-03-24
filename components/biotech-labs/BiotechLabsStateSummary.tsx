"use client";

import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

export default function BiotechLabsStateSummary() {
  const { state } = useGame();
  const hasBiotechSpecimenLead = state.player.hasBiotechSpecimenLead;
  const guidance = getFirstSessionGuidance(state);

  if (!hasBiotechSpecimenLead) {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="No specimen leads available."
        consequence="Exploration generates specimen leads."
        nextStep="Return to exploration, finish a run, and claim the result."
        tone="neutral"
      />
    );
  }

  if (guidance.nextAction === "recover") {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Lead Active / Recovery Advised"
        consequence="A viable specimen lead is active, but survival pressure is high enough that recovery is the safer next move before the hunt."
        nextStep="Recover condition first, then return here to resolve the hunt."
        tone="warning"
      />
    );
  }

  return (
    <ScreenStateSummary
      eyebrow="Loop State"
      title="Lead Active"
      consequence="A viable specimen trace is locked and the hunt can be resolved immediately from this screen."
      nextStep="Run the specimen hunt to convert the lead into rewards."
      tone="ready"
    />
  );
}
