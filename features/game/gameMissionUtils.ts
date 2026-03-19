import { buildNavigationState } from "@/features/navigation/navigationUtils";
import type {
  GameState,
  MissionDefinition,
  MissionQueueEntry,
  MissionReward,
  PathType,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getRankName(level: number) {
  if (level >= 10) return "Ascendant";
  if (level >= 7) return "Elite";
  if (level >= 4) return "Vanguard";
  return "Initiate";
}

export function getXpToNext(level: number) {
  return 100 + (level - 1) * 25;
}

export function applyRankXp(
  rankLevel: number,
  rankXp: number,
  gainedXp: number,
): { rankLevel: number; rankXp: number; rankXpToNext: number; rank: string } {
  let nextLevel = rankLevel;
  let nextXp = rankXp + gainedXp;
  let nextXpToNext = getXpToNext(nextLevel);

  while (nextXp >= nextXpToNext) {
    nextXp -= nextXpToNext;
    nextLevel += 1;
    nextXpToNext = getXpToNext(nextLevel);
  }

  return {
    rankLevel: nextLevel,
    rankXp: nextXp,
    rankXpToNext: nextXpToNext,
    rank: getRankName(nextLevel),
  };
}

export function canAccessMission(
  mission: MissionDefinition,
  selectedPath: PathType | "unbound",
) {
  if (mission.path === "neutral") return true;
  return mission.path === selectedPath;
}

export function addPartialResources(
  current: ResourcesState,
  incoming?: Partial<ResourcesState>,
): ResourcesState {
  if (!incoming) return current;

  return {
    credits: current.credits + (incoming.credits ?? 0),
    ironOre: current.ironOre + (incoming.ironOre ?? 0),
    scrapAlloy: current.scrapAlloy + (incoming.scrapAlloy ?? 0),
    runeDust: current.runeDust + (incoming.runeDust ?? 0),
    emberCore: current.emberCore + (incoming.emberCore ?? 0),
    bioSamples: current.bioSamples + (incoming.bioSamples ?? 0),
  };
}

export function applyMissionReward(
  player: PlayerState,
  reward: MissionReward,
): PlayerState {
  const rankState = applyRankXp(player.rankLevel, player.rankXp, reward.rankXp);

  return {
    ...player,
    ...rankState,
    masteryProgress: clamp(
      player.masteryProgress + reward.masteryProgress,
      0,
      100,
    ),
    condition: clamp(player.condition + reward.conditionDelta, 0, 100),
    influence: Math.max(0, player.influence + (reward.influence ?? 0)),
    resources: addPartialResources(player.resources, reward.resources),
    navigation: buildNavigationState(
      rankState.rankLevel,
      player.unlockedRoutes,
      player.navigation.currentRoute,
    ),
  };
}

export function getMissionDurationMs(mission: MissionDefinition) {
  return mission.durationHours * 60 * 60 * 1000;
}

export function getMissionById(
  missions: MissionDefinition[],
  missionId: string,
) {
  return missions.find((mission) => mission.id === missionId) ?? null;
}

export function buildMissionQueueEntry(params: {
  mission: MissionDefinition;
  queuedAt: number;
  anchorTime: number;
}): MissionQueueEntry {
  const { mission, queuedAt, anchorTime } = params;
  const startsAt = anchorTime;
  const endsAt = startsAt + getMissionDurationMs(mission);

  return {
    queueId: `${mission.id}-${queuedAt}-${Math.random().toString(36).slice(2, 8)}`,
    missionId: mission.id,
    queuedAt,
    startsAt,
    endsAt,
    completedAt: null,
  };
}

export function rebuildMissionQueueSchedule(params: {
  queue: MissionQueueEntry[];
  missions: MissionDefinition[];
  now: number;
}) {
  const { queue, missions, now } = params;

  let anchorTime = now;

  return queue.map((entry) => {
    const mission = getMissionById(missions, entry.missionId);

    if (!mission) {
      return entry;
    }

    const isAlreadyFinished = entry.endsAt <= now;
    const isCurrentlyActive = entry.startsAt <= now && now < entry.endsAt;

    if (isAlreadyFinished || isCurrentlyActive) {
      anchorTime = entry.endsAt;
      return entry;
    }

    const startsAt = Math.max(anchorTime, now);
    const endsAt = startsAt + getMissionDurationMs(mission);

    const nextEntry: MissionQueueEntry = {
      ...entry,
      startsAt,
      endsAt,
      completedAt:
        entry.completedAt !== null && entry.completedAt >= endsAt
          ? entry.completedAt
          : null,
    };

    anchorTime = nextEntry.endsAt;
    return nextEntry;
  });
}

export function getActiveMissionQueueEntry(
  queue: MissionQueueEntry[],
  now: number,
) {
  const safeQueue = Array.isArray(queue) ? queue : [];

  return (
    safeQueue.find(
      (entry) =>
        entry.completedAt === null &&
        entry.startsAt <= now &&
        now < entry.endsAt,
    ) ?? null
  );
}

export function getCompletedMissionQueueEntry(
  queue: MissionQueueEntry[],
  now: number,
) {
  const safeQueue = Array.isArray(queue) ? queue : [];

  return (
    safeQueue.find(
      (entry) =>
        entry.completedAt !== null ||
        (entry.endsAt <= now && entry.completedAt === null),
    ) ?? null
  );
}

export function processMissionQueue(state: GameState, now: number): GameState {
  const safeQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];

  if (safeQueue.length === 0) {
    return state;
  }

  let nextPlayer = state.player;
  let playerChanged = false;
  let queueChanged = false;

  const remainingQueue: MissionQueueEntry[] = [];

  for (const entry of safeQueue) {
    const isFinished = entry.endsAt <= now;

    if (!isFinished) {
      remainingQueue.push(entry);
      continue;
    }

    queueChanged = true;

    const mission = getMissionById(state.missions, entry.missionId);

    if (!mission) {
      continue;
    }

    nextPlayer = applyMissionReward(nextPlayer, mission.reward);
    playerChanged = true;
  }

  if (!queueChanged && !playerChanged) {
    return state;
  }

  return {
    ...state,
    player: {
      ...nextPlayer,
      missionQueue: remainingQueue,
    },
  };
}