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
import {
  checkCapacity,
  enforcePickup,
  getOverflowPenalty,
} from "@/features/resources/inventoryLogic";
import { getFusionContractModifiers } from "@/features/progression/fusionProgression";
import {
  applyPathAlignedMasteryBonus,
  computeVoidInstabilityGain,
  getVoidInstabilityExtraConditionDrain,
  withVoidInstabilityDelta,
} from "@/features/progression/phase3Progression";
import { applyRunInstabilityMissionSettlement } from "@/features/progression/runInstability";
import { applyDoctrineWarToMissionReward } from "@/features/world/zoneDoctrineWarEffects";
import { applyPrimedPrepRunInstabilityTrim } from "@/features/crafting/prepRunHooks";
import { maybeApplyExpeditionReadyStabilityToReward } from "@/features/expedition/expeditionReadiness";
import { updateRunArchetypeAfterSettlement } from "@/features/game/runArchetypeLogic";
import { withPostSettlementMarketLegibility } from "@/features/expedition/postRunMarketPressure";
import {
  MANA_PER_HUNTING_GROUND_SETTLEMENT,
  MANA_PER_MISSION_SETTLEMENT,
} from "@/features/mana/manaTypes";
import {
  PANTHEON_BLESSING_REWARD_BONUS_PCT,
  getPantheonMatchRewardMultiplier,
} from "@/features/pantheons/pantheonReward";
import { applyPantheonPerkToPlayer } from "@/features/pantheons/pantheonPerks";
import { getConvergenceRewardMultiplier } from "@/features/convergence/convergencePayoff";
import { applySchoolMasteryPassive } from "@/features/mastery/schoolMasteryPassives";
import {
  getBonehowlBountyRewardMultiplier,
  getMandateBureauTaxMultiplier,
} from "@/features/institutions/institutionalPressure";
import {
  PRESSURE_FRAGILITY_INSTABILITY_NUDGE,
  isLoadoutFragileTo,
} from "@/features/loadout/loadoutPressureCompatibility";
import { getRuneSetRewardMultiplier } from "@/features/mastery/runeSetDetection";
import { getSchoolsByEmpire } from "@/features/schools/schoolSelectors";
import { dominantDoctrinePath } from "@/features/factions/factionWorldLogic";

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stripExpeditionContractSnapshot(
  snaps: PlayerState["expeditionContractSnapshots"],
  queueId: string,
): PlayerState["expeditionContractSnapshots"] {
  if (!(queueId in snaps)) return snaps;
  const { [queueId]: _removed, ...rest } = snaps;
  return rest;
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
  const { accepted } = enforcePickup(current, incoming);

  return {
    credits: current.credits + (accepted.credits ?? 0),
    ironOre: current.ironOre + (accepted.ironOre ?? 0),
    scrapAlloy: current.scrapAlloy + (accepted.scrapAlloy ?? 0),
    runeDust: current.runeDust + (accepted.runeDust ?? 0),
    emberCore: current.emberCore + (accepted.emberCore ?? 0),
    bioSamples: current.bioSamples + (accepted.bioSamples ?? 0),
    mossRations: current.mossRations + (accepted.mossRations ?? 0),
    coilboundLattice:
      current.coilboundLattice + (accepted.coilboundLattice ?? 0),
    ashSynodRelic: current.ashSynodRelic + (accepted.ashSynodRelic ?? 0),
    vaultLatticeShard:
      current.vaultLatticeShard + (accepted.vaultLatticeShard ?? 0),
    ironHeart: current.ironHeart + (accepted.ironHeart ?? 0),
  };
}

function getAppliedResourceGain(
  before: ResourcesState,
  after: ResourcesState,
): Partial<ResourcesState> {
  const gained: Partial<ResourcesState> = {};

  for (const [key, afterValue] of Object.entries(after)) {
    const resourceKey = key as keyof ResourcesState;
    const beforeValue = before[resourceKey] ?? 0;
    const delta = afterValue - beforeValue;

    if (delta > 0) {
      gained[resourceKey] = delta;
    }
  }

  return gained;
}

