import { initialGameState } from "@/features/game/initialGameState";
import { feastHallOffers } from "@/features/black-market/feastHallData";
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
import type {
  GameAction,
  GameState,
  PlayerState,
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
const CONDITION_DECAY_INTERVAL_MS = 60000;

function applyConditionDecay(player: PlayerState, now: number): PlayerState {
  if (now <= player.lastConditionTickAt) {
    return player;
  }

  const elapsedMs = now - player.lastConditionTickAt;
  const decay = Math.floor(elapsedMs / CONDITION_DECAY_INTERVAL_MS);

  return {
    ...player,
    condition: Math.max(0, player.condition - decay),
    lastConditionTickAt: now,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const now = Date.now();

      return {
        ...action.payload,
        player: applyConditionDecay(action.payload.player, now),
      };
    }

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


    case "PURCHASE_FEAST_OFFER": {
      if (state.player.activeProvision !== null) {
        return state;
      }

      const offer = feastHallOffers.find(
        (entry) => entry.id === action.payload.offerId,
      );

      if (!offer) {
        return state;
      }

      const canAffordOffer = Object.entries(offer.cost).every(
        ([resourceKey, amount]) =>
          state.player.resources[resourceKey as ResourceKey] >= (amount ?? 0),
      );

      if (!canAffordOffer) {
        return state;
      }

      const nextResources = Object.entries(offer.cost).reduce(
        (resources, [resourceKey, amount]) => ({
          ...resources,
          [resourceKey]: Math.max(0, resources[resourceKey as ResourceKey] - (amount ?? 0)),
        }),
        state.player.resources,
      );

      return {
        ...state,
        player: {
          ...state.player,
          condition: clamp(
            state.player.condition + offer.conditionRecovery,
            0,
            100,
          ),
          resources: nextResources,
          activeProvision: {
            offerId: offer.id,
            title: offer.title,
            conditionMitigation: offer.nextExpeditionMitigation,
            purchasedAt: action.payload.purchasedAt ?? Date.now(),
          },
        },
      };
    }

    case "RESOLVE_HUNT": {
      const now = action.payload.resolvedAt ?? Date.now();
      const player = applyConditionDecay(state.player, now);
      const mission = getMissionById(state.missions, action.payload.missionId);

      if (!mission) {
        return {
          ...state,
          player,
        };
      }

      const selectedPath =
        player.factionAlignment === "unbound"
          ? "unbound"
          : player.factionAlignment;

      if (!canAccessMission(mission, selectedPath)) {
        return {
          ...state,
          player,
        };
      }

      if (mission.id === "bio-hunt-specimen" && !player.hasBiotechSpecimenLead) {
        return {
          ...state,
          player,
        };
      }

      const resolvedAt = action.payload.resolvedAt ?? now;
      const nextPlayer = applyMissionReward(player, mission.reward);

      return {
        ...state,
        player: {
          ...nextPlayer,
          hasBiotechSpecimenLead:
            mission.id === "bio-hunt-specimen"
              ? false
              : player.hasBiotechSpecimenLead,
          lastHuntResult: {
            missionId: mission.id,
            huntTitle: mission.title,
            resolvedAt,
            conditionDelta: nextPlayer.condition - player.condition,
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
      const player = applyConditionDecay(state.player, now);
      const activeProcess = player.activeProcess;

      if (!activeProcess || activeProcess.status === "complete") {
        return {
          ...state,
          player,
        };
      }

      if (now < activeProcess.endsAt) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          activeProcess: {
            ...activeProcess,
            status: "complete",
          },
        },
      };
    }

    case "CLAIM_EXPLORATION_REWARD": {
      const now = Date.now();
      const player = applyConditionDecay(state.player, now);
      const activeProcess = player.activeProcess;

      if (
        !activeProcess ||
        activeProcess.kind !== "exploration" ||
        activeProcess.status !== "complete"
      ) {
        return {
          ...state,
          player,
        };
      }

      const nextPlayer = applyMissionReward(player, phase1ExplorationReward);

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
