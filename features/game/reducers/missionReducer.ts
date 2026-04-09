import { maybeApplyExpeditionReadyStabilityToReward } from "@/features/expedition/expeditionReadiness";
import { buildExpeditionContractSnapshot } from "@/features/expedition/expeditionContractSnapshot";
import { withPostSettlementMarketLegibility } from "@/features/expedition/postRunMarketPressure";
import { phase1ExplorationReward } from "@/features/exploration/explorationData";
import { applyPrimedPrepRunInstabilityTrim } from "@/features/crafting/prepRunHooks";
import {
  huntIntensityFromMissionRankReward,
  withWorldProgressAfterHunt,
} from "@/features/factions/factionWorldLogic";
import {
  applyActivityHungerCost,
  applyMissionRewardWithVoidStrain,
  buildMissionQueueEntry,
  canAccessMission,
  getMissionById,
  getResolvedConditionDelta,
  processMissionQueue,
  rebuildMissionQueueSchedule,
  syncMirroredHuntActiveProcess,
} from "@/features/game/gameMissionUtils";
import { updateRunArchetypeAfterSettlement } from "@/features/game/runArchetypeLogic";
import type { GameAction, GameState, PathType, PlayerState } from "@/features/game/gameTypes";
import { applyCrossSchoolExposureToPlayer } from "@/features/convergence/convergenceSeed";
import { getDoctrineQueueGate } from "@/features/progression/launchDoctrine";
import {
  applyPathAlignedMasteryBonus,
  getExplorationInstabilitySurchargeCredits,
} from "@/features/progression/phase3Progression";
import {
  applyRunInstabilityMissionSettlement,
} from "@/features/progression/runInstability";
import { isCanonBookMissionUnlocked } from "@/features/progression/canonBookGate";
import { getHungerPressureEffects } from "@/features/status/survival";
import { applySurvivalDecay } from "@/features/game/reducers/survivalReducer";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { updateSingleResource } from "@/features/game/reducers/sharedReducerUtils";