export function getResolvedConditionDelta(
  player: PlayerState,
  reward: MissionReward,
) {
  const base = getPressureAdjustedConditionDelta(
    player.condition,
    reward.conditionDelta,
  );
  return (
    base - getVoidInstabilityExtraConditionDrain(player.voidInstability)
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

/** Phase 3 — apply payout and accumulate Void strain from the contract outcome. */
/** Hunt / void-sector missions: scale payout + strain from live zone doctrine pressure. */
export function mergeDoctrineWarIntoReward(
  reward: MissionReward,
  mission: MissionDefinition,
  player: PlayerState,
): { reward: MissionReward; extraVoidInstability: number } {
  if (!mission.deployZoneId) return { reward, extraVoidInstability: 0 };
  const pressure = player.zoneDoctrinePressure[mission.deployZoneId];
  if (!pressure) return { reward, extraVoidInstability: 0 };
  return applyDoctrineWarToMissionReward(
    reward,
    mission.deployZoneId,
    pressure,
    player.factionAlignment,
  );
}

export function applyMissionRewardWithVoidStrain(
  player: PlayerState,
  reward: MissionReward,
  missionPath: PathType | "neutral",
): PlayerState {
  const resolvedConditionDelta = getResolvedConditionDelta(player, reward);
  const after = applyMissionReward(player, reward);
  return withVoidInstabilityDelta(
    after,
    computeVoidInstabilityGain({
      conditionAfter: after.condition,
      resolvedConditionDelta,
      missionPath,
      factionAlignment: player.factionAlignment,
    }),
  );
}

function applyOverloadPenaltyToReward(
  player: PlayerState,
  reward: MissionReward,
): MissionReward {
  const capacity = checkCapacity(player.resources);
  if (!capacity.isOverloaded) {
    return reward;
  }

  const penalty = getOverflowPenalty(capacity);
  const rewardMultiplier = Math.max(0, 1 - penalty.missionRewardPenaltyPct / 100);

  return {
    ...reward,
    rankXp: Math.max(0, Math.round(reward.rankXp * rewardMultiplier)),
    masteryProgress: Math.max(
      0,
      Math.round(reward.masteryProgress * rewardMultiplier),
    ),
    influence:
      typeof reward.influence === "number"
        ? Math.max(0, Math.round(reward.influence * rewardMultiplier))
        : undefined,
    resources: reward.resources
      ? (Object.fromEntries(
          Object.entries(reward.resources).map(([key, value]) => [
            key,
            Math.max(0, Math.round(value * rewardMultiplier)),
          ]),
        ) as typeof reward.resources)
      : undefined,
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

function getMissionDurationWithLoadPenaltyMs(
  mission: MissionDefinition,
  player: PlayerState,
) {
  const capacity = checkCapacity(player.resources);
  const penalty = getOverflowPenalty(capacity);
  const durationMultiplier = Math.max(1, penalty.missionSpeedPenalty);
  return Math.round(getMissionDurationMs(mission) * durationMultiplier);
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
  player: PlayerState;
}): MissionQueueEntry {
  const { mission, queuedAt, anchorTime, player } = params;
  const startsAt = anchorTime;
  const endsAt = startsAt + getMissionDurationWithLoadPenaltyMs(mission, player);

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
  player: PlayerState;
}) {
  const { queue, missions, now, player } = params;

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
    const endsAt = startsAt + getMissionDurationWithLoadPenaltyMs(mission, player);

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

    nextPlayer = {
      ...nextPlayer,
      expeditionContractSnapshots: stripExpeditionContractSnapshot(
        nextPlayer.expeditionContractSnapshots,
        entry.queueId,
      ),
    };

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

    const queueLoadAtSettlement = safeQueue.filter(
      (queueEntry) =>
        queueEntry.completedAt === null && queueEntry.endsAt >= entry.endsAt,
    ).length;

    const fusionModifiers =
      mission.category === "hunting-ground"
        ? getFusionContractModifiers(nextPlayer, now, queueLoadAtSettlement)
        : null;

    const rewardWithFusionMods =
      mission.category !== "hunting-ground" || fusionModifiers === null
        ? rewardWithNextRunMods
        : {
            ...rewardWithNextRunMods,
            conditionDelta:
              rewardWithNextRunMods.conditionDelta +
              fusionModifiers.conditionDeltaOffset,
            rankXp: Math.max(
              0,
              Math.round(
                rewardWithNextRunMods.rankXp * fusionModifiers.rewardMultiplier,
              ),
            ),
            masteryProgress: Math.max(
              0,
              Math.round(
                rewardWithNextRunMods.masteryProgress *
                  fusionModifiers.rewardMultiplier,
              ),
            ),
            influence:
              typeof rewardWithNextRunMods.influence === "number"
                ? Math.max(
                    0,
                    Math.round(
                      rewardWithNextRunMods.influence *
                        fusionModifiers.rewardMultiplier,
                    ),
                  )
                : undefined,
            resources: rewardWithNextRunMods.resources
              ? (Object.fromEntries(
                  Object.entries(rewardWithNextRunMods.resources).map(
                    ([key, value]) => [
                      key,
                      Math.max(
                        0,
                        Math.round(value * fusionModifiers.rewardMultiplier),
                      ),
                    ],
                  ),
                ) as typeof rewardWithNextRunMods.resources)
              : undefined,
          };

    const rewardWithPathMastery = applyPathAlignedMasteryBonus(
      rewardWithFusionMods,
      mission.path,
      nextPlayer.factionAlignment,
    );

    const doctrineMerged = mergeDoctrineWarIntoReward(
      rewardWithPathMastery,
      mission,
      nextPlayer,
    );
    const rewardWithDoctrine = doctrineMerged.reward;
    const doctrineExtraVoid = doctrineMerged.extraVoidInstability;

    // Pantheon + institutional reward bonuses — composed multiplicatively
    // from four independent sources:
    //   1. Pantheon visit blessing (one-shot, +10%, consumed downstream)
    //   2. Pantheon match (always-on, +5% when origin tag matches affinity)
    //   3. Bonehowl Syndicate bounty (wrath origin, +2-6% by faction)
    //   4. Mandate Bureau patience tax (-1-3% when over-pressured)
    // All nudges sit in small bands so they compose with doctrine +
    // fusion mods without dominating them.
    const pantheonBlessingActive = nextPlayer.pantheonBlessingPending === true;
    const pantheonBlessingMult = pantheonBlessingActive
      ? 1 + PANTHEON_BLESSING_REWARD_BONUS_PCT / 100
      : 1;
    const pantheonMatchMult = getPantheonMatchRewardMultiplier(
      nextPlayer,
      mission.originTag,
    );
    const bonehowlBountyMult = getBonehowlBountyRewardMultiplier(
      nextPlayer,
      mission.originTag,
    );
    const mandateBureauTaxMult = getMandateBureauTaxMultiplier(nextPlayer);
    const runeSetMult = getRuneSetRewardMultiplier(nextPlayer.runeMastery);
    const convergenceMult = getConvergenceRewardMultiplier(nextPlayer);
    const pantheonCompositeMult =
      pantheonBlessingMult *
      pantheonMatchMult *
      bonehowlBountyMult *
      mandateBureauTaxMult *
      runeSetMult *
      convergenceMult;
    const pantheonBonusActive = pantheonCompositeMult !== 1;
    const rewardWithPantheonBlessing = pantheonBonusActive
      ? {
          ...rewardWithDoctrine,
          rankXp: Math.round(rewardWithDoctrine.rankXp * pantheonCompositeMult),
          masteryProgress: Math.round(
            rewardWithDoctrine.masteryProgress * pantheonCompositeMult,
          ),
          influence:
            typeof rewardWithDoctrine.influence === "number"
              ? Math.round(rewardWithDoctrine.influence * pantheonCompositeMult)
              : undefined,
          resources: rewardWithDoctrine.resources
            ? (Object.fromEntries(
                Object.entries(rewardWithDoctrine.resources).map(
                  ([key, value]) => [
                    key,
                    Math.round(value * pantheonCompositeMult),
                  ],
                ),
              ) as typeof rewardWithDoctrine.resources)
            : undefined,
        }
      : rewardWithDoctrine;

    const riSettled = applyRunInstabilityMissionSettlement(
      nextPlayer,
      rewardWithPantheonBlessing,
      {
        missionId: mission.id,
        resolvedAt: entry.endsAt,
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
    const playerAfterStability = stabilityApplied.player;
    const rewardAfterRi = stabilityApplied.reward;

    const resolvedConditionDelta = getResolvedConditionDelta(
      playerAfterStability,
      rewardAfterRi,
    );
    const rewardWithOverloadPenalty = applyOverloadPenaltyToReward(
      playerAfterStability,
      rewardAfterRi,
    );

    const playerBeforeReward = playerAfterStability;
    let playerAfterInstability = applyMissionRewardWithVoidStrain(
      playerAfterStability,
      rewardWithOverloadPenalty,
      mission.path,
    );
    if (doctrineExtraVoid > 0) {
      playerAfterInstability = withVoidInstabilityDelta(
        playerAfterInstability,
        doctrineExtraVoid,
      );
    }

    // Pressure-aware encounter math: when this hunting-ground mission's
    // deploy zone is held by an empire whose schools include a pressure
    // type the player's current loadout is fragile to, add a small extra
    // void instability nudge ("the wrong kit wears faster"). Fires once
    // per matched mission, not per matched school.
    if (
      mission.category === "hunting-ground" &&
      mission.deployZoneId !== undefined
    ) {
      const zonePressure =
        playerAfterInstability.zoneDoctrinePressure?.[mission.deployZoneId];
      if (zonePressure) {
        const dominantEmpire = dominantDoctrinePath(zonePressure);
        const fragilityMatched = getSchoolsByEmpire(dominantEmpire).some(
          (s) =>
            isLoadoutFragileTo(
              playerAfterInstability.fieldLoadoutProfile,
              s.pressure,
            ),
        );
        if (fragilityMatched) {
          playerAfterInstability = withVoidInstabilityDelta(
            playerAfterInstability,
            PRESSURE_FRAGILITY_INSTABILITY_NUDGE,
          );
        }
      }
    }
    const appliedResourceGain = getAppliedResourceGain(
      playerBeforeReward.resources,
      playerAfterInstability.resources,
    );

    nextPlayer = applyActivityHungerCost(
      playerAfterInstability,
      mission.category === "hunting-ground" ? "hunt" : "mission",
    );
    nextPlayer = updateRunArchetypeAfterSettlement(nextPlayer);
    // Mana foundation: every settled mission grants a small amount of mana,
    // with hunting-ground runs paying slightly more (more cycles, more
    // pressure absorbed). Capped to manaMax to avoid overflow.
    {
      const manaGain =
        mission.category === "hunting-ground"
          ? MANA_PER_HUNTING_GROUND_SETTLEMENT
          : MANA_PER_MISSION_SETTLEMENT;
      nextPlayer = {
        ...nextPlayer,
        mana: clamp(nextPlayer.mana + manaGain, 0, nextPlayer.manaMax),
      };
    }
    // Consume the pantheon visit blessing flag if it was active for this
    // settlement. The reward bonus has already been applied above; the
    // flag is one-shot per visit.
    if (pantheonBlessingActive) {
      nextPlayer = {
        ...nextPlayer,
        pantheonBlessingPending: false,
      };
    }
    // Pantheon perk — persistent passive bonus. Applied once per settled
    // mission, after all other reward/penalty math. Small flat deltas
    // that match the cultural domain of the player's aligned pantheon.
    nextPlayer = applyPantheonPerkToPlayer(nextPlayer);
    // Per-school mastery passive (Bio: +3 condition, Mecha: -2 void
    // instability, Pure: +3 mana) — fires when primary school depth
    // meets the threshold. Distinct from pantheon perks (cultural) and
    // rune set bonuses (reward mult).
    nextPlayer = applySchoolMasteryPassive(nextPlayer);
    playerChanged = true;

    if (mission.category === "hunting-ground") {
      const fieldLoot = nextPlayer.fieldLootGainedThisRun ?? {};
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_RUNTIME !== "edge"
      ) {
        // Greppable dev telemetry: confirms settlement copies the run ledger before it is cleared.
        // (Pickup path: VOID_FIELD_ORB_COLLECTED → ledger; extract: ADD_FIELD_LOOT + skipRunLedger.)
        console.info("[void-wars:hunt-field-loot]", {
          missionId: mission.id,
          queueId: entry.queueId,
          resolvedAt: entry.endsAt,
          fieldLootGainedSnapshot: fieldLoot,
        });
      }
      // Clear next-run modifiers after the run ends (single-use, non-stacking).
      nextPlayer = {
        ...nextPlayer,
        nextRunModifiers: null,
        nextRunModifiersAppliedForProcessId: null,
        fieldLootGainedThisRun: {},
      };
      latestHgHuntResult = withPostSettlementMarketLegibility(
        {
          missionId: mission.id,
          huntTitle: mission.title,
          resolvedAt: entry.endsAt,
          conditionDelta: resolvedConditionDelta,
          conditionAfter: nextPlayer.condition,
          rankXpGained: rewardWithOverloadPenalty.rankXp,
          masteryProgressGained: rewardWithOverloadPenalty.masteryProgress,
          influenceGained: rewardWithOverloadPenalty.influence ?? 0,
          resourcesGained: appliedResourceGain,
          fieldLootGained: fieldLoot,
          hungerPressureLabel: hungerEffects?.label,
          hungerRewardPenaltyPct: hungerEffects?.rewardPenaltyPct,
          hungerConditionDrainPenalty: hungerEffects?.conditionDrainPenalty,
          fusionRewardMultiplier: fusionModifiers?.rewardMultiplier ?? null,
          fusionConditionDeltaOffset: fusionModifiers?.conditionDeltaOffset ?? 0,
          fusionCadenceLabel: fusionModifiers?.cadenceLabel ?? null,
          fusionPressureLabel: fusionModifiers?.pressureLabel ?? null,

          baseRankXpGained: rewardWithOverloadPenalty.rankXp,
          baseMasteryProgressGained: rewardWithOverloadPenalty.masteryProgress,
          baseInfluenceGained: rewardWithOverloadPenalty.influence ?? 0,
          baseResourcesGained: appliedResourceGain,

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
        entry.endsAt,
      );

      if (mission.deployZoneId) {
        nextPlayer = withWorldProgressAfterHunt(nextPlayer, {
          zoneId: mission.deployZoneId,
          intensity: huntIntensityFromMissionRankReward(
            rewardWithOverloadPenalty.rankXp,
            rewardWithOverloadPenalty.influence ?? 0,
          ),
          reason: `Contract resolved — ${mission.title}`,
          nowMs: entry.endsAt,
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
