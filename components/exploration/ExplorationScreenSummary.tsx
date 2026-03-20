"use client";

import { useGame } from "@/features/game/gameContext";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";

export default function ExplorationScreenSummary() {
  const { state } = useGame();
  const activeProcess = state.player.activeProcess;
  const { isRunning, isComplete } = useActiveProcessTimer(activeProcess);

  if (!activeProcess) {
    return (
      <ScreenStateSummary
        eyebrow="Exploration State"
        title="Idle"
        consequence="No exploration run is active, and no lead or reward is pending on this screen."
        nextStep="Review the current objective, then begin the next sweep."
        tone="neutral"
      />
    );
  }

  if (isRunning) {
    return (
      <ScreenStateSummary
        eyebrow="Exploration State"
        title="In Progress"
        consequence="The current sweep is underway. This screen will shift to Claim Ready when the timer completes."
        nextStep="Monitor the run here until the process resolves."
        tone="warning"
      />
    );
  }

  if (isComplete) {
    return (
      <ScreenStateSummary
        eyebrow="Exploration State"
        title="Claim Ready"
        consequence="This exploration run has resolved. The result is ready to be claimed from this screen."
        nextStep="Claim the result to advance the loop."
        tone="ready"
      />
    );
  }

  return null;
}
