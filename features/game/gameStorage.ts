import { initialGameState } from "@/features/game/initialGameState";
import type {
  ActiveProcess,
  GameState,
  LatestHuntResult,
  MissionCategory,
  MissionDefinition,
  MissionQueueEntry,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";

const STORAGE_KEY_PREFIX = "void-wars-oblivion-game-state";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeResources(value: unknown): ResourcesState {
  const raw = isRecord(value) ? value : {};

  return {
    credits:
      typeof raw.credits === "number"
        ? raw.credits
        : initialGameState.player.resources.credits,
    ironOre:
      typeof raw.ironOre === "number"
        ? raw.ironOre
        : initialGameState.player.resources.ironOre,
    scrapAlloy:
      typeof raw.scrapAlloy === "number"
        ? raw.scrapAlloy
        : initialGameState.player.resources.scrapAlloy,
    runeDust:
      typeof raw.runeDust === "number"
        ? raw.runeDust
        : initialGameState.player.resources.runeDust,
    emberCore:
      typeof raw.emberCore === "number"
        ? raw.emberCore
        : initialGameState.player.resources.emberCore,
    bioSamples:
      typeof raw.bioSamples === "number"
        ? raw.bioSamples
        : initialGameState.player.resources.bioSamples,
    mossRations:
      typeof raw.mossRations === "number"
        ? raw.mossRations
        : initialGameState.player.resources.mossRations,
  };
}

function normalizePartialResources(
  value: unknown,
): Partial<ResourcesState> {
  if (!isRecord(value)) return {};

  const result: Partial<ResourcesState> = {};

  if (typeof value.credits === "number") result.credits = value.credits;
  if (typeof value.ironOre === "number") result.ironOre = value.ironOre;
  if (typeof value.scrapAlloy === "number") {
    result.scrapAlloy = value.scrapAlloy;
  }
  if (typeof value.runeDust === "number") result.runeDust = value.runeDust;
  if (typeof value.emberCore === "number") result.emberCore = value.emberCore;
  if (typeof value.bioSamples === "number") {
    result.bioSamples = value.bioSamples;
  }
  if (typeof value.mossRations === "number") {
    result.mossRations = value.mossRations;
  }

  return result;
}

function normalizeLatestHuntResult(value: unknown): LatestHuntResult | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.missionId !== "string" ||
    typeof value.huntTitle !== "string" ||
    typeof value.resolvedAt !== "number" ||
    typeof value.conditionDelta !== "number" ||
    typeof value.conditionAfter !== "number" ||
    typeof value.rankXpGained !== "number" ||
    typeof value.masteryProgressGained !== "number" ||
    typeof value.influenceGained !== "number"
  ) {
    return null;
  }

  const result: LatestHuntResult = {
    missionId: value.missionId,
    huntTitle: value.huntTitle,
    resolvedAt: value.resolvedAt,
    conditionDelta: value.conditionDelta,
    conditionAfter: value.conditionAfter,
    rankXpGained: value.rankXpGained,
    masteryProgressGained: value.masteryProgressGained,
    influenceGained: value.influenceGained,
    resourcesGained: normalizePartialResources(value.resourcesGained),
  };

  if (typeof value.baseRankXpGained === "number") {
    result.baseRankXpGained = value.baseRankXpGained;
  }
  if (typeof value.baseMasteryProgressGained === "number") {
    result.baseMasteryProgressGained = value.baseMasteryProgressGained;
  }
  if (typeof value.baseInfluenceGained === "number") {
    result.baseInfluenceGained = value.baseInfluenceGained;
  }
  if (value.baseResourcesGained !== undefined) {
    result.baseResourcesGained = normalizePartialResources(value.baseResourcesGained);
  }

  if (value.realtimeContributionBonusMultiplier === null) {
    result.realtimeContributionBonusMultiplier = null;
  } else if (typeof value.realtimeContributionBonusMultiplier === "number") {
    result.realtimeContributionBonusMultiplier = value.realtimeContributionBonusMultiplier;
  }

  if (value.realtimeContributionAppliedForResolvedAt === null) {
    result.realtimeContributionAppliedForResolvedAt = null;
  } else if (typeof value.realtimeContributionAppliedForResolvedAt === "number") {
    result.realtimeContributionAppliedForResolvedAt = value.realtimeContributionAppliedForResolvedAt;
  }

  if (typeof value.realtimeRankXpBonusGained === "number") {
    result.realtimeRankXpBonusGained = value.realtimeRankXpBonusGained;
  }
  if (typeof value.realtimeMasteryProgressBonusGained === "number") {
    result.realtimeMasteryProgressBonusGained = value.realtimeMasteryProgressBonusGained;
  }
  if (typeof value.realtimeInfluenceBonusGained === "number") {
    result.realtimeInfluenceBonusGained = value.realtimeInfluenceBonusGained;
  }
  if (value.realtimeResourcesBonusGained !== undefined) {
    result.realtimeResourcesBonusGained = normalizePartialResources(
      value.realtimeResourcesBonusGained,
    );
  }

  return result;
}