export function handleMissionAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
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
      const hungerEffects = getHungerPressureEffects(player.hunger);

      const nextRunMods = player.nextRunModifiers;
      const settlementMods = nextRunMods?.applyOnSettlement ?? null;
      const nextRunRewardMultiplier =
        settlementMods && typeof settlementMods.rewardBonusPct === "number"
          ? 1 + settlementMods.rewardBonusPct / 100
          : 1;
      const nextRunConditionDeltaOffset =
        (settlementMods?.conditionDrainReduction ?? 0) -
        (settlementMods?.conditionDrainPenalty ?? 0);

      const rewardForResolution =
        hungerEffects.rewardPenaltyPct === 0
          ? mission.reward
          : {
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
            };

      const rewardWithNextRunMods =
        nextRunRewardMultiplier === 1 && nextRunConditionDeltaOffset === 0
          ? rewardForResolution
          : {
              ...rewardForResolution,
              conditionDelta: rewardForResolution.conditionDelta + nextRunConditionDeltaOffset,
              rankXp: Math.round(rewardForResolution.rankXp * nextRunRewardMultiplier),
              masteryProgress: Math.round(
                rewardForResolution.masteryProgress * nextRunRewardMultiplier,
              ),
              influence:
                typeof rewardForResolution.influence === "number"
                  ? Math.round(rewardForResolution.influence * nextRunRewardMultiplier)
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

      const rewardWithPathMastery = applyPathAlignedMasteryBonus(
        rewardWithNextRunMods,
        mission.path,
        player.factionAlignment,
      );
      const riSettled = applyRunInstabilityMissionSettlement(
        player,
        rewardWithPathMastery,
        {
          missionId: mission.id,
          resolvedAt,
          isHuntingGround: mission.category === "hunting-ground",
        },
      );
      const playerAfterRi = applyPrimedPrepRunInstabilityTrim(
        riSettled.player,
        riSettled.player.nextRunModifiers,
        mission.category === "hunting-ground",
      );
      const stabilityApplied = maybeApplyExpeditionReadyStabilityToReward(
        playerAfterRi,
        riSettled.reward,
        mission.category === "hunting-ground",
      );
      const rewardAfterRi = stabilityApplied.reward;
      const playerAfterStability = stabilityApplied.player;
      const resolvedConditionDelta = getResolvedConditionDelta(
        playerAfterStability,
        rewardAfterRi,
      );
      const nextPlayer = updateRunArchetypeAfterSettlement(
        applyActivityHungerCost(
          applyMissionRewardWithVoidStrain(
            playerAfterStability,
            rewardAfterRi,
            mission.path,
          ),
          mission.category === "hunting-ground" ? "hunt" : "mission",
        ),
      );

      const lastHuntResult = withPostSettlementMarketLegibility(
        {
          missionId: mission.id,
          huntTitle: mission.title,
          resolvedAt,
          conditionDelta: resolvedConditionDelta,
          conditionAfter: nextPlayer.condition,
          rankXpGained: rewardAfterRi.rankXp,
          masteryProgressGained: rewardAfterRi.masteryProgress,
          influenceGained: rewardAfterRi.influence ?? 0,
          resourcesGained: rewardAfterRi.resources ?? {},
          fieldLootGained: state.player.fieldLootGainedThisRun ?? {},
          hungerPressureLabel: hungerEffects.label,
          hungerRewardPenaltyPct: hungerEffects.rewardPenaltyPct,
          hungerConditionDrainPenalty: hungerEffects.conditionDrainPenalty,

          baseRankXpGained: rewardAfterRi.rankXp,
          baseMasteryProgressGained: rewardAfterRi.masteryProgress,
          baseInfluenceGained: rewardAfterRi.influence ?? 0,
          baseResourcesGained: rewardAfterRi.resources ?? {},

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
        },
        nextPlayer,
        resolvedAt,
      );

      let resolvedPlayer: PlayerState = {
        ...nextPlayer,
        hasBiotechSpecimenLead:
          mission.id === "bio-hunt-specimen"
            ? false
            : player.hasBiotechSpecimenLead,
        fieldLootGainedThisRun: {},
        lastHuntResult,
      };

      if (
        mission.category === "hunting-ground" &&
        mission.deployZoneId
      ) {
        resolvedPlayer = withWorldProgressAfterHunt(resolvedPlayer, {
          zoneId: mission.deployZoneId,
          intensity: huntIntensityFromMissionRankReward(
            rewardWithNextRunMods.rankXp,
            rewardWithNextRunMods.influence ?? 0,
          ),
          reason: `Contract — ${mission.title}`,
          nowMs: resolvedAt,
        });
      }

      // Silent convergence seed: track cross-school mission loot.
      if (mission.path !== "neutral") {
        const mSchool = mission.path as PathType;
        resolvedPlayer = applyCrossSchoolExposureToPlayer(
          { ...state, player: resolvedPlayer },
          mSchool,
        );
      }

      return {
        ...state,
        player: resolvedPlayer,
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

      const processKind = action.payload.kind ?? "exploration";
      const explorationSurcharge =
        processKind === "exploration"
          ? getExplorationInstabilitySurchargeCredits(
              state.player.voidInstability,
            )
          : 0;

      if (
        explorationSurcharge > 0 &&
        state.player.resources.credits < explorationSurcharge
      ) {
        return state;
      }

      const resourcesAfterTithe =
        explorationSurcharge > 0
          ? updateSingleResource(
              state.player.resources,
              "credits",
              -explorationSurcharge,
            )
          : state.player.resources;

      return {
        ...state,
        player: {
          ...state.player,
          resources: resourcesAfterTithe,
          activeProcess: {
            id: action.payload.id,
            kind: processKind,
            status: "running",
            title: action.payload.title,
            sourceId: action.payload.sourceId ?? null,
            startedAt,
            endsAt: action.payload.endsAt,
          },
          fieldLootGainedThisRun:
            processKind === "hunt" ? {} : state.player.fieldLootGainedThisRun,
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
        applyMissionRewardWithVoidStrain(
          player,
          phase1ExplorationReward,
          "neutral",
        ),
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

    case "QUEUE_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const queuedAt = action.payload.queuedAt ?? Date.now();
      const queueGate = getDoctrineQueueGate(state.player, queuedAt);
      if (!queueGate.canQueue) {
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

      if (!isCanonBookMissionUnlocked(mission.canonBook)) {
        return state;
      }

      const lastEntry = missionQueue[missionQueue.length - 1] ?? null;
      const anchorTime = lastEntry
        ? Math.max(queuedAt, lastEntry.endsAt)
        : queuedAt;

      const nextEntry = buildMissionQueueEntry({
        mission,
        queuedAt,
        anchorTime,
        player: state.player,
      });

      let queuedPlayer: PlayerState = {
        ...state.player,
        missionQueue: [...missionQueue, nextEntry],
      };

      if (mission.category === "hunting-ground") {
        queuedPlayer = {
          ...queuedPlayer,
          expeditionContractSnapshots: {
            ...queuedPlayer.expeditionContractSnapshots,
            [nextEntry.queueId]: buildExpeditionContractSnapshot(
              mission,
              nextEntry,
            ),
          },
        };
      }

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
        player: state.player,
      });

      const nextSnaps = { ...state.player.expeditionContractSnapshots };
      delete nextSnaps[action.payload.queueId];

      const removedPlayer: PlayerState = {
        ...state.player,
        missionQueue: rebuiltQueue,
        expeditionContractSnapshots: nextSnaps,
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

    case "SET_EXPEDITION_READY_STABILITY_PENDING":
      return {
        ...state,
        player: {
          ...state.player,
          expeditionReadyStabilityPending: action.payload.value,
        },
      };

    default:
      return null;
  }
}
