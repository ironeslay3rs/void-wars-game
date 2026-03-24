"use client";

import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";
import {
  CONDITION_PRESSURE_PENALTY,
  CONDITION_PRESSURE_THRESHOLD,
  getConditionPressurePenalty,
  getStatusRecoveryAmount,
  hasStabilizationSigil,
  STATUS_RECOVERY_COST,
} from "@/features/status/statusRecovery";
import {
  HUNGER_PRESSURE_THRESHOLD,
  MOSS_RATION_RECIPE_COST,
} from "@/features/status/survival";

export default function StatusScreenSummary() {
  const { state } = useGame();
  const { player } = state;
  const guidance = getFirstSessionGuidance(state);
  const { recoveryCooldownRemainingSeconds, isRecoveryOnCooldown } =
    useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const stabilizationSigilActive = hasStabilizationSigil(player.knownRecipes);
  const recoveryAmount = getStatusRecoveryAmount(player.knownRecipes);
  const conditionPressurePenalty = getConditionPressurePenalty(
    player.condition,
  );
  const canAffordRecovery = player.resources.credits >= STATUS_RECOVERY_COST;
  const canCraftRation =
    player.resources.bioSamples >= MOSS_RATION_RECIPE_COST.bioSamples &&
    player.resources.runeDust >= MOSS_RATION_RECIPE_COST.runeDust;

  if (player.hunger < HUNGER_PRESSURE_THRESHOLD) {
    return (
      <ScreenStateSummary
        eyebrow="Survival State"
        title="Hungry"
        consequence="Hunger is feeding extra condition pressure. Stabilize before stretching the loop."
        nextStep={
          player.resources.mossRations > 0
            ? "Recommended. Use a Moss Ration to restore stores and ease survival pressure."
            : canCraftRation
              ? "Recommended. Bind a Moss Ration in the Crafting District, then return here to stabilize."
              : "Recommended. Run a short hunt or resolve an active biotech lead for fresh biomass, then bind a Moss Ration in the Crafting District."
        }
        tone="warning"
      />
    );
  }

  if (player.condition < 40) {
    return (
      <ScreenStateSummary
        eyebrow="Condition State"
        title="Critical"
        consequence={`Condition is critically low and now adds ${CONDITION_PRESSURE_PENALTY} extra condition loss to the next exploration or mission claim while you remain under ${CONDITION_PRESSURE_THRESHOLD}%.`}
        nextStep={
          isRecoveryOnCooldown
            ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s.`
            : canAffordRecovery
              ? stabilizationSigilActive
                ? `Recommended. Recover condition before returning to exploration or hunt. The sigil now restores ${recoveryAmount} condition safely.`
                : "Recommended. Recover condition before returning to exploration or hunt."
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
        consequence={
          conditionPressurePenalty > 0
            ? `Condition is under pressure and the next exploration or mission claim will lose an extra ${CONDITION_PRESSURE_PENALTY} condition until you recover above ${CONDITION_PRESSURE_THRESHOLD}%.`
            : "Condition is under pressure and recovery should be considered before extending the current loop."
        }
        nextStep={
          isRecoveryOnCooldown
            ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s.`
            : canAffordRecovery
              ? stabilizationSigilActive
                ? `Recommended. Recover condition now to stabilize the next loop step. The sigil raises the next recovery to ${recoveryAmount}.`
                : "Recommended. Recover condition now to stabilize the next loop step."
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
