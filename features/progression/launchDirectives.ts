import type { PlayerState } from "@/features/game/gameTypes";
import {
  getDoctrineQueueGateFromSnapshot,
  getLaunchDoctrineSnapshot,
  launchDoctrineThresholds,
} from "@/features/progression/launchDoctrine";

export type LaunchDirectiveTone = "critical" | "warning" | "ready";
export type LaunchDirectiveIntent = "survival" | "dominance" | "neutral";

export type LaunchDirective = {
  id:
    | "stabilize"
    | "queue-contract"
    | "claim-payout"
    | "deploy"
    | "void-strain";
  label: string;
  detail: string;
  tone: LaunchDirectiveTone;
  intent?: LaunchDirectiveIntent;
};

function getTopDirectiveIntent(
  player: PlayerState,
  now: number,
): LaunchDirectiveIntent {
  const snapshot = getLaunchDoctrineSnapshot(player, now);

  const survivalMode =
    snapshot.hasCriticalVitals ||
    snapshot.conditionBand === "low" ||
    snapshot.hungerBand === "low" ||
    snapshot.readinessStatus === "critical" ||
    snapshot.readinessStatus === "at-risk";

  if (survivalMode) {
    return "survival";
  }

  const dominanceMode =
    snapshot.conditionBand === "stable" &&
    snapshot.hungerBand === "stable" &&
    snapshot.queueLoad > 0 &&
    snapshot.readinessStatus === "ready" &&
    snapshot.cadenceStatus === "holding";

  if (dominanceMode) {
    return "dominance";
  }

  return "neutral";
}

function applyIntentLayer(
  directive: LaunchDirective,
  intent: LaunchDirectiveIntent,
): LaunchDirective {
  if (intent === "survival") {
    return {
      ...directive,
      intent,
      detail: `${directive.detail} The body is not holding — do not press deeper yet.`,
    };
  }

  if (intent === "dominance") {
    return {
      ...directive,
      intent,
      detail: `${directive.detail} Your footing is strong — press while the lane still belongs to you.`,
    };
  }

  return {
    ...directive,
    intent,
  };
}

export function getLaunchDirectives(player: PlayerState, now: number): LaunchDirective[] {
  const directives: LaunchDirective[] = [];
  const snapshot = getLaunchDoctrineSnapshot(player, now);
  const queueGate = getDoctrineQueueGateFromSnapshot(player, snapshot);

  if (snapshot.hasCriticalVitals) {
    directives.push({
      id: "stabilize",
      label: "Stabilize in Black Market",
      detail:
        "Condition or stores are critical. Return to the Black Market, steady the body, and refuse the next push for now.",
      tone: "critical",
    });
  }

  if (
    !snapshot.hasCriticalVitals &&
    player.voidInstability >= 58 &&
    player.condition >= 45
  ) {
    directives.push({
      id: "void-strain",
      label: "Bleed Void infusion",
      detail:
        "Void pressure is rising through the frame. Recovery, rations, and a steadier body will bleed it off before the next launch.",
      tone: "warning",
    });
  }

  if (player.lastHuntResult) {
    directives.push({
      id: "claim-payout",
      label: "Close the return",
      detail:
        "Read the settlement first. What you carried home decides whether you recover, prep again, or press the next lane.",
      tone: "ready",
    });
  }

  if (!snapshot.hasCriticalVitals) {
    if (!queueGate.canQueue) {
      directives.push({
        id: "stabilize",
        label: "Prep before launch",
        detail:
          queueGate.reason ??
          "The loop is not ready to take another contract yet. Steady the lane before you extend it.",
        tone: "warning",
      });
    } else if (snapshot.queueLoad === 0) {
      directives.push({
        id: "queue-contract",
        label: "Prep the next contract",
        detail:
          "No chain is holding. Open Missions, choose the next job, and put fresh pressure back into the loop.",
        tone: "warning",
      });
    } else {
      directives.push({
        id: "deploy",
        label: "Deploy the current chain",
        detail:
          "The contract is already primed. Leave the hub, enter the Void, and turn prepared pressure into return.",
        tone: "ready",
      });
    }

    if (snapshot.queueLoad > 0 && snapshot.queueLoad < queueGate.cap) {
      directives.push({
        id: "queue-contract",
        label: "Prep the follow-up",
        detail:
          "If the body is still holding after this run, add one more contract so the return feeds directly into the next push.",
        tone: "ready",
      });
    }
  }

  if (
    snapshot.idleMinutes >= launchDoctrineThresholds.staleIdleMinutes &&
    !snapshot.hasCriticalVitals
  ) {
    directives.push({
      id: "deploy",
      label: "Break idle drift",
      detail:
        "You have been sitting too long. Re-enter the Void now or the lane goes cold and the return thins out.",
      tone: "warning",
    });
  }

  if (directives.length === 0) {
    directives.push({
      id: "deploy",
      label: "Keep the loop turning",
      detail:
        "Prep is clean, deployment is open, and the return is still in your favor. Move before the pressure shifts.",
      tone: "ready",
    });
  }

  const limitedDirectives = directives.slice(0, 3);
  const topIntent = getTopDirectiveIntent(player, now);

  return limitedDirectives.map((directive, index) =>
    index === 0 ? applyIntentLayer(directive, topIntent) : directive,
  );
}
