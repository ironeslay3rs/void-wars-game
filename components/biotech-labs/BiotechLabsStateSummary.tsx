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
        eyebrow="Biotech Hunt State"
        title="No Lead"
        consequence="No active specimen trace is available, so the biotech hunt cannot run from this screen yet."
        nextStep="Return to exploration, finish a run, and claim the result to activate a lead."
        tone="neutral"
      />
    );
  }

  if (guidance.nextAction === "recover") {
    return (
      <ScreenStateSummary
        eyebrow="Biotech Hunt State"
        title="Recommended Recovery"
        consequence="A viable specimen lead is active, but low condition makes recovery the safer next move before the hunt."
        nextStep="Recover condition first, then return here to resolve the hunt."
        tone="warning"
      />
    );
  }

  return (
    <ScreenStateSummary
      eyebrow="Biotech Hunt State"
      title="Lead Active"
      consequence="A viable specimen trace is locked and the hunt can be resolved immediately from this screen."
      nextStep="Run the specimen hunt to convert the lead into rewards."
      tone="ready"
    />
  );
}
