"use client";

import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

const actionLabelMap = {
  explore: "Action: Explore",
  hunt: "Action: Hunt",
  recover: "Action: Recover",
};

const actionStyleMap = {
  explore: "border-cyan-400/30 bg-cyan-400/12 text-cyan-100",
  hunt: "border-emerald-400/30 bg-emerald-400/12 text-emerald-100",
  recover: "border-amber-400/30 bg-amber-400/12 text-amber-100",
};

export default function FirstSessionObjective() {
  const { state } = useGame();
  const guidance = getFirstSessionGuidance(state);

  return (
    <section className="rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(10,18,30,0.88),rgba(6,10,18,0.94))] px-5 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Primary Objective
          </div>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            {guidance.stateLabel}
          </div>
          <div className="mt-2 text-base font-semibold text-white md:text-lg">
            {guidance.objective}
          </div>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {guidance.detail}
          </p>
          <div className="mt-3 text-sm font-medium text-cyan-100/90">
            Next: {guidance.nextStepLabel}
          </div>
        </div>

        <div
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
            actionStyleMap[guidance.nextAction],
          ].join(" ")}
        >
          {actionLabelMap[guidance.nextAction]}
        </div>
      </div>
    </section>
  );
}
