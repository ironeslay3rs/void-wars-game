import type { PlayerState } from "@/features/game/gameTypes";
import {
  getDoctrineQueueGateFromSnapshot,
  getLaunchDoctrineSnapshot,
  launchDoctrineThresholds,
} from "@/features/progression/launchDoctrine";

export type LaunchDirectiveTone = "critical" | "warning" | "ready";

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
};

export function getLaunchDirectives(player: PlayerState, now: number): LaunchDirective[] {
  const directives: LaunchDirective[] = [];
  const snapshot = getLaunchDoctrineSnapshot(player, now);
  const queueGate = getDoctrineQueueGateFromSnapshot(player, snapshot);

  if (snapshot.hasCriticalVitals) {
    directives.push({
      id: "stabilize",
      label: "Stabilize in Black Market",
      detail:
        "Condition or stores are critical. Recover before queueing another contract.",
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
        "Instability is high — paid recovery, rations, and stable vitals pull it down. Check Status for the full readout.",
      tone: "warning",
    });
  }

  if (player.lastHuntResult) {
    directives.push({
      id: "claim-payout",
      label: "Review latest settlement",
      detail:
        "Confirm payout, pressure cost, and next route before committing resources.",
      tone: "ready",
    });
  }

  if (!snapshot.hasCriticalVitals) {
    if (!queueGate.canQueue) {
      directives.push({
        id: "stabilize",
        label: "Clear launch blockers",
        detail: queueGate.reason ?? "Resolve doctrine blockers before extending the queue.",
        tone: "warning",
      });
    } else if (snapshot.queueLoad === 0) {
      directives.push({
        id: "queue-contract",
        label: "Queue a contract",
        detail: "Keep one active contract to maintain progression tempo.",
        tone: "warning",
      });
    } else if (snapshot.queueLoad < queueGate.cap) {
      directives.push({
        id: "queue-contract",
        label: "Extend contract chain",
        detail: "Add one mission to sustain cadence without overloading vitals.",
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
      label: "Re-enter the Void",
      detail: "Idle drift is growing. Deploy now to preserve salvage tempo.",
      tone: "warning",
    });
  }

  if (directives.length === 0) {
    directives.push({
      id: "deploy",
      label: "Maintain tempo",
      detail: "Loop is stable. Prepare, deploy, extract, and return alive.",
      tone: "ready",
    });
  }

  return directives.slice(0, 3);
}
