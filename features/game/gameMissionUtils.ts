import { buildNavigationState } from "@/features/navigation/navigationUtils";
import { getPressureAdjustedConditionDelta } from "@/features/status/statusRecovery";
import {
  getActivityHungerCost,
  getHungerPressureEffects,
} from "@/features/status/survival";
import type {
  ActiveProcess,
  GameState,
  LatestHuntResult,
  MissionDefinition,
  MissionQueueEntry,
  MissionReward,
  PathType,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";
import {
  huntIntensityFromMissionRankReward,
  withWorldProgressAfterHunt,
} from "@/features/factions/factionWorldLogic";

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
    mossRations: current.mossRations + (incoming.mossRations ?? 0),
    coilboundLattice:
      current.coilboundLattice + (incoming.coilboundLattice ?? 0),
    ashSynodRelic: current.ashSynodRelic + (incoming.ashSynodRelic ?? 0),
    vaultLatticeShard:
      current.vaultLatticeShard + (incoming.vaultLatticeShard ?? 0),
    ironHeart: current.ironHeart + (incoming.ironHeart ?? 0),
  };
}

export function getResolvedConditionDelta(
  player: PlayerState,
  reward: MissionReward,
) {
  return getPressureAdjustedConditionDelta(
    player.condition,
    reward.conditionDelta,
  );
}

export function applyMissionReward(
  player: PlayerState,
  reward: MissionReward,
): PlayerState {
  const rankState = applyRankXp(player.rankLevel, player.rankXp, reward.rankXp);
  const resolvedConditionDelta = getResolvedConditionDelta(player, reward);

  return {
    ...player,
    ...rankState,
    masteryProgress: clamp(
      player.masteryProgress + reward.masteryProgress,
      0,
      100,
    ),
    condition: clamp(player.condition + resolvedConditionDelta, 0, 100),
    influence: Math.max(0, player.influence + (reward.influence ?? 0)),
    resources: addPartialResources(player.resources, reward.resources),
    navigation: buildNavigationState(
      rankState.rankLevel,
      player.unlockedRoutes,
      player.navigation.currentRoute,
    ),
  };
}

