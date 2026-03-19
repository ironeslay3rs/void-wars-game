import { initialGameState } from "@/features/game/initialGameState";
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
        },
      };
    }

    case "SET_RANK_LEVEL":
      return {
        ...state,
        player: {
          ...state.player,
          rankLevel: Math.max(1, action.payload),
          rankXpToNext: getXpToNext(Math.max(1, action.payload)),
          rank: getRankName(Math.max(1, action.payload)),
        },
      };

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
      const anchorTime = lastEntry ? Math.max(queuedAt, lastEntry.endsAt) : queuedAt;

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

      const nextPlayer = applyMissionReward(state.player, mission.reward);
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

    case "UNLOCK_ROUTE":
      if (state.player.unlockedRoutes.includes(action.payload)) return state;

      return {
        ...state,
        player: {
          ...state.player,
          unlockedRoutes: [...state.player.unlockedRoutes, action.payload],
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