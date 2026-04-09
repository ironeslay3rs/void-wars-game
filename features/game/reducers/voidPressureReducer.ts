import { boostFieldLootAmountForPrep } from "@/features/crafting/prepRunHooks";
import { applyVoidFieldExtractionSettlement } from "@/features/expedition/voidFieldExtractionLedger";
import { addPartialResources, applyRankXp, clamp, getMissionById } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState, ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import {
  appendGuildLedgerEntry,
  applyTheaterGuildBonusesToBase,
  guildPointsFromIntensity,
  huntIntensityFromRealtimeTotals,
} from "@/features/factions/factionWorldLogic";
import { buildNavigationState } from "@/features/navigation/navigationUtils";
import { getRoleSoftModifiers } from "@/features/player/playerIdentity";
import {
  computeVoidStrainFromFieldLootPickup,
} from "@/features/progression/phase3Progression";
import {
  RUN_INSTABILITY_DELTA_RAID,
  attemptPushRunInstability,
  attemptVentRunInstability,
  bumpRunInstability,
  resetRunInstability,
} from "@/features/progression/runInstability";
import { getContributionRole } from "@/features/void-maps/realtime/contributionScoring";
import { rollVoidFieldLoot } from "@/features/void-maps/rollVoidFieldLoot";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { getMasteryAlignedContractResourceMultiplier } from "@/features/mastery/masteryGameplayEffects";
import { getPathAlignedContractResourceMultiplier } from "@/features/economy/pathGatheringYield";
import { bumpRunStylePushCount, bumpRunStyleVentCount } from "@/features/game/runArchetypeLogic";
import { enforcePickup } from "@/features/resources/inventoryLogic";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { updateSingleResource } from "@/features/game/reducers/sharedReducerUtils";