export function applyActivityHungerCost(
  player: PlayerState,
  activity: "exploration" | "mission" | "hunt",
): PlayerState {
  return {
    ...player,
    hunger: clamp(player.hunger - getActivityHungerCost(activity), 0, 100),
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

/**
 * Mirrors the in-progress Hunting Ground queue entry to `activeProcess` so AFK
 * hunts surface in the same timer UI as field deploy. Skipped while exploration
 * owns the active slot.
 */
export function syncMirroredHuntActiveProcess(
  player: PlayerState,
  missionQueue: MissionQueueEntry[],
  missions: MissionDefinition[],
  now: number,
): PlayerState {
  const explorationBlocking =
    player.activeProcess !== null &&
    player.activeProcess.kind === "exploration" &&
    player.activeProcess.status === "running";

  if (explorationBlocking) {
    return player;
  }

  const safeQueue = Array.isArray(missionQueue) ? missionQueue : [];

  const activeHgEntry =
    safeQueue.find((entry) => {
      if (now < entry.startsAt || now >= entry.endsAt) {
        return false;
      }

      const mission = getMissionById(missions, entry.missionId);
      return mission?.category === "hunting-ground";
    }) ?? null;

  if (activeHgEntry) {
    const mission = getMissionById(missions, activeHgEntry.missionId);
    if (!mission) {
      return player;
    }

    const nextProcess: ActiveProcess = {
      id: activeHgEntry.queueId,
      kind: "hunt",
      status: "running",
      title: mission.title,
      sourceId: mission.id,
      startedAt: activeHgEntry.startsAt,
      endsAt: activeHgEntry.endsAt,
    };

    const current = player.activeProcess;
    if (
      current &&
      current.kind === "hunt" &&
      current.id === nextProcess.id &&
      current.endsAt === nextProcess.endsAt &&
      current.status === nextProcess.status
    ) {
      return player;
    }

    let nextPlayer: PlayerState = {
      ...player,
      activeProcess: nextProcess,
      // New hunt process: clear per-run field loot ledger.
      fieldLootGainedThisRun:
        current?.kind === "hunt" && current.id === nextProcess.id
          ? player.fieldLootGainedThisRun
          : {},
    };

    // Apply "next run modifiers" once per hunt process id.
    const mods = player.nextRunModifiers;
    if (
      mods &&
      player.nextRunModifiersAppliedForProcessId !== nextProcess.id &&
      mods.applyOnStart
    ) {
      const gainedCondition = mods.applyOnStart.conditionGain ?? 0;
      const hungerDelta = mods.applyOnStart.hungerDelta ?? 0;
      nextPlayer = {
        ...nextPlayer,
        condition: clamp(nextPlayer.condition + gainedCondition, 0, 100),
        hunger: clamp(nextPlayer.hunger + hungerDelta, 0, 100),
        nextRunModifiersAppliedForProcessId: nextProcess.id,
      };
    } else if (mods && player.nextRunModifiersAppliedForProcessId !== nextProcess.id) {
      // Still mark as applied so we don't re-check every tick.
      nextPlayer = {
        ...nextPlayer,
        nextRunModifiersAppliedForProcessId: nextProcess.id,
      };
    }

    return nextPlayer;
  }

  if (player.activeProcess?.kind === "hunt") {
    return { ...player, activeProcess: null };
  }

  return player;
}

export function processMissionQueue(state: GameState, now: number): GameState {
  const safeQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];

  if (safeQueue.length === 0) {
    const syncedPlayer = syncMirroredHuntActiveProcess(
      state.player,
      [],
      state.missions,
      now,
    );

    if (syncedPlayer === state.player) {
      return state;
    }

    return {
      ...state,
      player: syncedPlayer,
    };
  }

  let nextPlayer = state.player;
  let playerChanged = false;
  let queueChanged = false;

  const remainingQueue: MissionQueueEntry[] = [];
  let latestHgHuntResult: LatestHuntResult | null = null;

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

    const hungerEffects =
      mission.category === "hunting-ground"
        ? getHungerPressureEffects(nextPlayer.hunger)
        : null;
    const nextRunMods =
      mission.category === "hunting-ground" ? nextPlayer.nextRunModifiers : null;
    const settlementMods = nextRunMods?.applyOnSettlement ?? null;
    const nextRunRewardMultiplier =
      settlementMods && typeof settlementMods.rewardBonusPct === "number"
        ? 1 + settlementMods.rewardBonusPct / 100
        : 1;
    const nextRunConditionDeltaOffset =
      (settlementMods?.conditionDrainReduction ?? 0) -
      (settlementMods?.conditionDrainPenalty ?? 0);

    const rewardForResolution =
      hungerEffects && hungerEffects.rewardPenaltyPct !== 0
        ? {
            ...mission.reward,
            conditionDelta:
              mission.reward.conditionDelta -
              hungerEffects.conditionDrainPenalty,
            rankXp: Math.round(
              mission.reward.rankXp * hungerEffects.rewardMultiplier,
            ),
            masteryProgress: Math.round(
              mission.reward.masteryProgress * hungerEffects.rewardMultiplier,
            ),
            influence:
              typeof mission.reward.influence === "number"
                ? Math.round(
                    mission.reward.influence * hungerEffects.rewardMultiplier,
                  )
                : undefined,
            resources: mission.reward.resources
              ? (Object.fromEntries(
                  Object.entries(mission.reward.resources).map(
                    ([key, value]) => [
                      key,
                      Math.round(value * hungerEffects.rewardMultiplier),
                    ],
                  ),
                ) as typeof mission.reward.resources)
              : undefined,
          }
        : mission.reward;

    const rewardWithNextRunMods =
      mission.category !== "hunting-ground" ||
      (nextRunRewardMultiplier === 1 && nextRunConditionDeltaOffset === 0)
        ? rewardForResolution
        : {
            ...rewardForResolution,
            conditionDelta:
              rewardForResolution.conditionDelta + nextRunConditionDeltaOffset,
            rankXp: Math.round(
              rewardForResolution.rankXp * nextRunRewardMultiplier,
            ),
            masteryProgress: Math.round(
              rewardForResolution.masteryProgress * nextRunRewardMultiplier,
            ),
            influence:
              typeof rewardForResolution.influence === "number"
                ? Math.round(
                    rewardForResolution.influence * nextRunRewardMultiplier,
                  )
                : undefined,
            resources: rewardForResolution.resources
              ? (Object.fromEntries(
                  Object.entries(rewardForResolution.resources).map(
                    ([key, value]) => [
                      key,
                      Math.round(value * nextRunRewardMultiplier),
                    ],
                  ),
                ) as typeof rewardForResolution.resources)
              : undefined,
          };

    const resolvedConditionDelta = getResolvedConditionDelta(
      nextPlayer,
      rewardWithNextRunMods,
    );

    nextPlayer = applyActivityHungerCost(
      applyMissionReward(nextPlayer, rewardWithNextRunMods),
      mission.category === "hunting-ground" ? "hunt" : "mission",
    );
    playerChanged = true;

    if (mission.category === "hunting-ground") {
      const fieldLoot = nextPlayer.fieldLootGainedThisRun ?? {};
      // Clear next-run modifiers after the run ends (single-use, non-stacking).
      nextPlayer = {
        ...nextPlayer,
        nextRunModifiers: null,
        nextRunModifiersAppliedForProcessId: null,
        fieldLootGainedThisRun: {},
      };
      latestHgHuntResult = {
        missionId: mission.id,
        huntTitle: mission.title,
        resolvedAt: entry.endsAt,
        conditionDelta: resolvedConditionDelta,
        conditionAfter: nextPlayer.condition,
        rankXpGained: rewardWithNextRunMods.rankXp,
        masteryProgressGained: rewardWithNextRunMods.masteryProgress,
        influenceGained: rewardWithNextRunMods.influence ?? 0,
        resourcesGained: rewardWithNextRunMods.resources ?? {},
        fieldLootGained: fieldLoot,
        hungerPressureLabel: hungerEffects?.label,
        hungerRewardPenaltyPct: hungerEffects?.rewardPenaltyPct,
        hungerConditionDrainPenalty: hungerEffects?.conditionDrainPenalty,

        baseRankXpGained: rewardWithNextRunMods.rankXp,
        baseMasteryProgressGained: rewardWithNextRunMods.masteryProgress,
        baseInfluenceGained: rewardWithNextRunMods.influence ?? 0,
        baseResourcesGained: rewardWithNextRunMods.resources ?? {},

        realtimeContributionBonusMultiplier: null,
        realtimeContributionAppliedForResolvedAt: null,
        realtimeRankXpBonusGained: 0,
        realtimeMasteryProgressBonusGained: 0,
        realtimeInfluenceBonusGained: 0,
        realtimeResourcesBonusGained: {},

        realtimeTotalDamageDealt: 0,
        realtimeTotalHitsLanded: 0,
        realtimeMobsContributedTo: 0,
        realtimeMobsKilled: 0,
        realtimeExposedKills: 0,
      };

      if (mission.deployZoneId) {
        nextPlayer = withWorldProgressAfterHunt(nextPlayer, {
          zoneId: mission.deployZoneId,
          intensity: huntIntensityFromMissionRankReward(
            rewardWithNextRunMods.rankXp,
            rewardWithNextRunMods.influence ?? 0,
          ),
          reason: `Contract resolved — ${mission.title}`,
        });
      }
    }
  }

  if (!queueChanged && !playerChanged) {
    const syncedPlayer = syncMirroredHuntActiveProcess(
      state.player,
      safeQueue,
      state.missions,
      now,
    );

    if (syncedPlayer === state.player) {
      return state;
    }

    return {
      ...state,
      player: syncedPlayer,
    };
  }

  let finalPlayer: PlayerState = {
    ...nextPlayer,
    missionQueue: remainingQueue,
    ...(latestHgHuntResult ? { lastHuntResult: latestHgHuntResult } : {}),
  };

  finalPlayer = syncMirroredHuntActiveProcess(
    finalPlayer,
    remainingQueue,
    state.missions,
    now,
  );

  return {
    ...state,
    player: finalPlayer,
  };
}
