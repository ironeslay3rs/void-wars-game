"use client";

import { useGame } from "@/features/game/gameContext";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";

export default function ExplorationScreenSummary() {
  const { state } = useGame();
  const { player } = state;
  const activeProcess = player.activeProcess;
  const { isRunning, isComplete } = useActiveProcessTimer(activeProcess);

  if (!activeProcess) {
    if (player.hasBiotechSpecimenLead) {
      return (
        <ScreenStateSummary
          eyebrow="Loop State"
          title="Specimen Lead Active"
          consequence="Exploration is clear for now. The last claimed sweep has already produced a live biotech lead."
          nextStep="Open Biotech Labs and resolve the specimen hunt."
          tone="ready"
        />
      );
    }

    if (player.lastHuntResult) {
      return (
        <ScreenStateSummary
          eyebrow="Loop State"
          title="Hunt Aftermath"
          consequence="The last biotech hunt is already resolved. Rewards are applied and the field loop is waiting on your next decision."
          nextStep={
            player.condition < 60
              ? "Stabilize in Status before opening another sweep."
              : "Begin the next exploration sweep when ready."
          }
          tone={player.condition < 60 ? "warning" : "ready"}
        />
      );
    }

    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Exploration Ready"
        consequence="No sweep is running and no specimen lead is waiting. The loop is idle at its starting point."
        nextStep="Begin the next exploration sweep."
        tone="neutral"
      />
    );
  }

  if (isRunning) {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Exploring"
        consequence="The current sweep is underway. No new lead can be claimed until this run finishes."
        nextStep="Hold here until the timer resolves, then claim the result."
        tone="warning"
      />
    );
  }

  if (isComplete) {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Claim Ready"
        consequence="This sweep is complete. Claiming it converts the run into the next active specimen lead."
        nextStep="Claim the result, then move to Biotech Labs."
        tone="ready"
      />
    );
  }

  return null;
}
