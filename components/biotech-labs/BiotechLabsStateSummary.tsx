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
        consequence="Biotech Labs only matters once the field produces a live specimen lead."
        nextStep="Return to exploration, finish a sweep, and claim the result."
        tone="neutral"
      />
    );
  }

  if (guidance.nextAction === "recover") {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Lead Active / Recovery Advised"
        consequence="A viable specimen lead is active, but survival pressure is high enough that recovery is the safer next move before commitment."
        nextStep="Recover condition first, then return here to resolve the hunt."
        tone="warning"
      />
    );
  }

  return (
    <ScreenStateSummary
      eyebrow="Loop State"
      title="Lead Active"
      consequence="A viable specimen trace is locked and this screen can convert it into a resolved hunt right now."
      nextStep="Commit to the specimen hunt, then review the payout and survival cost."
      tone="ready"
    />
  );
}
