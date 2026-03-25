import { initialGameState } from "@/features/game/initialGameState";
import { getFeastHallOfferById } from "@/features/black-market/feastHallData";
import { phase1ExplorationReward } from "@/features/exploration/explorationData";
import {
  applyActivityHungerCost,
  addPartialResources,
  applyMissionReward,
  applyRankXp,
  buildMissionQueueEntry,
  canAccessMission,
  clamp,
  getMissionById,
  getResolvedConditionDelta,
  getRankName,
  getXpToNext,
  processMissionQueue,
  rebuildMissionQueueSchedule,
  syncMirroredHuntActiveProcess,
} from "@/features/game/gameMissionUtils";
import {
  buildNavigationState,
  getAvailableRoutes,
} from "@/features/navigation/navigationUtils";
import {
  getStatusRecoveryAmount,
  STATUS_RECOVERY_COOLDOWN_MS,
  STATUS_RECOVERY_COST,
} from "@/features/status/statusRecovery";
import {
  HUNGER_CONDITION_PRESSURE_PER_TICK,
  HUNGER_DECAY_PER_TICK,
  HUNGER_PRESSURE_THRESHOLD,
  MOSS_RATION_CONDITION_RESTORE,
  MOSS_RATION_HUNGER_RESTORE,
  MOSS_RATION_RECIPE_COST,
  SURVIVAL_TICK_INTERVAL_MS,
} from "@/features/status/survival";
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

function applySurvivalDecay(player: PlayerState, now: number): PlayerState {
  if (now <= player.lastConditionTickAt) {
    return player;
  }

  const elapsedMs = now - player.lastConditionTickAt;
  const ticks = Math.floor(elapsedMs / SURVIVAL_TICK_INTERVAL_MS);

  if (ticks <= 0) {
    return player;
  }

  const nextHunger = clamp(
    player.hunger - ticks * HUNGER_DECAY_PER_TICK,
    0,
    100,
  );
  const conditionPressurePerTick =
    nextHunger < HUNGER_PRESSURE_THRESHOLD
      ? HUNGER_CONDITION_PRESSURE_PER_TICK
      : 0;

  return {
    ...player,
    hunger: nextHunger,
    condition: Math.max(0, player.condition - ticks * conditionPressurePerTick),
    lastConditionTickAt: now,
  };
}

