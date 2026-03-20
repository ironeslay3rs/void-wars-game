"use client";

import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";
import { STATUS_RECOVERY_COST } from "@/features/status/statusRecovery";

export default function StatusScreenSummary() {
  const { state } = useGame();
  const { player } = state;
  const guidance = getFirstSessionGuidance(state);
  const {
    recoveryCooldownRemainingSeconds,
    isRecoveryOnCooldown,
  } = useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const canAffordRecovery = player.resources.credits >= STATUS_RECOVERY_COST;

  if (player.condition < 40) {
    return (
      <ScreenStateSummary
        eyebrow="Condition State"
        title="Critical"
        consequence="Condition is critically low and is now the main blocker before another safe loop push."
        nextStep={
          isRecoveryOnCooldown
            ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s.`
            : canAffordRecovery
              ? "Recommended. Recover condition before returning to exploration or hunt."
              : `Blocked. Secure ${STATUS_RECOVERY_COST} credits, then recover condition.`
        }
        tone="critical"
      />
    );
  }

  if (guidance.nextAction === "recover" || player.condition < 60) {
    return (
      <ScreenStateSummary
        eyebrow="Condition State"
        title="Strained"
        consequence="Condition is under pressure and recovery should be considered before extending the current loop."
        nextStep={
          isRecoveryOnCooldown
            ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s.`
            : canAffordRecovery
              ? "Recommended. Recover condition now to stabilize the next loop step."
              : `Blocked. Recovery needs ${STATUS_RECOVERY_COST} credits.`
        }
        tone="warning"
      />
    );
  }

  return (
    <ScreenStateSummary
      eyebrow="Condition State"
      title="Stable"
      consequence="Condition is holding well enough to continue the current loop without urgent recovery."
      nextStep="Ready. Return home to explore again or resolve any active biotech lead."
      tone="ready"
    />
  );
}
