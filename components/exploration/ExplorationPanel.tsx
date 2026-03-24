"use client";

import SectionCard from "@/components/shared/SectionCard";
import { EXPLORATION_FIELD_RATION_COST } from "@/config/survival";
import { useGame } from "@/features/game/gameContext";
import {
  PHASE1_EXPLORATION_DURATION_MS,
  phase1ExplorationReward,
} from "@/features/exploration/explorationData";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";
import {
  formatResourceLabel,
  getNonZeroResourceEntries,
} from "@/features/game/gameFeedback";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

const PHASE1_EXPLORATION_TITLE = "Outer Wastes Exploration";

export default function ExplorationPanel() {
  const { state, dispatch } = useGame();
  const activeProcess = state.player.activeProcess;
  const hasRequiredRations =
    state.player.resources.fieldRations >= EXPLORATION_FIELD_RATION_COST;
  const guidance = getFirstSessionGuidance(state);
  const { remainingSeconds, isRunning, isComplete } =
    useActiveProcessTimer(activeProcess);
  const shouldHighlightStartAction =
    !activeProcess && guidance.nextAction === "explore";
  const rewardResourceEntries = getNonZeroResourceEntries(
    phase1ExplorationReward.resources ?? {},
  );
  const idleActionMessage =
    !hasRequiredRations
      ? `Blocked. Exploration requires ${EXPLORATION_FIELD_RATION_COST} field ration from the Crafting District or scavenged stock.`
      : guidance.nextAction === "explore"
        ? "Ready. This control starts the next exploration sweep."
      : guidance.nextAction === "hunt"
        ? "Available. Exploration can start here, but an active biotech lead should be resolved first."
        : "Available. Exploration can start here, but recovery should come first.";

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
      description="Main loop starting point: run a sweep, wait for completion, then claim the lead that opens Biotech Labs."
    >
      <div className="space-y-4">
        {!activeProcess ? (
          <>
            <p className="text-sm text-white/60">
              Exploration is where the main loop begins. Start a sweep to search the wastes for the next biotech signal.
            </p>

            <button
              type="button"
              onClick={handleStartExploration}
              disabled={!hasRequiredRations}
              className={[
                "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                !hasRequiredRations
                  ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                  : shouldHighlightStartAction
                  ? "border border-cyan-300/60 bg-cyan-400/16 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_28px_rgba(34,211,238,0.2)] hover:border-cyan-200/80 hover:bg-cyan-400/20"
                  : "border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-400/15",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  {hasRequiredRations
                    ? "Start Exploration"
                    : "Need Field Rations"}
                </span>
                {hasRequiredRations && shouldHighlightStartAction ? (
                  <span className="rounded-full border border-cyan-300/40 bg-cyan-300/14 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-50">
                    First Step
                  </span>
                ) : null}
              </span>
            </button>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/60">
              {idleActionMessage}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-3 text-sm text-amber-50/90">
              Survival Cost: {EXPLORATION_FIELD_RATION_COST} field ration per sweep. Current stock: {state.player.resources.fieldRations}.
            </div>
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

            {isComplete ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                      Exploration Result
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">
                      Wasteland sweep complete.
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Claiming this result secures recovered supplies and converts the sweep into a fresh biotech lead.
                    </p>
                  </div>

                  <div className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                    Lead Ready
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                      Rank XP
                    </div>
                    <div className="mt-2 text-xl font-bold text-white">
                      +{phase1ExplorationReward.rankXp}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                      Mastery
                    </div>
                    <div className="mt-2 text-xl font-bold text-white">
                      +{phase1ExplorationReward.masteryProgress}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                      Influence
                    </div>
                    <div className="mt-2 text-xl font-bold text-white">
                      +{phase1ExplorationReward.influence ?? 0}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {rewardResourceEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <span className="text-sm uppercase tracking-[0.06em] text-white/70">
                        {formatResourceLabel(key)}
                      </span>
                      <span className="text-sm font-bold text-emerald-100">
                        +{value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-3 text-sm text-cyan-50/90">
                  Next Step: claim the reward to secure the biotech lead, then open Biotech Labs to initiate the hunt.
                </div>
              </div>
            ) : null}

            {isRunning ? (
              <>
                <button
                  type="button"
                  onClick={handleResolveProcess}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10"
                >
                  Check Progress
                </button>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/60">
                  Local Status: claim stays locked until this process finishes.
                </div>
              </>
            ) : null}

            {isComplete ? (
              <>
                <button
                  type="button"
                  onClick={handleClaimReward}
                  className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/15"
                >
                  Claim Reward and Secure Lead
                </button>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-3 text-sm text-emerald-50/90">
                  Local Status: claim is ready. Securing this result activates the biotech lead.
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </SectionCard>
  );
}
