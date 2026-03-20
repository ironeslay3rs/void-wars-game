"use client";

import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";

type OpportunityTone = "neutral" | "ready" | "warning";

type OpportunityState = {
  label: string;
  title: string;
  detail: string;
  tone: OpportunityTone;
};

const toneClassMap = {
  neutral: {
    border: "border-white/10",
    bg: "bg-white/[0.04]",
    chip: "border-white/12 bg-white/[0.05] text-white/65",
    title: "text-white",
    detail: "text-white/60",
  },
  ready: {
    border: "border-cyan-400/20",
    bg: "bg-cyan-400/8",
    chip: "border-cyan-300/25 bg-cyan-300/12 text-cyan-100",
    title: "text-cyan-50",
    detail: "text-cyan-50/82",
  },
  warning: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    chip: "border-amber-300/25 bg-amber-300/12 text-amber-100",
    title: "text-amber-50",
    detail: "text-amber-50/82",
  },
};

function getCurrentOpportunity(params: {
  hasBiotechSpecimenLead: boolean;
  hasMissionQueue: boolean;
  isExplorationRunning: boolean;
  isExplorationComplete: boolean;
  nextAction: "explore" | "hunt" | "recover";
}): OpportunityState {
  const {
    hasBiotechSpecimenLead,
    hasMissionQueue,
    isExplorationRunning,
    isExplorationComplete,
    nextAction,
  } = params;

  if (nextAction === "recover") {
    return {
      label: "Current Opportunity",
      title: "Stabilize before extending the loop.",
      detail: "Condition is strained. Recover in Status, then return to the field with a safer margin.",
      tone: "warning",
    };
  }

  if (isExplorationComplete) {
    return {
      label: "Current Opportunity",
      title: "Claim the exploration result.",
      detail: "The sweep is finished. Securing the reward will convert it into your next biotech lead.",
      tone: "ready",
    };
  }

  if (hasBiotechSpecimenLead) {
    return {
      label: "Current Opportunity",
      title: "Resolve the active specimen trace.",
      detail: "A biotech lead is live. Open Biotech Labs to turn that lead into rewards and progression.",
      tone: "ready",
    };
  }

  if (!isExplorationRunning) {
    return {
      label: "Current Opportunity",
      title: "Open the next sweep.",
      detail: "Exploration is the clearest way to push the main loop forward and surface your next biotech signal.",
      tone: "ready",
    };
  }

  if (!hasMissionQueue) {
    return {
      label: "Current Opportunity",
      title: "Put the shared queue to work.",
      detail: "Missions or Hunting Ground contracts can keep background progress moving while your current sweep runs.",
      tone: "neutral",
    };
  }

  return {
    label: "Current Opportunity",
    title: "Let the active timers work.",
    detail: "Your loop is already in motion. Check progress, watch the queue, and collect the next completed result.",
    tone: "neutral",
  };
}

export default function CurrentOpportunityCard() {
  const { state } = useGame();
  const guidance = getFirstSessionGuidance(state);
  const activeProcess = state.player.activeProcess;
  const { isRunning, isComplete } = useActiveProcessTimer(activeProcess);
  const opportunity = getCurrentOpportunity({
    hasBiotechSpecimenLead: state.player.hasBiotechSpecimenLead,
    hasMissionQueue: state.player.missionQueue.length > 0,
    isExplorationRunning: isRunning,
    isExplorationComplete: isComplete,
    nextAction: guidance.nextAction,
  });
  const toneClasses = toneClassMap[opportunity.tone];

  return (
    <section
      className={[
        "rounded-2xl border px-4 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-sm",
        toneClasses.border,
        toneClasses.bg,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            toneClasses.chip,
          ].join(" ")}
        >
          {opportunity.label}
        </div>
      </div>

      <div className={["mt-3 text-sm font-semibold", toneClasses.title].join(" ")}>
        {opportunity.title}
      </div>

      <p className={["mt-2 text-sm leading-6", toneClasses.detail].join(" ")}>
        {opportunity.detail}
      </p>
    </section>
  );
}