function normalizeActiveProcess(value: unknown): ActiveProcess | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    (value.kind !== "exploration" && value.kind !== "hunt") ||
    (value.status !== "running" && value.status !== "complete") ||
    typeof value.title !== "string" ||
    (value.sourceId !== null && typeof value.sourceId !== "string") ||
    typeof value.startedAt !== "number" ||
    typeof value.endsAt !== "number"
  ) {
    return null;
  }

  return {
    id: value.id,
    kind: value.kind,
    status: value.status,
    title: value.title,
    sourceId: value.sourceId,
    startedAt: value.startedAt,
    endsAt: value.endsAt,
  };
}

function normalizeMissionQueue(value: unknown): MissionQueueEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry) => isRecord(entry))
    .map((entry) => {
      const completedAt =
        typeof entry.completedAt === "number" ? entry.completedAt : null;

      if (
        typeof entry.queueId !== "string" ||
        typeof entry.missionId !== "string" ||
        typeof entry.queuedAt !== "number" ||
        typeof entry.startsAt !== "number" ||
        typeof entry.endsAt !== "number"
      ) {
        return null;
      }

      return {
        queueId: entry.queueId,
        missionId: entry.missionId,
        queuedAt: entry.queuedAt,
        startsAt: entry.startsAt,
        endsAt: entry.endsAt,
        completedAt,
      };
    })
    .filter((entry): entry is MissionQueueEntry => entry !== null);
}

function normalizeMissions(value: unknown): MissionDefinition[] {
  if (!Array.isArray(value)) return initialGameState.missions;

  const valid = value
    .filter((mission) => {
      if (!isRecord(mission)) return false;
      if (!isRecord(mission.reward)) return false;

      return (
        typeof mission.id === "string" &&
        typeof mission.title === "string" &&
        typeof mission.description === "string" &&
        (mission.path === "neutral" ||
          mission.path === "bio" ||
          mission.path === "mecha" ||
          mission.path === "pure" ||
          mission.path === "spirit") &&
        typeof mission.durationHours === "number" &&
        typeof mission.reward.rankXp === "number" &&
        typeof mission.reward.masteryProgress === "number" &&
        typeof mission.reward.conditionDelta === "number"
      );
    })
    .map((mission) => {
      if (!isRecord(mission) || !isRecord(mission.reward)) {
        return null;
      }

      const category: MissionCategory =
        mission.category === "hunting-ground" ? "hunting-ground" : "operation";
      const path = mission.path === "spirit" ? "pure" : mission.path;

      return {
        ...mission,
        path,
        category,
      };
    })
    .filter((mission): mission is MissionDefinition => mission !== null);

  return valid.length > 0 ? valid : initialGameState.missions;
}

