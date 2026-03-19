import { initialGameState } from "@/features/game/initialGameState";
import type {
  GameState,
  MissionDefinition,
  MissionQueueEntry,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";

const STORAGE_KEY = "void-wars-oblivion-game-state";

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

  const valid = value.filter((mission): mission is MissionDefinition => {
    if (!isRecord(mission)) return false;
    if (!isRecord(mission.reward)) return false;

    return (
      typeof mission.id === "string" &&
      typeof mission.title === "string" &&
      typeof mission.description === "string" &&
      (mission.path === "neutral" ||
        mission.path === "bio" ||
        mission.path === "mecha" ||
        mission.path === "spirit") &&
      typeof mission.durationHours === "number" &&
      typeof mission.reward.rankXp === "number" &&
      typeof mission.reward.masteryProgress === "number" &&
      typeof mission.reward.conditionDelta === "number"
    );
  });

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
      raw.factionAlignment === "spirit"
        ? raw.factionAlignment
        : initialGameState.player.factionAlignment,

    condition:
      typeof raw.condition === "number"
        ? raw.condition
        : initialGameState.player.condition,

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

    districtState: {
      forgeStatus:
        rawDistrictState.forgeStatus === "idle" ||
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
        rawDistrictState.gateStatus === "traveling"
          ? rawDistrictState.gateStatus
          : initialGameState.player.districtState.gateStatus,
    },

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

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return normalizeLoadedState(parsed);
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}