export function handleVoidPressureAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "SET_VOID_REALTIME_BINDING":
      return {
        ...state,
        player: {
          ...state.player,
          voidRealtimeBinding: action.payload,
        },
      };

    case "VOID_FIELD_ORB_COLLECTED": {
      const k = action.payload.key;
      const rawAmt = Math.max(0, Math.floor(action.payload.amount));
      const amt = boostFieldLootAmountForPrep(
        rawAmt,
        state.player.nextRunModifiers,
      );
      if (amt <= 0) return state;
      const cur = state.player.fieldLootGainedThisRun?.[k] ?? 0;
      return {
        ...state,
        player: {
          ...state.player,
          fieldLootGainedThisRun: {
            ...(state.player.fieldLootGainedThisRun ?? {}),
            [k]: cur + amt,
          },
        },
      };
    }

    case "COMMIT_VOID_FIELD_EXTRACTION": {
      const nowMs = action.payload.nowMs ?? Date.now();
      const { player: nextPlayer } = applyVoidFieldExtractionSettlement({
        player: state.player,
        kills: Math.max(0, Math.floor(action.payload.kills)),
        zoneName: action.payload.zoneName,
        zoneId: action.payload.zoneId,
        nowMs,
      });
      return {
        ...state,
        player: nextPlayer,
      };
    }

    case "ADD_FIELD_LOOT": {
      const boostedAmount = boostFieldLootAmountForPrep(
        action.payload.amount,
        state.player.nextRunModifiers,
      );
      const { accepted } = enforcePickup(state.player.resources, {
        [action.payload.key]: boostedAmount,
      });
      const acceptedAmount = accepted[action.payload.key] ?? 0;
      if (acceptedAmount <= 0) {
        return state;
      }
      const nextResources = updateSingleResource(
        state.player.resources,
        action.payload.key,
        acceptedAmount,
      );
      const skipLedger = action.payload.skipRunLedger === true;
      const prevFl = state.player.fieldLootGainedThisRun ?? {};
      const nextFieldLoot = skipLedger
        ? prevFl
        : {
            ...prevFl,
            [action.payload.key]:
              (prevFl[action.payload.key] ?? 0) + acceptedAmount,
          };
      const pickupStrain =
        computeVoidStrainFromFieldLootPickup(acceptedAmount);
      return {
        ...state,
        player: {
          ...state.player,
          resources: nextResources,
          fieldLootGainedThisRun: nextFieldLoot,
          voidInstability: clamp(
            state.player.voidInstability + pickupStrain,
            0,
            100,
          ),
        },
      };
    }

    case "APPLY_VOID_INSTABILITY_DELTA": {
      const delta = action.payload;
      if (!Number.isFinite(delta) || delta === 0) {
        return state;
      }
      return {
        ...state,
        player: {
          ...state.player,
          voidInstability: clamp(
            state.player.voidInstability + delta,
            0,
            100,
          ),
        },
      };
    }

    case "APPLY_REALTIME_HUNT_BONUS": {
      const {
        resolvedAt,
        bonusMultiplier,
        zoneId,
        totalDamageDealt,
        totalHitsLanded,
        mobsContributedTo,
        mobsKilled,
        exposedKills,
        bossDefeated,
        bossDropResourcesBase,
        zoneThreatLevel,
      } = action.payload;
      const latest = state.player.lastHuntResult;
      if (!latest) return state;

      if (latest.realtimeContributionAppliedForResolvedAt === resolvedAt) {
        return state;
      }

      const mission = getMissionById(state.missions, latest.missionId);
      if (!mission || mission.category !== "hunting-ground") return state;

      if (latest.resolvedAt !== resolvedAt) return state;

      const baseCappedMultiplier = clamp(bonusMultiplier, 0, 0.35);
      const prevLastCompletedZoneId = state.player.lastCompletedZoneId;
      const prevZoneRunStreak = state.player.zoneRunStreak ?? 0;

      const nextZoneRunStreak =
        prevLastCompletedZoneId !== null && prevLastCompletedZoneId === zoneId
          ? prevZoneRunStreak + 1
          : 1;
      const nextLastCompletedZoneId = zoneId;

      const streakBonusPct =
        nextZoneRunStreak >= 5 ? 0.1 : nextZoneRunStreak >= 3 ? 0.05 : 0;
      const streakYieldMultiplier = 1 + streakBonusPct;

      const totalDamageForIdentity =
        totalDamageDealt ?? latest.realtimeTotalDamageDealt ?? 0;
      const totalHitsForIdentity =
        totalHitsLanded ?? latest.realtimeTotalHitsLanded ?? 0;
      const mobsContributedToForIdentity =
        mobsContributedTo ?? latest.realtimeMobsContributedTo ?? 0;
      const mobsKilledForIdentity =
        mobsKilled ?? latest.realtimeMobsKilled ?? 0;

      const huntRole = getContributionRole({
        totalDamage: totalDamageForIdentity,
        totalHits: totalHitsForIdentity,
        mobsContributedTo: mobsContributedToForIdentity,
        mobsKilled: mobsKilledForIdentity,
      });

      const prevBehaviorStats = state.player.behaviorStats;
      const nextRoleCounts = {
        ...prevBehaviorStats.roleCounts,
        [huntRole]:
          (prevBehaviorStats.roleCounts[huntRole] ?? 0) + 1,
      };

      const nextBehaviorStats = {
        ...prevBehaviorStats,
        totalRealtimeHuntsWithContribution:
          prevBehaviorStats.totalRealtimeHuntsWithContribution + 1,
        roleCounts: nextRoleCounts,
        lastRealtimeRole: huntRole,
      };

      const softModifiers = getRoleSoftModifiers(nextBehaviorStats);
      const zoneThreatMultiplier =
        typeof zoneThreatLevel === "number"
          ? 1 + Math.max(0, zoneThreatLevel - 1) * 0.04
          : 1;
      const effectiveBonusMultiplier = clamp(
        baseCappedMultiplier *
          (1 + softModifiers.rewardBiasMultiplier) *
          zoneThreatMultiplier,
        0,
        0.35,
      );

      const prevZoneMastery = state.player.zoneMastery ?? {};
      const zoneMasteryLevel =
        zoneId in prevZoneMastery ? prevZoneMastery[zoneId] : 0;
      const resourceEfficiencyFactor = clamp(
        1 + zoneMasteryLevel * 0.01,
        1,
        1.2,
      );
      const bossDropMasteryFactor = clamp(
        1 + zoneMasteryLevel * 0.03,
        1,
        1.25,
      );

      const zoneForMastery = Object.prototype.hasOwnProperty.call(
        voidZoneById,
        zoneId,
      )
        ? voidZoneById[zoneId as VoidZoneId]
        : null;
      const masteryResourceYieldMult = zoneForMastery
        ? getMasteryAlignedContractResourceMultiplier(
            state.player.runeMastery,
            zoneForMastery.lootTheme,
          )
        : 1;
      const pathResourceMult = zoneForMastery
        ? getPathAlignedContractResourceMultiplier(
            state.player.factionAlignment,
            zoneForMastery.lootTheme,
          )
        : 1;

      const nextZoneMastery = {
        ...prevZoneMastery,
        [zoneId]: (prevZoneMastery[zoneId] ?? 0) + 1,
      };

      const baseRankXpGained =
        latest.baseRankXpGained ?? latest.rankXpGained ?? 0;
      const baseMasteryProgressGained =
        latest.baseMasteryProgressGained ?? latest.masteryProgressGained ?? 0;
      const baseInfluenceGained =
        latest.baseInfluenceGained ?? latest.influenceGained ?? 0;
      const baseResourcesGained =
        latest.baseResourcesGained ?? latest.resourcesGained ?? {};

      const realtimeRankXpBonusGained = Math.round(
        baseRankXpGained * effectiveBonusMultiplier,
      );
      const realtimeMasteryProgressBonusGained = Math.round(
        baseMasteryProgressGained * effectiveBonusMultiplier,
      );
      const realtimeInfluenceBonusGained = Math.round(
        baseInfluenceGained * effectiveBonusMultiplier,
      );

      const realtimeResourcesBonusGained: Partial<ResourcesState> = {};
      const nextResourcesGained: Partial<ResourcesState> = {
        ...latest.resourcesGained,
      };

      (Object.entries(baseResourcesGained) as Array<[ResourceKey, number]>).forEach(
        ([key, baseAmount]) => {
          if (!baseAmount || baseAmount <= 0) return;
          const bonusAmount = Math.floor(
            baseAmount *
              effectiveBonusMultiplier *
              resourceEfficiencyFactor *
              streakYieldMultiplier *
              masteryResourceYieldMult *
              pathResourceMult,
          );
          if (bonusAmount <= 0) return;
          realtimeResourcesBonusGained[key] =
            (realtimeResourcesBonusGained[key] ?? 0) + bonusAmount;
          nextResourcesGained[key] = (nextResourcesGained[key] ?? 0) + bonusAmount;
        },
      );

      const bossBaseResourcesGained = bossDropResourcesBase ?? {};
      (Object.entries(
        bossBaseResourcesGained,
      ) as Array<[ResourceKey, number]>).forEach(([key, baseAmount]) => {
        if (!baseAmount || baseAmount <= 0) return;
        const adjustedBaseAmount = Math.floor(baseAmount * bossDropMasteryFactor);
        const bonusAmount = Math.floor(
          adjustedBaseAmount *
            effectiveBonusMultiplier *
            streakYieldMultiplier *
            masteryResourceYieldMult *
            pathResourceMult,
        );
        if (bonusAmount <= 0) return;
        realtimeResourcesBonusGained[key] =
          (realtimeResourcesBonusGained[key] ?? 0) + bonusAmount;
        nextResourcesGained[key] = (nextResourcesGained[key] ?? 0) + bonusAmount;
      });

      if (bossDefeated) {
        if (!Object.prototype.hasOwnProperty.call(voidZoneById, zoneId)) {
          // Unknown zone id: skip themed boss spike safely.
        } else {
          const zone = voidZoneById[zoneId as VoidZoneId];
          const rolledBossLoot = rollVoidFieldLoot({
            zoneLootTheme: zone.lootTheme,
            mobId: "realtime-boss",
            isBoss: true,
            seed: `rt-boss-${zoneId}-${resolvedAt}`,
          });
          rolledBossLoot.forEach((line) => {
            const amt = Math.floor(
              line.amount * masteryResourceYieldMult * pathResourceMult,
            );
            if (amt <= 0) return;
            realtimeResourcesBonusGained[line.resource] =
              (realtimeResourcesBonusGained[line.resource] ?? 0) + amt;
            nextResourcesGained[line.resource] =
              (nextResourcesGained[line.resource] ?? 0) + amt;
          });
        }
      }

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
        behaviorStats: nextBehaviorStats,
        zoneMastery: nextZoneMastery,
        lastCompletedZoneId: nextLastCompletedZoneId,
        zoneRunStreak: nextZoneRunStreak,
        voidRealtimeBinding: null,
        navigation: buildNavigationState(
          rankState.rankLevel,
          state.player.unlockedRoutes,
          state.player.navigation.currentRoute,
        ),
        lastHuntResult: {
          ...latest,
          bossDefeated: bossDefeated ?? latest.bossDefeated ?? false,
          kills: mobsKilledForIdentity,
          damage: totalDamageForIdentity,
          realtimeContributionBonusMultiplier: effectiveBonusMultiplier,
          realtimeContributionAppliedForResolvedAt: resolvedAt,
          realtimeRankXpBonusGained,
          realtimeMasteryProgressBonusGained,
          realtimeInfluenceBonusGained,
          realtimeResourcesBonusGained,
          realtimeTotalDamageDealt:
            totalDamageDealt ?? latest.realtimeTotalDamageDealt ?? 0,
          realtimeTotalHitsLanded:
            totalHitsLanded ?? latest.realtimeTotalHitsLanded ?? 0,
          realtimeMobsContributedTo:
            mobsContributedTo ?? latest.realtimeMobsContributedTo ?? 0,
          realtimeMobsKilled: mobsKilled ?? latest.realtimeMobsKilled ?? 0,
          realtimeExposedKills: exposedKills ?? latest.realtimeExposedKills ?? 0,
          rankXpGained: baseRankXpGained + realtimeRankXpBonusGained,
          masteryProgressGained:
            baseMasteryProgressGained + realtimeMasteryProgressBonusGained,
          influenceGained: baseInfluenceGained + realtimeInfluenceBonusGained,
          resourcesGained: nextResourcesGained,
        },
      };

      const rtGuildIntensity = huntIntensityFromRealtimeTotals({
        totalDamageDealt: totalDamageForIdentity,
        mobsKilled: mobsKilledForIdentity,
        exposedKills: exposedKills ?? latest.realtimeExposedKills ?? 0,
      });
      const supplementalBase = clamp(
        Math.floor(guildPointsFromIntensity(rtGuildIntensity) * 0.5),
        2,
        10,
      );
      const { delta: supplementalGuild, reasonTags: rtGuildTags } =
        applyTheaterGuildBonusesToBase(
          state.player,
          zoneId,
          supplementalBase,
          resolvedAt,
        );
      const rtGuildReason =
        rtGuildTags.length > 0
          ? `Realtime void field · ${rtGuildTags.join(", ")}`
          : "Realtime void field";
      const playerAfterRealtimeGuild =
        supplementalGuild > 0
          ? appendGuildLedgerEntry(nextPlayerAfterBonus, {
              amount: supplementalGuild,
              reason: rtGuildReason,
              at: resolvedAt,
            })
          : nextPlayerAfterBonus;

      return {
        ...state,
        player: bumpRunInstability(
          playerAfterRealtimeGuild,
          RUN_INSTABILITY_DELTA_RAID,
          "Realtime void raid settled — run heat surged.",
        ),
      };
    }

    case "RESET_RUN_INSTABILITY":
      return {
        ...state,
        player: {
          ...resetRunInstability(state.player),
          expeditionReadyStabilityPending: false,
        },
      };

    case "VENT_RUN_INSTABILITY": {
      const r = attemptVentRunInstability(state.player);
      if (!r.ok) return state;
      return { ...state, player: bumpRunStyleVentCount(r.player) };
    }

    case "PUSH_RUN_INSTABILITY": {
      const nowMs = action.payload?.nowMs ?? Date.now();
      const r = attemptPushRunInstability(state.player, nowMs);
      if (!r.ok) return state;
      return { ...state, player: bumpRunStylePushCount(r.player) };
    }

    default:
      return null;
  }
}
