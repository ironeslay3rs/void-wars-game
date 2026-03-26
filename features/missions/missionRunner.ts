import type { MissionDefinition, MissionQueueEntry } from "@/features/game/gameTypes";
import type { GameAction } from "@/features/game/gameTypes";

export type MissionStatus = "pending" | "active" | "complete";

export function queueMission(
  dispatch: React.Dispatch<GameAction>,
  missionId: string,
) {
  dispatch({
    type: "QUEUE_MISSION",
    payload: { missionId },
  });
}

/**
 * Forces a queue sync tick so completed entries resolve rewards immediately.
 * GameProvider also runs this every second; this is an explicit boundary trigger.
 */
export function onMissionComplete(
  dispatch: React.Dispatch<GameAction>,
  now = Date.now(),
) {
  dispatch({
    type: "PROCESS_MISSION_QUEUE",
    payload: { now },
  });
}

export function getMissionStatus(entry: MissionQueueEntry, now: number): MissionStatus {
  if (entry.completedAt !== null || entry.endsAt <= now) return "complete";
  if (now < entry.startsAt) return "pending";
  return "active";
}

export function getSecondsRemaining(targetTimeMs: number, now: number) {
  return Math.max(0, Math.ceil((targetTimeMs - now) / 1000));
}

export function buildMissionResultSummary(mission: MissionDefinition) {
  const resources = Object.entries(mission.reward.resources ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] !== 0,
  );

  return {
    title: mission.title,
    rankXp: mission.reward.rankXp,
    masteryProgress: mission.reward.masteryProgress,
    influence: mission.reward.influence ?? 0,
    conditionDelta: mission.reward.conditionDelta,
    resources,
  };
}

