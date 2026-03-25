"use client";

import { useGame } from "@/features/game/gameContext";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";

export default function ExplorationScreenSummary() {
  const { state } = useGame();
  const { player } = state;
  const activeProcess =
    player.activeProcess?.kind === "exploration" ? player.activeProcess : null;
  const { isRunning, isComplete } = useActiveProcessTimer(activeProcess);

  if (!activeProcess) {
    if (player.hasBiotechSpecimenLead) {
      return (
        <ScreenStateSummary
          eyebrow="Loop State"
          title="Specimen Lead Active"
          consequence="This field sweep already did its job. A live biotech lead is waiting, so exploration is not the next priority."
          nextStep="Leave the field surface and open Biotech Labs to resolve the hunt."
          tone="ready"
        />
      );
    }

    if (player.lastHuntResult) {
      return (
        <ScreenStateSummary
          eyebrow="Loop State"
          title="Hunt Aftermath"
          consequence="The last biotech hunt is already resolved. The haul is banked and the field loop is waiting on your next decision."
          nextStep={
            player.condition < 60
              ? "Recover first, then reopen exploration from a safer position."
              : "Open the next sweep when you are ready to re-enter the field."
          }
          tone={player.condition < 60 ? "warning" : "ready"}
        />
      );
    }

    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Exploration Ready"
        consequence="No sweep is running and no specimen lead is waiting. This is the start of the active field loop."
        nextStep="Begin the next exploration sweep to search for a live biotech signal."
        tone="neutral"
      />
    );
  }

  if (isRunning) {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Exploring"
        consequence="The current sweep is underway. The field is working and no new lead can be claimed until this run finishes."
        nextStep="Hold position, then claim the result when the sweep resolves."
        tone="warning"
      />
    );
  }

  if (isComplete) {
    return (
      <ScreenStateSummary
        eyebrow="Loop State"
        title="Claim Ready"
        consequence="This sweep is complete. Claiming it secures the haul and converts the run into the next active specimen lead."
        nextStep="Claim the result, then move from the field surface to Biotech Labs."
        tone="ready"
      />
    );
  }

  return null;
}