function hydratePlayerState(player: GameState["player"]): PlayerState {
  return {
    ...initialGameState.player,
    ...player,
    hunger: player.hunger ?? initialGameState.player.hunger,
    resources: {
      ...initialGameState.player.resources,
      ...player.resources,
    },
    knownRecipes: player.knownRecipes ?? initialGameState.player.knownRecipes,
    unlockedRoutes:
      player.unlockedRoutes ?? initialGameState.player.unlockedRoutes,
    missionQueue: player.missionQueue ?? initialGameState.player.missionQueue,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const now = Date.now();
      const hydratedPlayer = hydratePlayerState(action.payload.player);

      return {
        ...action.payload,
        player: applySurvivalDecay(hydratedPlayer, now),
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

    case "ADJUST_HUNGER":
      return {
        ...state,
        player: {
          ...state.player,
          hunger: clamp(state.player.hunger + action.payload, 0, 100),
        },
      };

    case "RECOVER_CONDITION": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);
      const recoveryAmount = getStatusRecoveryAmount(player.knownRecipes);

      if (player.conditionRecoveryAvailableAt > now) {
        return {
          ...state,
          player,
        };
      }

      if (player.resources.credits < STATUS_RECOVERY_COST) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          condition: clamp(player.condition + recoveryAmount, 0, 100),
          conditionRecoveryAvailableAt: now + STATUS_RECOVERY_COOLDOWN_MS,
          resources: updateSingleResource(
            player.resources,
            "credits",
            -STATUS_RECOVERY_COST,
          ),
        },
      };
    }

    case "CRAFT_MOSS_RATION": {
      const player = state.player;

      if (
        player.resources.bioSamples < MOSS_RATION_RECIPE_COST.bioSamples ||
        player.resources.runeDust < MOSS_RATION_RECIPE_COST.runeDust
      ) {
        return state;
      }

      const spentSamples = updateSingleResource(
        player.resources,
        "bioSamples",
        -MOSS_RATION_RECIPE_COST.bioSamples,
      );
      const spentDust = updateSingleResource(
        spentSamples,
        "runeDust",
        -MOSS_RATION_RECIPE_COST.runeDust,
      );

      return {
        ...state,
        player: {
          ...player,
          resources: updateSingleResource(spentDust, "mossRations", 1),
        },
      };
    }

    case "CONSUME_MOSS_RATION": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);

      if (player.resources.mossRations < 1) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          hunger: clamp(player.hunger + MOSS_RATION_HUNGER_RESTORE, 0, 100),
          condition: clamp(
            player.condition + MOSS_RATION_CONDITION_RESTORE,
            0,
            100,
          ),
          resources: updateSingleResource(player.resources, "mossRations", -1),
        },
      };
    }

    case "USE_FEAST_HALL_OFFER": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);
      const offer = getFeastHallOfferById(action.payload.offerId);

      if (!offer) {
        return {
          ...state,
          player,
        };
      }

      if (player.condition >= 100 || player.conditionRecoveryAvailableAt > now) {
        return {
          ...state,
          player,
        };
      }

      const offerCostEntries = Object.entries(offer.cost).filter(
        (entry): entry is [ResourceKey, number] => typeof entry[1] === "number",
      );

      const canAffordOffer = offerCostEntries.every(
        ([resourceKey, amount]) => player.resources[resourceKey] >= amount,
      );

      if (!canAffordOffer) {
        return {
          ...state,
          player,
        };
      }

      let nextResources = player.resources;

      offerCostEntries.forEach(([resourceKey, amount]) => {
        nextResources = updateSingleResource(nextResources, resourceKey, -amount);
      });

      return {
        ...state,
        player: {
          ...player,
          condition: clamp(player.condition + offer.conditionGain, 0, 100),
          hunger: clamp(player.hunger + offer.hungerDelta, 0, 100),
          conditionRecoveryAvailableAt: now + offer.cooldownMs,
          resources: nextResources,
        },
      };
    }

    case "RESOLVE_HUNT": {
      const now = action.payload.resolvedAt ?? Date.now();
      const player = applySurvivalDecay(state.player, now);
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

      if (
        mission.id === "bio-hunt-specimen" &&
        !player.hasBiotechSpecimenLead
      ) {
        return {
          ...state,
          player,
        };
      }

      const resolvedAt = action.payload.resolvedAt ?? now;
      const resolvedConditionDelta = getResolvedConditionDelta(
        player,
        mission.reward,
      );
      const nextPlayer = applyActivityHungerCost(
        applyMissionReward(player, mission.reward),
        "hunt",
      );

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
            conditionDelta: resolvedConditionDelta,
            conditionAfter: nextPlayer.condition,
            rankXpGained: mission.reward.rankXp,
            masteryProgressGained: mission.reward.masteryProgress,
            influenceGained: mission.reward.influence ?? 0,
            resourcesGained: mission.reward.resources ?? {},

            baseRankXpGained: mission.reward.rankXp,
            baseMasteryProgressGained: mission.reward.masteryProgress,
            baseInfluenceGained: mission.reward.influence ?? 0,
            baseResourcesGained: mission.reward.resources ?? {},

            realtimeContributionBonusMultiplier: null,
            realtimeContributionAppliedForResolvedAt: null,
            realtimeRankXpBonusGained: 0,
            realtimeMasteryProgressBonusGained: 0,
            realtimeInfluenceBonusGained: 0,
            realtimeResourcesBonusGained: {},
          },
        },
      };
    }

    case "APPLY_REALTIME_HUNT_BONUS": {
      const { resolvedAt, bonusMultiplier } = action.payload;
      const latest = state.player.lastHuntResult;
      if (!latest) return state;

      // Idempotency: never apply twice for the same resolvedAt.
      if (latest.realtimeContributionAppliedForResolvedAt === resolvedAt) {
        return state;
      }

      const mission = getMissionById(state.missions, latest.missionId);
      if (!mission || mission.category !== "hunting-ground") return state;

      if (latest.resolvedAt !== resolvedAt) return state;

      const cappedMultiplier = clamp(bonusMultiplier, 0, 0.35);

      const baseRankXpGained =
        latest.baseRankXpGained ?? latest.rankXpGained ?? 0;
      const baseMasteryProgressGained =
        latest.baseMasteryProgressGained ?? latest.masteryProgressGained ?? 0;
      const baseInfluenceGained =
        latest.baseInfluenceGained ?? latest.influenceGained ?? 0;
      const baseResourcesGained =
        latest.baseResourcesGained ?? latest.resourcesGained ?? {};

      const realtimeRankXpBonusGained = Math.round(
        baseRankXpGained * cappedMultiplier,
      );
      const realtimeMasteryProgressBonusGained = Math.round(
        baseMasteryProgressGained * cappedMultiplier,
      );
      const realtimeInfluenceBonusGained = Math.round(
        baseInfluenceGained * cappedMultiplier,
      );

      const realtimeResourcesBonusGained: Partial<ResourcesState> = {};
      const nextResourcesGained: Partial<ResourcesState> = {
        ...latest.resourcesGained,
      };

      (Object.entries(baseResourcesGained) as Array<[ResourceKey, number]>).forEach(
        ([key, baseAmount]) => {
          if (!baseAmount || baseAmount <= 0) return;
          const bonusAmount = Math.floor(baseAmount * cappedMultiplier);
          if (bonusAmount <= 0) return;
          realtimeResourcesBonusGained[key] = bonusAmount;
          nextResourcesGained[key] = (nextResourcesGained[key] ?? 0) + bonusAmount;
        },
      );

      const rankState = applyRankXp(
        state.player.rankLevel,
        state.player.rankXp,
        realtimeRankXpBonusGained,
      );

      const nextPlayerAfterBonus = {
        ...state.player,
        ...rankState,
        masteryProgress: clamp(
          state.player.masteryProgress +
            realtimeMasteryProgressBonusGained,
          0,
          100,
        ),
        influence: Math.max(
          0,
          state.player.influence + realtimeInfluenceBonusGained,
        ),
        resources: addPartialResources(
          state.player.resources,
          realtimeResourcesBonusGained,
        ),
        navigation: buildNavigationState(
          rankState.rankLevel,
          state.player.unlockedRoutes,
          state.player.navigation.currentRoute,
        ),
        lastHuntResult: {
          ...latest,
          realtimeContributionBonusMultiplier: cappedMultiplier,
          realtimeContributionAppliedForResolvedAt: resolvedAt,
          realtimeRankXpBonusGained,
          realtimeMasteryProgressBonusGained,
          realtimeInfluenceBonusGained,
          realtimeResourcesBonusGained,
          rankXpGained: baseRankXpGained + realtimeRankXpBonusGained,
          masteryProgressGained:
            baseMasteryProgressGained + realtimeMasteryProgressBonusGained,
          influenceGained: baseInfluenceGained + realtimeInfluenceBonusGained,
          resourcesGained: nextResourcesGained,
        },
      };

      return {
        ...state,
        player: nextPlayerAfterBonus,
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
            kind: action.payload.kind ?? "exploration",
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
      const player = applySurvivalDecay(state.player, now);
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
      const player = applySurvivalDecay(state.player, now);
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

      const nextPlayer = applyActivityHungerCost(
        applyMissionReward(player, phase1ExplorationReward),
        "exploration",
      );

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

      const queuedPlayer: PlayerState = {
        ...state.player,
        missionQueue: [...missionQueue, nextEntry],
      };

      return {
        ...state,
        player: syncMirroredHuntActiveProcess(
          queuedPlayer,
          queuedPlayer.missionQueue,
          state.missions,
          queuedAt,
        ),
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

      const removedPlayer: PlayerState = {
        ...state.player,
        missionQueue: rebuiltQueue,
      };

      return {
        ...state,
        player: syncMirroredHuntActiveProcess(
          removedPlayer,
          removedPlayer.missionQueue,
          state.missions,
          removedAt,
        ),
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

      const nextPlayer = applyActivityHungerCost(
        applyMissionReward(state.player, mission.reward),
        mission.category === "hunting-ground" ? "hunt" : "mission",
      );
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

      const nextUnlockedRoutes = [
        ...state.player.unlockedRoutes,
        action.payload,
      ];

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
