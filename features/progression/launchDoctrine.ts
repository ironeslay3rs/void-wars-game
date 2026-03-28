import type { PlayerState } from "@/features/game/gameTypes";

export type LaunchReadinessStatus = "critical" | "at-risk" | "stable" | "ready";
export type LaunchCadenceStatus = "broken" | "drifting" | "holding";
export type LaunchVitalsBand = "critical" | "low" | "stable";

export type LaunchReadiness = {
  score: number;
  status: LaunchReadinessStatus;
  blockers: string[];
  summary: string;
};

export type LaunchDoctrineSnapshot = {
  conditionBand: LaunchVitalsBand;
  hungerBand: LaunchVitalsBand;
  queueLoad: number;
  idleMinutes: number;
  readinessScore: number;
  readinessStatus: LaunchReadinessStatus;
  cadenceStatus: LaunchCadenceStatus;
  hasCriticalVitals: boolean;
};

export type DoctrineQueueGate = {
  canQueue: boolean;
  cap: number;
  reason: string | null;
  readiness: LaunchReadiness;
  snapshot: LaunchDoctrineSnapshot;
};

export const launchDoctrineThresholds = {
  criticalCondition: 45,
  warningCondition: 60,
  criticalHunger: 35,
  warningHunger: 55,
  staleIdleMinutes: 45,
  driftIdleMinutes: 90,
};

function getVitalsBand(value: number, critical: number, warning: number): LaunchVitalsBand {
  if (value < critical) return "critical";
  if (value < warning) return "low";
  return "stable";
}

function getReadinessStatusFromScore(score: number): LaunchReadinessStatus {
  if (score < 45) return "critical";
  if (score < 65) return "at-risk";
  if (score < 82) return "stable";
  return "ready";
}

function getCadenceStatus(queueLoad: number, idleMinutes: number): LaunchCadenceStatus {
  if (queueLoad === 0 && idleMinutes >= launchDoctrineThresholds.driftIdleMinutes) {
    return "broken";
  }

  if (queueLoad === 0 || idleMinutes >= launchDoctrineThresholds.staleIdleMinutes) {
    return "drifting";
  }

  return "holding";
}

function getReadinessSummary(status: LaunchReadinessStatus): string {
  if (status === "critical") {
    return "Vitals are unstable. Stabilize before redeploying.";
  }

  if (status === "at-risk") {
    return "Vitals are pressured. Recover before extending contracts.";
  }

  if (status === "stable") {
    return "Vitals are holding. Maintain pressure with controlled risk.";
  }

  return "Vitals are ready. Convert momentum into growth.";
}

function getReadinessBlockers(snapshot: LaunchDoctrineSnapshot): string[] {
  const blockers: string[] = [];

  if (snapshot.conditionBand === "critical") {
    blockers.push("Condition is critical.");
  } else if (snapshot.conditionBand === "low") {
    blockers.push("Condition is strained.");
  }

  if (snapshot.hungerBand === "critical") {
    blockers.push("Stores are close to empty.");
  } else if (snapshot.hungerBand === "low") {
    blockers.push("Stores are trending low.");
  }

  if (snapshot.cadenceStatus === "broken") {
    blockers.push("Contract chain collapsed and idle drift is severe.");
  } else if (snapshot.cadenceStatus === "drifting") {
    blockers.push(snapshot.queueLoad === 0 ? "No active contract chain." : "Idle drift is widening.");
  }

  return blockers.slice(0, 3);
}

function buildLaunchReadiness(snapshot: LaunchDoctrineSnapshot): LaunchReadiness {
  return {
    score: snapshot.readinessScore,
    status: snapshot.readinessStatus,
    blockers: getReadinessBlockers(snapshot),
    summary: getReadinessSummary(snapshot.readinessStatus),
  };
}