function normalizePlayer(value: unknown): PlayerState {
  const raw = isRecord(value) ? value : {};
  const rawDistrictState = isRecord(raw.districtState) ? raw.districtState : {};

  return {
    ...initialGameState.player,

    playerName:
      typeof raw.playerName === "string"
        ? raw.playerName
        : initialGameState.player.playerName,

    factionAlignment:
      raw.factionAlignment === "unbound" ||
      raw.factionAlignment === "bio" ||
      raw.factionAlignment === "mecha" ||
      raw.factionAlignment === "pure"
        ? raw.factionAlignment
        : raw.factionAlignment === "spirit"
          ? "pure"
        : initialGameState.player.factionAlignment,

    condition:
      typeof raw.condition === "number"
        ? raw.condition
        : initialGameState.player.condition,

    hunger:
      typeof raw.hunger === "number"
        ? raw.hunger
        : initialGameState.player.hunger,

    conditionRecoveryAvailableAt:
      typeof raw.conditionRecoveryAvailableAt === "number"
        ? raw.conditionRecoveryAvailableAt
        : initialGameState.player.conditionRecoveryAvailableAt,

    lastConditionTickAt:
      typeof raw.lastConditionTickAt === "number"
        ? raw.lastConditionTickAt
        : Date.now(),

    rank:
      typeof raw.rank === "string" ? raw.rank : initialGameState.player.rank,

    rankLevel:
      typeof raw.rankLevel === "number"
        ? raw.rankLevel
        : initialGameState.player.rankLevel,

    rankXp:
      typeof raw.rankXp === "number"
        ? raw.rankXp
        : initialGameState.player.rankXp,

    rankXpToNext:
      typeof raw.rankXpToNext === "number"
        ? raw.rankXpToNext
        : initialGameState.player.rankXpToNext,

    masteryProgress:
      typeof raw.masteryProgress === "number"
        ? raw.masteryProgress
        : initialGameState.player.masteryProgress,

    influence:
      typeof raw.influence === "number"
        ? raw.influence
        : initialGameState.player.influence,

    hasBiotechSpecimenLead:
      typeof raw.hasBiotechSpecimenLead === "boolean"
        ? raw.hasBiotechSpecimenLead
        : initialGameState.player.hasBiotechSpecimenLead,

    resources: normalizeResources(raw.resources),

    knownRecipes: Array.isArray(raw.knownRecipes)
      ? raw.knownRecipes.filter(
          (recipe): recipe is string => typeof recipe === "string",
        )
      : initialGameState.player.knownRecipes,

    unlockedRoutes: Array.isArray(raw.unlockedRoutes)
      ? raw.unlockedRoutes.filter(
          (route): route is string => typeof route === "string",
        )
      : initialGameState.player.unlockedRoutes,

    navigation: isRecord(raw.navigation)
      ? initialGameState.player.navigation
      : initialGameState.player.navigation,

    districtState: {
      forgeStatus:
        rawDistrictState.forgeStatus === "idle" ||
        rawDistrictState.forgeStatus === "crafting" ||
        rawDistrictState.forgeStatus === "complete" ||
        rawDistrictState.forgeStatus === "active" ||
        rawDistrictState.forgeStatus === "locked"
          ? rawDistrictState.forgeStatus
          : initialGameState.player.districtState.forgeStatus,

      arenaStatus:
        rawDistrictState.arenaStatus === "open" ||
        rawDistrictState.arenaStatus === "closed" ||
        rawDistrictState.arenaStatus === "locked"
          ? rawDistrictState.arenaStatus
          : initialGameState.player.districtState.arenaStatus,

      mechaStatus:
        rawDistrictState.mechaStatus === "stable" ||
        rawDistrictState.mechaStatus === "upgrading" ||
        rawDistrictState.mechaStatus === "ready" ||
        rawDistrictState.mechaStatus === "unstable" ||
        rawDistrictState.mechaStatus === "locked"
          ? rawDistrictState.mechaStatus
          : initialGameState.player.districtState.mechaStatus,

      mutationState:
        rawDistrictState.mutationState === "dormant" ||
        rawDistrictState.mutationState === "active" ||
        rawDistrictState.mutationState === "critical"
          ? rawDistrictState.mutationState
          : initialGameState.player.districtState.mutationState,

      attunementState:
        rawDistrictState.attunementState === "unbound" ||
        rawDistrictState.attunementState === "resonating" ||
        rawDistrictState.attunementState === "awakened"
          ? rawDistrictState.attunementState
          : initialGameState.player.districtState.attunementState,

      gateStatus:
        rawDistrictState.gateStatus === "sealed" ||
        rawDistrictState.gateStatus === "available" ||
        rawDistrictState.gateStatus === "traveling" ||
        rawDistrictState.gateStatus === "standby" ||
        rawDistrictState.gateStatus === "charging" ||
        rawDistrictState.gateStatus === "open"
          ? rawDistrictState.gateStatus
          : initialGameState.player.districtState.gateStatus,
    },

    activeProcess: normalizeActiveProcess(raw.activeProcess),
    lastHuntResult: normalizeLatestHuntResult(raw.lastHuntResult),
    missionQueue: normalizeMissionQueue(raw.missionQueue),

    maxMissionQueueSlots:
      typeof raw.maxMissionQueueSlots === "number"
        ? raw.maxMissionQueueSlots
        : initialGameState.player.maxMissionQueueSlots,
  };
}

function normalizeLoadedState(value: unknown): GameState | null {
  if (!isRecord(value)) return null;

  return {
    player: normalizePlayer(value.player),
    missions: normalizeMissions(value.missions),
  };
}

export function getGameStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function loadGameState(userId: string): GameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getGameStorageKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return normalizeLoadedState(parsed);
  } catch {
    return null;
  }
}

export function saveGameState(userId: string, state: GameState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getGameStorageKey(userId), JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function clearGameState(userId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getGameStorageKey(userId));
  } catch {
    // ignore storage errors
  }
}
