import { initialGameState } from "@/features/game/initialGameState";
import { phase1ExplorationReward } from "@/features/exploration/explorationData";
import {
  applyMissionReward,
  applyRankXp,
  buildMissionQueueEntry,
  canAccessMission,
  clamp,
  getMissionById,
  getRankName,
  getXpToNext,
  processMissionQueue,
  rebuildMissionQueueSchedule,
} from "@/features/game/gameMissionUtils";
import {
  buildNavigationState,
  getAvailableRoutes,
} from "@/features/navigation/navigationUtils";
import {
  FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST,
  FIELD_RATIONS_CRAFT_CREDITS_COST,
  FIELD_RATIONS_RESTORE,
  MAX_HUNGER,
  applySurvivalActivity,
} from "@/features/status/survival";
import type {
  GameAction,
  GameState,
  ResourceKey,
  ResourcesState,
} from "@/features/game/gameTypes";

function updateSingleResource(
  resources: ResourcesState,
  key: ResourceKey,
  amount: number,
) {
  return {
    ...resources,
    [key]: Math.max(0, resources[key] + amount),
  };
}

const CONDITION_RECOVERY_COST = 10;
const CONDITION_RECOVERY_AMOUNT = 20;
const CONDITION_RECOVERY_COOLDOWN_MS = 60000;

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE_STATE":
      return action.payload;

    case "SET_PLAYER_NAME":
      return {
        ...state,
        player: {
          ...state.player,
          playerName: action.payload,
        },
      };

    case "SET_FACTION_ALIGNMENT":
      return {
        ...state,
        player: {
          ...state.player,
          factionAlignment: action.payload,
        },
      };

    case "ADD_RESOURCE":
      return {
        ...state,
        player: {
          ...state.player,
          resources: updateSingleResource(
            state.player.resources,
            action.payload.key,
            action.payload.amount,
          ),
        },
      };

    case "SPEND_RESOURCE":
      return {
        ...state,
        player: {
          ...state.player,
          resources: updateSingleResource(
            state.player.resources,
            action.payload.key,
            -action.payload.amount,
          ),
        },
      };

    case "GAIN_RANK_XP": {
      const rankState = applyRankXp(
        state.player.rankLevel,
        state.player.rankXp,
        action.payload,
      );

      return {
        ...state,
        player: {
          ...state.player,
          ...rankState,
          navigation: buildNavigationState(
            rankState.rankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_RANK_LEVEL": {
      const nextRankLevel = Math.max(1, action.payload);

      return {
        ...state,
        player: {
          ...state.player,
          rankLevel: nextRankLevel,
          rankXpToNext: getXpToNext(nextRankLevel),
          rank: getRankName(nextRankLevel),
          navigation: buildNavigationState(
            nextRankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_RANK_NAME":
      return {
        ...state,
        player: {
          ...state.player,
          rank: action.payload,
        },
      };

    case "ADJUST_CONDITION":
      return {
        ...state,
        player: {
          ...state.player,
          condition: clamp(state.player.condition + action.payload, 0, 100),
        },
      };

    case "RECOVER_CONDITION": {
      const now = Date.now();

      if (state.player.conditionRecoveryAvailableAt > now) {
        return state;
      }

      if (state.player.resources.credits < CONDITION_RECOVERY_COST) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          condition: clamp(
            state.player.condition + CONDITION_RECOVERY_AMOUNT,
            0,
            100,
          ),
          conditionRecoveryAvailableAt: now + CONDITION_RECOVERY_COOLDOWN_MS,
          resources: updateSingleResource(
            state.player.resources,
            "credits",
            -CONDITION_RECOVERY_COST,
          ),
        },
      };
    }

    case "CONSUME_FIELD_RATION":
      if (state.player.survival.fieldRations <= 0) {
        return state;
      }

      if (state.player.survival.hunger >= MAX_HUNGER) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          survival: {
            hunger: clamp(
              state.player.survival.hunger + FIELD_RATIONS_RESTORE,
              0,
              MAX_HUNGER,
            ),
            fieldRations: state.player.survival.fieldRations - 1,
          },
        },
      };

    case "CRAFT_FIELD_RATION":
      if (
        state.player.resources.credits < FIELD_RATIONS_CRAFT_CREDITS_COST ||
        state.player.resources.bioSamples < FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST
      ) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          resources: {
            ...state.player.resources,
            credits:
              state.player.resources.credits - FIELD_RATIONS_CRAFT_CREDITS_COST,
            bioSamples:
              state.player.resources.bioSamples -
              FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST,
          },
          survival: {
            ...state.player.survival,
            fieldRations: state.player.survival.fieldRations + 1,
          },
        },
      };

    case "RESOLVE_HUNT": {
      const mission = getMissionById(state.missions, action.payload.missionId);

      if (!mission) {
        return state;
      }

      const selectedPath =
        state.player.factionAlignment === "unbound"
          ? "unbound"
          : state.player.factionAlignment;

      if (!canAccessMission(mission, selectedPath)) {
        return state;
      }

      if (
        mission.id === "bio-hunt-specimen" &&
        !state.player.hasBiotechSpecimenLead
      ) {
        return state;
      }

      const resolvedAt = action.payload.resolvedAt ?? Date.now();
      const rewardedPlayer = applyMissionReward(state.player, mission.reward);
      const nextPlayer = applySurvivalActivity(rewardedPlayer, "hunt");

      return {
        ...state,
        player: {
          ...nextPlayer,
          hasBiotechSpecimenLead:
            mission.id === "bio-hunt-specimen"
              ? false
              : state.player.hasBiotechSpecimenLead,
          lastHuntResult: {
            missionId: mission.id,
            huntTitle: mission.title,
            resolvedAt,
            conditionDelta: mission.reward.conditionDelta,
            conditionAfter: nextPlayer.condition,
            rankXpGained: mission.reward.rankXp,
            masteryProgressGained: mission.reward.masteryProgress,
            influenceGained: mission.reward.influence ?? 0,
            resourcesGained: mission.reward.resources ?? {},
          },
        },
      };
    }

    case "START_EXPLORATION_PROCESS": {
      if (state.player.activeProcess !== null) {
        return state;
      }

      const startedAt = action.payload.startedAt ?? Date.now();

      if (action.payload.endsAt <= startedAt) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          activeProcess: {
            id: action.payload.id,
            kind: "exploration",
            status: "running",
            title: action.payload.title,
            sourceId: action.payload.sourceId ?? null,
            startedAt,
            endsAt: action.payload.endsAt,
          },
        },
      };
    }

    case "RESOLVE_ACTIVE_PROCESS": {
      const now = action.payload?.now ?? Date.now();
      const activeProcess = state.player.activeProcess;

      if (!activeProcess || activeProcess.status === "complete") {
        return state;
      }

      if (now < activeProcess.endsAt) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          activeProcess: {
            ...activeProcess,
            status: "complete",
          },
        },
      };
    }

    case "CLAIM_EXPLORATION_REWARD": {
      const activeProcess = state.player.activeProcess;

      if (
        !activeProcess ||
        activeProcess.kind !== "exploration" ||
        activeProcess.status !== "complete"
      ) {
        return state;
      }

      const rewardedPlayer = applyMissionReward(
        state.player,
        phase1ExplorationReward,
      );
      const nextPlayer = applySurvivalActivity(rewardedPlayer, "exploration");

      return {
        ...state,
        player: {
          ...nextPlayer,
          activeProcess: null,
          hasBiotechSpecimenLead: true,
        },
      };
    }

    case "CLEAR_ACTIVE_PROCESS":
      if (state.player.activeProcess === null) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          activeProcess: null,
        },
      };

    case "SET_MASTERY_PROGRESS":
      return {
        ...state,
        player: {
          ...state.player,
          masteryProgress: clamp(action.payload, 0, 100),
        },
      };

    case "QUEUE_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      if (missionQueue.length >= state.player.maxMissionQueueSlots) {
        return state;
      }

      const mission = getMissionById(state.missions, action.payload.missionId);
      if (!mission) return state;

      const selectedPath =
        state.player.factionAlignment === "unbound"
          ? "unbound"
          : state.player.factionAlignment;

      if (!canAccessMission(mission, selectedPath)) {
        return state;
      }

      const queuedAt = action.payload.queuedAt ?? Date.now();
      const lastEntry = missionQueue[missionQueue.length - 1] ?? null;
      const anchorTime = lastEntry
        ? Math.max(queuedAt, lastEntry.endsAt)
        : queuedAt;

      const nextEntry = buildMissionQueueEntry({
        mission,
        queuedAt,
        anchorTime,
      });

      return {
        ...state,
        player: {
          ...state.player,
          missionQueue: [...missionQueue, nextEntry],
        },
      };
    }

    case "REMOVE_QUEUED_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const removedAt = action.payload.removedAt ?? Date.now();

      const filteredQueue = missionQueue.filter(
        (entry) => entry.queueId !== action.payload.queueId,
      );

      if (filteredQueue.length === missionQueue.length) {
        return state;
      }

      const rebuiltQueue = rebuildMissionQueueSchedule({
        queue: filteredQueue,
        missions: state.missions,
        now: removedAt,
      });

      return {
        ...state,
        player: {
          ...state.player,
          missionQueue: rebuiltQueue,
        },
      };
    }

    case "PROCESS_MISSION_QUEUE":
      return processMissionQueue(state, action.payload.now);

    case "CLAIM_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const claimIndex = missionQueue.findIndex(
        (entry) => entry.queueId === action.payload.queueId,
      );

      if (claimIndex === -1) {
        return state;
      }

      const entry = missionQueue[claimIndex];

      if (entry.completedAt === null) {
        return state;
      }

      const mission = getMissionById(state.missions, entry.missionId);
      if (!mission) {
        return {
          ...state,
          player: {
            ...state.player,
            missionQueue: missionQueue.filter(
              (queueEntry) => queueEntry.queueId !== entry.queueId,
            ),
          },
        };
      }

      const rewardedPlayer = applyMissionReward(state.player, mission.reward);
      const nextPlayer = applySurvivalActivity(rewardedPlayer, "mission");
      const nextQueue = missionQueue.filter(
        (queueEntry) => queueEntry.queueId !== entry.queueId,
      );

      return {
        ...state,
        player: {
          ...nextPlayer,
          missionQueue: nextQueue,
        },
      };
    }

    case "ADD_RECIPE":
      if (state.player.knownRecipes.includes(action.payload)) return state;

      return {
        ...state,
        player: {
          ...state.player,
          knownRecipes: [...state.player.knownRecipes, action.payload],
        },
      };

    case "UNLOCK_ROUTE": {
      if (state.player.unlockedRoutes.includes(action.payload)) return state;

      const nextUnlockedRoutes = [...state.player.unlockedRoutes, action.payload];

      return {
        ...state,
        player: {
          ...state.player,
          unlockedRoutes: nextUnlockedRoutes,
          navigation: buildNavigationState(
            state.player.rankLevel,
            nextUnlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_CURRENT_ROUTE": {
      const availableRoutes = getAvailableRoutes(
        state.player.rankLevel,
        state.player.unlockedRoutes,
      );

      if (!availableRoutes.includes(action.payload)) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          navigation: {
            ...state.player.navigation,
            currentRoute: action.payload,
            availableRoutes,
          },
        },
      };
    }

    case "REFRESH_AVAILABLE_ROUTES":
      return {
        ...state,
        player: {
          ...state.player,
          navigation: buildNavigationState(
            state.player.rankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };

    case "ADD_INFLUENCE":
      return {
        ...state,
        player: {
          ...state.player,
          influence: Math.max(0, state.player.influence + action.payload),
        },
      };

    case "SET_FORGE_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            forgeStatus: action.payload,
          },
        },
      };

    case "SET_ARENA_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            arenaStatus: action.payload,
          },
        },
      };

    case "SET_MECHA_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            mechaStatus: action.payload,
          },
        },
      };

    case "SET_MUTATION_STATE":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            mutationState: action.payload,
          },
        },
      };

    case "SET_ATTUNEMENT_STATE":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            attunementState: action.payload,
          },
        },
      };

    case "SET_GATE_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            gateStatus: action.payload,
          },
        },
      };

    case "RESET_GAME":
      return initialGameState;

    default:
      return state;
  }
}