export function getLaunchDoctrineSnapshot(
  player: PlayerState,
  now: number,
): LaunchDoctrineSnapshot {
  const queueLoad = player.missionQueue.length;
  const idleMinutes = Math.max(
    0,
    Math.floor((now - (player.lastHuntResult?.resolvedAt ?? player.lastConditionTickAt)) / 60000),
  );

  const conditionBand = getVitalsBand(
    player.condition,
    launchDoctrineThresholds.criticalCondition,
    launchDoctrineThresholds.warningCondition,
  );
  const hungerBand = getVitalsBand(
    player.hunger,
    launchDoctrineThresholds.criticalHunger,
    launchDoctrineThresholds.warningHunger,
  );

  const hasCriticalVitals = conditionBand === "critical" || hungerBand === "critical";

  let readinessScore = 100;
  readinessScore -= conditionBand === "critical" ? 30 : conditionBand === "low" ? 15 : 0;
  readinessScore -= hungerBand === "critical" ? 24 : hungerBand === "low" ? 10 : 0;
  readinessScore = Math.max(0, Math.min(100, readinessScore));

  return {
    conditionBand,
    hungerBand,
    queueLoad,
    idleMinutes,
    readinessScore,
    readinessStatus: getReadinessStatusFromScore(readinessScore),
    cadenceStatus: getCadenceStatus(queueLoad, idleMinutes),
    hasCriticalVitals,
  };
}

export function getLaunchReadiness(player: PlayerState, now: number): LaunchReadiness {
  const snapshot = getLaunchDoctrineSnapshot(player, now);
  return buildLaunchReadiness(snapshot);
}

export function getDoctrineQueueCapFromSnapshot(
  player: PlayerState,
  snapshot: LaunchDoctrineSnapshot,
): number {
  const baselineCap = Math.max(1, player.maxMissionQueueSlots);

  if (snapshot.hasCriticalVitals) {
    return 0;
  }

  let cap = baselineCap;

  if (snapshot.readinessStatus === "at-risk") {
    cap = Math.max(1, baselineCap - 1);
  }

  if (snapshot.cadenceStatus === "broken" && snapshot.queueLoad > 0) {
    cap = Math.max(1, cap - 1);
  }

  return cap;
}

export function getDoctrineQueueCap(player: PlayerState, now: number): number {
  const snapshot = getLaunchDoctrineSnapshot(player, now);
  return getDoctrineQueueCapFromSnapshot(player, snapshot);
}

export function getDoctrineQueueGateFromSnapshot(
  player: PlayerState,
  snapshot: LaunchDoctrineSnapshot,
): DoctrineQueueGate {
  const readiness = buildLaunchReadiness(snapshot);
  const cap = getDoctrineQueueCapFromSnapshot(player, snapshot);

  if (snapshot.hasCriticalVitals) {
    return {
      canQueue: false,
      cap,
      reason:
        "Launch doctrine lock: condition or stores are critical. Stabilize before queueing a new contract.",
      readiness,
      snapshot,
    };
  }

  if (snapshot.queueLoad >= cap) {
    return {
      canQueue: false,
      cap,
      reason: `Queue cap reached (${snapshot.queueLoad}/${cap}).`,
      readiness,
      snapshot,
    };
  }

  if (snapshot.readinessStatus === "critical") {
    return {
      canQueue: false,
      cap,
      reason: "Launch doctrine lock: recovery required before extending contracts.",
      readiness,
      snapshot,
    };
  }

  if (snapshot.cadenceStatus === "broken" && snapshot.queueLoad > 0) {
    return {
      canQueue: false,
      cap,
      reason: "Cadence lock: restore loop tempo before extending this chain.",
      readiness,
      snapshot,
    };
  }

  return {
    canQueue: true,
    cap,
    reason: null,
    readiness,
    snapshot,
  };
}

export function getDoctrineQueueGate(player: PlayerState, now: number): DoctrineQueueGate {
  const snapshot = getLaunchDoctrineSnapshot(player, now);
  return getDoctrineQueueGateFromSnapshot(player, snapshot);
}
