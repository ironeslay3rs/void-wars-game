"use client";

import { UtensilsCrossed } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";

function getConditionTone(condition: number) {
  if (condition < 40) return "critical";
  if (condition < 60) return "strained";
  if (condition < 85) return "stable";
  return "primed";
}

function getConditionMessage(condition: number) {
  if (condition < 40) return "Critical. Recovery first, not bravado.";
  if (condition < 60) return "Strained. The Feast Hall is the fastest fix.";
  if (condition < 85) return "Stable. Recovery optional.";
  return "Primed. Save your salvage.";
}

function getFeastHallNextStep(params: {
  condition: number;
  hunger: number;
  isRecoveryOnCooldown: boolean;
  credits: number;
  bioSamples: number;
}) {
  const { condition, hunger, isRecoveryOnCooldown, credits, bioSamples } = params;
  if (isRecoveryOnCooldown) return "Kitchen lockout active. Wait or handle other business.";
  if (condition < 60) return "Condition is the main blocker. Take a plate now.";
  if (hunger < 35 && bioSamples > 0) return "Stores running thin. Stabilize before next run.";
  if (credits <= 0 && bioSamples <= 0) return "No payment, no plate. Run contracts for salvage.";
  return "Readiness holding. Reopen a contract or start the next field run.";
}

type OperativeReadinessProps = {
  serviceFeedback: string | null;
};

export default function OperativeReadiness({ serviceFeedback }: OperativeReadinessProps) {
  const { state } = useGame();
  const { player } = state;
  const { isRecoveryOnCooldown, recoveryCooldownRemainingSeconds } =
    useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const conditionTone = getConditionTone(player.condition);

  return (
    <SectionCard
      title="Operative Readiness"
      description="Condition, hunger, cooldown, and resource state."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Condition</div>
          <div className="mt-2 text-3xl font-black uppercase">{player.condition}%</div>
          <div className="mt-2 text-sm text-white/65">{getConditionMessage(player.condition)}</div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className={[
                "h-full rounded-full transition-all",
                conditionTone === "critical" ? "bg-red-400"
                  : conditionTone === "strained" ? "bg-amber-300"
                  : conditionTone === "stable" ? "bg-emerald-300"
                  : "bg-cyan-300",
              ].join(" ")}
              style={{ width: `${player.condition}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Hall Access</div>
          <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <UtensilsCrossed className="h-5 w-5 text-amber-300" />
            {isRecoveryOnCooldown ? "Kitchen cooling down" : "Kitchen ready"}
          </div>
          <div className="mt-2 text-sm text-white/65">
            {isRecoveryOnCooldown
              ? `Next service in ${recoveryCooldownRemainingSeconds}s.`
              : "No lockout active. Plates restore condition."}
          </div>
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50/88">
            {getFeastHallNextStep({
              condition: player.condition,
              hunger: player.hunger,
              isRecoveryOnCooldown,
              credits: player.resources.credits,
              bioSamples: player.resources.bioSamples,
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                {formatResourceLabel("credits")}
              </div>
              <div className="mt-1 font-semibold text-white">{player.resources.credits}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                {formatResourceLabel("bioSamples")}
              </div>
              <div className="mt-1 font-semibold text-white">{player.resources.bioSamples}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">Hunger</div>
              <div className="mt-1 font-semibold text-white">{player.hunger}%</div>
            </div>
          </div>
          {serviceFeedback ? (
            <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/90">
              {serviceFeedback}
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
