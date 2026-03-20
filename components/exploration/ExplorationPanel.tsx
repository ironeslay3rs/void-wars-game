"use client";

import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import { PHASE1_EXPLORATION_DURATION_MS } from "@/features/exploration/explorationData";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";

const PHASE1_EXPLORATION_TITLE = "Outer Wastes Exploration";

export default function ExplorationPanel() {
  const { state, dispatch } = useGame();
  const activeProcess = state.player.activeProcess;
  const { remainingSeconds, isRunning, isComplete } =
    useActiveProcessTimer(activeProcess);

  function handleStartExploration() {
    const startedAt = Date.now();

    dispatch({
      type: "START_EXPLORATION_PROCESS",
      payload: {
        id: `exploration-${startedAt}`,
        title: PHASE1_EXPLORATION_TITLE,
        sourceId: null,
        startedAt,
        endsAt: startedAt + PHASE1_EXPLORATION_DURATION_MS,
      },
    });
  }

  function handleResolveProcess() {
    dispatch({ type: "RESOLVE_ACTIVE_PROCESS" });
  }

  function handleClaimReward() {
    dispatch({ type: "CLAIM_EXPLORATION_REWARD" });
  }

  return (
    <SectionCard
      title="Exploration"
      description="Phase 1 always-active loop: start a run, check progress, then claim the reward."
    >
      <div className="space-y-4">
        {!activeProcess ? (
          <>
            <p className="text-sm text-white/60">
              No active exploration process is currently running.
            </p>

            <button
              type="button"
              onClick={handleStartExploration}
              className="w-full rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
            >
              Start Exploration
            </button>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Active Process
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                {activeProcess.title}
              </div>
              <div className="mt-2 text-sm text-white/60">
                {isRunning
                  ? `Exploration in progress. ${remainingSeconds}s remaining.`
                  : "Exploration complete. Reward ready to claim."}
              </div>
            </div>

            {isRunning ? (
              <button
                type="button"
                onClick={handleResolveProcess}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10"
              >
                Check Progress
              </button>
            ) : null}

            {isComplete ? (
              <button
                type="button"
                onClick={handleClaimReward}
                className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/15"
              >
                Claim Exploration Reward
              </button>
            ) : null}
          </>
        )}
      </div>
    </SectionCard>
  );
}
