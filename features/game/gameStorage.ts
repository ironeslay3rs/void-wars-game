import { isCharacterPortraitId } from "@/features/characters/characterPortraits";
import { initialGameState } from "@/features/game/initialGameState";
import type {
  ActiveProcess,
  ExpeditionContractSnapshot,
  GameState,
  LatestHuntResult,
  MissionCategory,
  MissionDefinition,
  MissionQueueEntry,
  PlayerState,
  RealtimeFieldRole,
  ResourcesState,
  VoidRealtimeBinding,
} from "@/features/game/gameTypes";
import {
  RUNE_SCHOOLS,
  type PlayerRuneMasteryState,
  type RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  createInitialRuneMastery,
  normalizeRuneDepthFromMinors,
  type EffectiveCapacityOptions,
} from "@/features/mastery/runeMasteryLogic";
import {
  normalizePlayerFactionWorldSlice,
  parseVoidZoneId,
} from "@/features/factions/factionWorldLogic";
import { isRunArchetype } from "@/features/game/runArchetypeLogic";
import { normalizeMythicAscension } from "@/features/progression/mythicAscensionLogic";
import { normalizeCraftWorkOrderSlot } from "@/features/economy/craftWorkOrderData";
import { resolveCharacterCreated } from "@/features/player/characterCreatedGate";
import {
  normalizeGuildContracts,
  normalizeGuildRoster,
} from "@/features/social/guildLiveLogic";
import { deriveActiveRuns } from "@/features/game/lib/runPressure";

export const SAVE_VERSION = 4;

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
    coilboundLattice:
      typeof raw.coilboundLattice === "number"
        ? raw.coilboundLattice
        : initialGameState.player.resources.coilboundLattice,
    ashSynodRelic:
      typeof raw.ashSynodRelic === "number"
        ? raw.ashSynodRelic
        : initialGameState.player.resources.ashSynodRelic,
    vaultLatticeShard:
      typeof raw.vaultLatticeShard === "number"
        ? raw.vaultLatticeShard
        : initialGameState.player.resources.vaultLatticeShard,
    ironHeart:
      typeof raw.ironHeart === "number"
        ? raw.ironHeart
        : initialGameState.player.resources.ironHeart,
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
  if (typeof value.coilboundLattice === "number") {
    result.coilboundLattice = value.coilboundLattice;
  }
  if (typeof value.ashSynodRelic === "number") {
    result.ashSynodRelic = value.ashSynodRelic;
  }
  if (typeof value.vaultLatticeShard === "number") {
    result.vaultLatticeShard = value.vaultLatticeShard;
  }
  if (typeof value.ironHeart === "number") {
    result.ironHeart = value.ironHeart;
  }

  return result;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function normalizeRuneMastery(
  value: unknown,
  relief: EffectiveCapacityOptions,
): PlayerRuneMasteryState {
  const base = createInitialRuneMastery();
  if (!isRecord(value)) {
    return base;
  }

  const depthSrc = isRecord(value.depthBySchool)
    ? value.depthBySchool
    : {};
  const minorSrc = isRecord(value.minorCountBySchool)
    ? value.minorCountBySchool
    : {};
  const capSrc = isRecord(value.capacity) ? value.capacity : {};
  const capMaxSrc = isRecord(value.capacityMax) ? value.capacityMax : {};

  const depthBySchool = { ...base.depthBySchool };
  const minorCountBySchool = { ...base.minorCountBySchool };

  for (const s of RUNE_SCHOOLS) {
    const d = (depthSrc as Record<string, unknown>)[s];
    const m = (minorSrc as Record<string, unknown>)[s];
    if (typeof m === "number") {
      minorCountBySchool[s as RuneSchool] = clampInt(m, 0, 99);
    }
    if (typeof d === "number") {
      depthBySchool[s as RuneSchool] = clampInt(d, 1, 7);
    }
  }

  const capacity = {
    blood:
      typeof capSrc.blood === "number"
        ? Math.max(0, capSrc.blood)
        : base.capacity.blood,
    frame:
      typeof capSrc.frame === "number"
        ? Math.max(0, capSrc.frame)
        : base.capacity.frame,
    resonance:
      typeof capSrc.resonance === "number"
        ? Math.max(0, capSrc.resonance)
        : base.capacity.resonance,
  };

  const capacityMax = {
    blood:
      typeof capMaxSrc.blood === "number"
        ? Math.max(0, capMaxSrc.blood)
        : base.capacityMax.blood,
    frame:
      typeof capMaxSrc.frame === "number"
        ? Math.max(0, capMaxSrc.frame)
        : base.capacityMax.frame,
    resonance:
      typeof capMaxSrc.resonance === "number"
        ? Math.max(0, capMaxSrc.resonance)
        : base.capacityMax.resonance,
  };

  const hybridDrainStacks =
    typeof value.hybridDrainStacks === "number" &&
    Number.isFinite(value.hybridDrainStacks)
      ? Math.max(0, Math.floor(value.hybridDrainStacks))
      : base.hybridDrainStacks;

  return normalizeRuneDepthFromMinors(
    {
      depthBySchool,
      minorCountBySchool,
      capacity,
      capacityMax,
      hybridDrainStacks,
    },
    relief,
  );
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

  if ((value as Record<string, unknown>).fieldLootGained !== undefined) {
    result.fieldLootGained = normalizePartialResources(
      (value as Record<string, unknown>).fieldLootGained,
    );
  }

  const hungerPressureLabelCandidate = (value as Record<string, unknown>)
    .hungerPressureLabel;
  if (
    hungerPressureLabelCandidate === "Fed" ||
    hungerPressureLabelCandidate === "Low" ||
    hungerPressureLabelCandidate === "Starving"
  ) {
    result.hungerPressureLabel = hungerPressureLabelCandidate;
  }

  if (
    typeof (value as Record<string, unknown>).hungerRewardPenaltyPct ===
    "number"
  ) {
    result.hungerRewardPenaltyPct = (value as Record<string, unknown>)
      .hungerRewardPenaltyPct as number;
  }

  if (
    typeof (value as Record<string, unknown>).hungerConditionDrainPenalty ===
    "number"
  ) {
    result.hungerConditionDrainPenalty = (value as Record<string, unknown>)
      .hungerConditionDrainPenalty as number;
  }

  if ((value as Record<string, unknown>).fusionRewardMultiplier === null) {
    result.fusionRewardMultiplier = null;
  } else if (
    typeof (value as Record<string, unknown>).fusionRewardMultiplier === "number"
  ) {
    result.fusionRewardMultiplier = (value as Record<string, unknown>)
      .fusionRewardMultiplier as number;
  }

  if (
    typeof (value as Record<string, unknown>).fusionConditionDeltaOffset ===
    "number"
  ) {
    result.fusionConditionDeltaOffset = (value as Record<string, unknown>)
      .fusionConditionDeltaOffset as number;
  }

  if ((value as Record<string, unknown>).fusionCadenceLabel === null) {
    result.fusionCadenceLabel = null;
  } else if (
    typeof (value as Record<string, unknown>).fusionCadenceLabel === "string"
  ) {
    result.fusionCadenceLabel = (value as Record<string, unknown>)
      .fusionCadenceLabel as string;
  }

  if ((value as Record<string, unknown>).fusionPressureLabel === null) {
    result.fusionPressureLabel = null;
  } else if (
    typeof (value as Record<string, unknown>).fusionPressureLabel === "string"
  ) {
    result.fusionPressureLabel = (value as Record<string, unknown>)
      .fusionPressureLabel as string;
  }

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

  if (typeof value.realtimeTotalDamageDealt === "number") {
    result.realtimeTotalDamageDealt = value.realtimeTotalDamageDealt;
  }
  if (typeof value.realtimeTotalHitsLanded === "number") {
    result.realtimeTotalHitsLanded = value.realtimeTotalHitsLanded;
  }
  if (typeof value.realtimeMobsContributedTo === "number") {
    result.realtimeMobsContributedTo = value.realtimeMobsContributedTo;
  }
  if (typeof value.realtimeMobsKilled === "number") {
    result.realtimeMobsKilled = value.realtimeMobsKilled;
  }
  if (typeof value.realtimeExposedKills === "number") {
    result.realtimeExposedKills = value.realtimeExposedKills;
  }

  const bossDefeatedCandidate = (value as Record<string, unknown>).bossDefeated;
  if (typeof bossDefeatedCandidate === "boolean") {
    result.bossDefeated = bossDefeatedCandidate;
  }
  const killsCandidate = (value as Record<string, unknown>).kills;
  if (typeof killsCandidate === "number") {
    result.kills = killsCandidate;
  }
  const damageCandidate = (value as Record<string, unknown>).damage;
  if (typeof damageCandidate === "number") {
    result.damage = damageCandidate;
  }

  if (
    typeof (value as Record<string, unknown>).carryPressureSummary === "string"
  ) {
    result.carryPressureSummary = (value as Record<string, unknown>)
      .carryPressureSummary as string;
  }

  const warLines = (value as Record<string, unknown>)
    .warExchangeSellPressureLines;
  if (Array.isArray(warLines)) {
    result.warExchangeSellPressureLines = warLines
      .filter((x): x is string => typeof x === "string")
      .slice(0, 12);
  }

  return result;
}

function normalizeExpeditionContractSnapshots(
  value: unknown,
): Record<string, ExpeditionContractSnapshot> {
  if (!isRecord(value)) return {};
  const out: Record<string, ExpeditionContractSnapshot> = {};
  for (const [queueId, rawSnap] of Object.entries(value)) {
    if (typeof queueId !== "string" || !isRecord(rawSnap)) continue;
    if (typeof rawSnap.contractId !== "string") continue;
    if (typeof rawSnap.targetLabel !== "string") continue;
    if (typeof rawSnap.expectedRewardSummary !== "string") continue;
    if (typeof rawSnap.riskStrainPotential !== "string") continue;
    if (
      typeof rawSnap.queuedAt !== "number" ||
      !Number.isFinite(rawSnap.queuedAt)
    ) {
      continue;
    }
    out[queueId] = {
      contractId: rawSnap.contractId,
      targetLabel: rawSnap.targetLabel,
      deployZoneId: parseVoidZoneId(rawSnap.deployZoneId),
      expectedRewardSummary: rawSnap.expectedRewardSummary,
      riskStrainPotential: rawSnap.riskStrainPotential,
      queuedAt: rawSnap.queuedAt,
    };
  }
  return out;
}

function normalizeBehaviorStats(value: unknown) {
  const base = initialGameState.player.behaviorStats;

  if (!isRecord(value)) return base;

  const roleCountsRaw = isRecord(value.roleCounts) ? value.roleCounts : {};

  const roleCounts = {
    Executioner:
      typeof roleCountsRaw.Executioner === "number"
        ? roleCountsRaw.Executioner
        : 0,
    Artillery:
      typeof roleCountsRaw.Artillery === "number"
        ? roleCountsRaw.Artillery
        : 0,
    "Pressure Specialist":
      typeof roleCountsRaw["Pressure Specialist"] === "number"
        ? roleCountsRaw["Pressure Specialist"]
        : 0,
    Spotter:
      typeof roleCountsRaw.Spotter === "number"
        ? roleCountsRaw.Spotter
        : 0,
  };

  const lastRealtimeRoleCandidate = (value as Record<string, unknown>)
    .lastRealtimeRole;
  const lastRealtimeRole: RealtimeFieldRole | null =
    lastRealtimeRoleCandidate === "Executioner" ||
    lastRealtimeRoleCandidate === "Artillery" ||
    lastRealtimeRoleCandidate === "Pressure Specialist" ||
    lastRealtimeRoleCandidate === "Spotter"
      ? (lastRealtimeRoleCandidate as RealtimeFieldRole)
      : null;

  return {
    totalRealtimeHuntsWithContribution:
      typeof value.totalRealtimeHuntsWithContribution === "number"
        ? value.totalRealtimeHuntsWithContribution
        : 0,
    roleCounts,
    lastRealtimeRole,
  };
}

function normalizeVoidRealtimeBinding(
  value: unknown,
): VoidRealtimeBinding | null {
  if (value === null) return null;
  if (!isRecord(value)) return initialGameState.player.voidRealtimeBinding;

  const zoneId =
    typeof value.zoneId === "string" ? value.zoneId : null;
  const sessionBucketId =
    typeof value.sessionBucketId === "number" && Number.isFinite(value.sessionBucketId)
      ? value.sessionBucketId
      : null;
  const clientId =
    typeof value.clientId === "string" ? value.clientId : null;

  if (!zoneId || sessionBucketId === null || !clientId) {
    return initialGameState.player.voidRealtimeBinding;
  }

  return { zoneId, sessionBucketId, clientId };
}

function normalizeZoneMastery(value: unknown) {
  const base = initialGameState.player.zoneMastery;

  if (!isRecord(value)) return base;

  const raw = value as Record<string, unknown>;
  const next: Record<string, number> = { ...base };

  for (const [key, baseValue] of Object.entries(base)) {
    const candidate = raw[key];
    next[key] =
      typeof candidate === "number" && Number.isFinite(candidate)
        ? candidate
        : baseValue;
  }

  return next;
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
      const deployZoneId = parseVoidZoneId(
        (mission as Record<string, unknown>).deployZoneId,
      );

      return {
        ...mission,
        path,
        category,
        ...(deployZoneId ? { deployZoneId } : {}),
      };
    })
    .filter((mission): mission is MissionDefinition => mission !== null);

  return valid.length > 0 ? valid : initialGameState.missions;
}

function normalizePlayer(value: unknown): PlayerState {
  const raw = isRecord(value) ? value : {};
  const rawDistrictState = isRecord(raw.districtState) ? raw.districtState : {};
  const nextRunModifiersCandidate = (raw as Record<string, unknown>)
    .nextRunModifiers;
  const nextRunModifiers =
    isRecord(nextRunModifiersCandidate) &&
    typeof nextRunModifiersCandidate.id === "string" &&
    typeof nextRunModifiersCandidate.title === "string" &&
    typeof nextRunModifiersCandidate.nextRunEffect === "string"
      ? (nextRunModifiersCandidate as PlayerState["nextRunModifiers"])
      : initialGameState.player.nextRunModifiers;

  const playerName =
    typeof raw.playerName === "string"
      ? raw.playerName
      : initialGameState.player.playerName;

  const factionAlignment =
    raw.factionAlignment === "unbound" ||
    raw.factionAlignment === "bio" ||
    raw.factionAlignment === "mecha" ||
    raw.factionAlignment === "pure"
      ? raw.factionAlignment
      : raw.factionAlignment === "spirit"
        ? "pure"
        : initialGameState.player.factionAlignment;

  const mythicAscension = normalizeMythicAscension(
    (raw as Record<string, unknown>).mythicAscension,
  );

  const normalized: PlayerState = {
    ...initialGameState.player,

    playerName,
    factionAlignment,

    characterCreated: resolveCharacterCreated({
      stored:
        typeof raw.characterCreated === "boolean"
          ? raw.characterCreated
          : undefined,
      playerName,
      factionAlignment,
    }),

    characterPortraitId:
      typeof raw.characterPortraitId === "string" &&
      isCharacterPortraitId(raw.characterPortraitId)
        ? raw.characterPortraitId
        : initialGameState.player.characterPortraitId,

    careerFocus:
      raw.careerFocus === "combat" ||
      raw.careerFocus === "gathering" ||
      raw.careerFocus === "crafting"
        ? raw.careerFocus
        : null,

    fieldLoadoutProfile:
      raw.fieldLoadoutProfile === "assault" ||
      raw.fieldLoadoutProfile === "support" ||
      raw.fieldLoadoutProfile === "breach"
        ? raw.fieldLoadoutProfile
        : initialGameState.player.fieldLoadoutProfile,

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
    emergencyRationAvailableAt:
      typeof raw.emergencyRationAvailableAt === "number"
        ? raw.emergencyRationAvailableAt
        : initialGameState.player.emergencyRationAvailableAt,

    lastConditionTickAt:
      typeof raw.lastConditionTickAt === "number"
        ? raw.lastConditionTickAt
        : Date.now(),

    activeFeastHallOfferId:
      raw.activeFeastHallOfferId === null ||
      raw.activeFeastHallOfferId === "scavenger-broth" ||
      raw.activeFeastHallOfferId === "sample-stew" ||
      raw.activeFeastHallOfferId === "mouth-of-inti"
        ? raw.activeFeastHallOfferId
        : initialGameState.player.activeFeastHallOfferId,

    nextRunModifiers,

    nextRunModifiersAppliedForProcessId:
      raw.nextRunModifiersAppliedForProcessId === null ||
      typeof raw.nextRunModifiersAppliedForProcessId === "string"
        ? raw.nextRunModifiersAppliedForProcessId
        : initialGameState.player.nextRunModifiersAppliedForProcessId,

    expeditionReadyStabilityPending:
      typeof (raw as Record<string, unknown>).expeditionReadyStabilityPending ===
      "boolean"
        ? (raw as { expeditionReadyStabilityPending: boolean })
            .expeditionReadyStabilityPending
        : initialGameState.player.expeditionReadyStabilityPending,

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

    voidInstability:
      typeof raw.voidInstability === "number" &&
      Number.isFinite(raw.voidInstability)
        ? Math.max(
            0,
            Math.min(100, Math.round(raw.voidInstability)),
          )
        : initialGameState.player.voidInstability,

    manaMax:
      typeof (raw as Record<string, unknown>).manaMax === "number" &&
      Number.isFinite((raw as { manaMax: number }).manaMax)
        ? Math.max(1, Math.round((raw as { manaMax: number }).manaMax))
        : initialGameState.player.manaMax,
    mana: (() => {
      const rawMax =
        typeof (raw as Record<string, unknown>).manaMax === "number" &&
        Number.isFinite((raw as { manaMax: number }).manaMax)
          ? Math.max(1, Math.round((raw as { manaMax: number }).manaMax))
          : initialGameState.player.manaMax;
      const rawMana = (raw as Record<string, unknown>).mana;
      if (typeof rawMana === "number" && Number.isFinite(rawMana)) {
        return Math.max(0, Math.min(rawMax, Math.round(rawMana)));
      }
      // Legacy save with no mana field — fill to cap so the player isn't
      // stuck looking at an empty bar after the migration.
      return rawMax;
    })(),

    runInstability:
      typeof (raw as Record<string, unknown>).runInstability === "number" &&
      Number.isFinite((raw as { runInstability: number }).runInstability)
        ? Math.max(
            0,
            Math.min(100, Math.round((raw as { runInstability: number }).runInstability)),
          )
        : initialGameState.player.runInstability,

    runInstabilityLog: Array.isArray(
      (raw as Record<string, unknown>).runInstabilityLog,
    )
      ? ((raw as { runInstabilityLog: unknown[] }).runInstabilityLog
          .filter(
            (e): e is { at: number; message: string } =>
              !!e &&
              typeof e === "object" &&
              typeof (e as { at?: unknown }).at === "number" &&
              typeof (e as { message?: unknown }).message === "string",
          )
          .slice(-30))
      : initialGameState.player.runInstabilityLog,

    runHeatPushBoost: (() => {
      const v = (raw as Record<string, unknown>).runHeatPushBoost;
      if (!v || typeof v !== "object") return initialGameState.player.runHeatPushBoost;
      const o = v as Record<string, unknown>;
      const rewardMult =
        typeof o.rewardMult === "number" && o.rewardMult > 1 ? o.rewardMult : null;
      const expiresAt =
        typeof o.expiresAt === "number" && Number.isFinite(o.expiresAt)
          ? o.expiresAt
          : null;
      if (rewardMult === null || expiresAt === null) {
        return initialGameState.player.runHeatPushBoost;
      }
      return { rewardMult, expiresAt };
    })(),

    instabilityStreakTurns: (() => {
      const v = (raw as Record<string, unknown>).instabilityStreakTurns;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(999, Math.floor(v)))
        : initialGameState.player.instabilityStreakTurns;
    })(),

    runArchetype: isRunArchetype(
      (raw as Record<string, unknown>).runArchetype,
    )
      ? (raw as { runArchetype: typeof initialGameState.player.runArchetype })
          .runArchetype
      : initialGameState.player.runArchetype,
    runStyleRiSamples: Array.isArray(
      (raw as Record<string, unknown>).runStyleRiSamples,
    )
      ? (raw as { runStyleRiSamples: unknown[] }).runStyleRiSamples
          .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
          .map((x) => clampInt(Math.round(x), 0, 100))
          .slice(-12)
      : initialGameState.player.runStyleRiSamples,
    runStyleVentCount: (() => {
      const v = (raw as Record<string, unknown>).runStyleVentCount;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(9999, Math.floor(v)))
        : initialGameState.player.runStyleVentCount;
    })(),
    runStylePushCount: (() => {
      const v = (raw as Record<string, unknown>).runStylePushCount;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(9999, Math.floor(v)))
        : initialGameState.player.runStylePushCount;
    })(),

    craftWorkOrder: normalizeCraftWorkOrderSlot(
      (raw as { craftWorkOrder?: unknown }).craftWorkOrder,
    ),

    lastStallRentResolvedAt: (() => {
      const v = (raw as Record<string, unknown>).lastStallRentResolvedAt;
      return typeof v === "number" && Number.isFinite(v)
        ? v
        : initialGameState.player.lastStallRentResolvedAt;
    })(),

    stallArrearsCount: (() => {
      const v = (raw as Record<string, unknown>).stallArrearsCount;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(99, Math.floor(v)))
        : initialGameState.player.stallArrearsCount;
    })(),

    resources: normalizeResources(raw.resources),
    fieldLootGainedThisRun:
      raw.fieldLootGainedThisRun !== undefined
        ? normalizePartialResources(raw.fieldLootGainedThisRun)
        : initialGameState.player.fieldLootGainedThisRun,

    expeditionContractSnapshots: normalizeExpeditionContractSnapshots(
      (raw as Record<string, unknown>).expeditionContractSnapshots,
    ),
    lastVoidFieldExtractionLedger: null,

    knownRecipes: Array.isArray(raw.knownRecipes)
      ? raw.knownRecipes.filter(
          (recipe): recipe is string => typeof recipe === "string",
        )
      : initialGameState.player.knownRecipes,

    unlockedRoutes: Array.isArray(raw.unlockedRoutes)
      ? raw.unlockedRoutes
          .filter((route): route is string => typeof route === "string")
          .map((route) => (route === "spirit-sanctum" ? "pure-sanctum" : route))
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
    voidRealtimeBinding: normalizeVoidRealtimeBinding(raw.voidRealtimeBinding),
    behaviorStats: normalizeBehaviorStats(raw.behaviorStats),
    zoneMastery: normalizeZoneMastery(raw.zoneMastery),
    lastCompletedZoneId:
      raw.lastCompletedZoneId === null ||
      typeof raw.lastCompletedZoneId === "string"
        ? raw.lastCompletedZoneId
        : initialGameState.player.lastCompletedZoneId,
    zoneRunStreak:
      typeof raw.zoneRunStreak === "number" && Number.isFinite(raw.zoneRunStreak)
        ? raw.zoneRunStreak
        : initialGameState.player.zoneRunStreak,
    missionQueue: normalizeMissionQueue(raw.missionQueue),

    maxMissionQueueSlots:
      typeof raw.maxMissionQueueSlots === "number"
        ? raw.maxMissionQueueSlots
        : initialGameState.player.maxMissionQueueSlots,

    runeMastery: normalizeRuneMastery(
      (raw as Record<string, unknown>).runeMastery,
      {
        crafterHybridRelief: mythicAscension.runeCrafterLicense,
        convergenceHybridRelief: mythicAscension.convergencePrimed,
      },
    ),

    ...normalizePlayerFactionWorldSlice(raw as PlayerState),

    guild: normalizeGuildRoster((raw as Record<string, unknown>).guild),
    guildContracts: normalizeGuildContracts(
      (raw as Record<string, unknown>).guildContracts,
    ),

    mythicAscension,

    brokerCooldowns:
      isRecord((raw as Record<string, unknown>).brokerCooldowns)
        ? (Object.fromEntries(
            Object.entries(
              (raw as Record<string, unknown>).brokerCooldowns as Record<string, unknown>,
            ).filter(
              ([, v]) => typeof v === "number" && Number.isFinite(v as number),
            ),
          ) as Record<string, number>)
        : {},

    brokerRapport: isRecord((raw as Record<string, unknown>).brokerRapport)
      ? (Object.fromEntries(
          Object.entries(
            (raw as Record<string, unknown>).brokerRapport as Record<string, unknown>,
          )
            .filter(
              ([, v]) => typeof v === "number" && Number.isFinite(v as number),
            )
            .map(([k, v]) => [k, Math.max(0, Math.min(100, v as number))]),
        ) as Record<string, number>)
      : {},

    brokerDialogueUnlocks: isRecord(
      (raw as Record<string, unknown>).brokerDialogueUnlocks,
    )
      ? (Object.fromEntries(
          Object.entries(
            (raw as Record<string, unknown>).brokerDialogueUnlocks as Record<
              string,
              unknown
            >,
          )
            .filter(([, v]) => Array.isArray(v))
            .map(([k, v]) => [
              k,
              (v as unknown[]).filter((s): s is string => typeof s === "string"),
            ]),
        ) as Record<string, string[]>)
      : {},

    brokerLastContactAt: isRecord(
      (raw as Record<string, unknown>).brokerLastContactAt,
    )
      ? (Object.fromEntries(
          Object.entries(
            (raw as Record<string, unknown>).brokerLastContactAt as Record<
              string,
              unknown
            >,
          ).filter(
            ([, v]) => typeof v === "number" && Number.isFinite(v as number),
          ),
        ) as Record<string, number>)
      : {},

    affinitySchoolId:
      typeof (raw as Record<string, unknown>).affinitySchoolId === "string"
        ? ((raw as Record<string, unknown>).affinitySchoolId as string)
        : null,

    pantheonBlessingPending:
      typeof (raw as Record<string, unknown>).pantheonBlessingPending ===
      "boolean"
        ? ((raw as { pantheonBlessingPending: boolean })
            .pantheonBlessingPending as boolean)
        : initialGameState.player.pantheonBlessingPending,

    activeShellBuffs: Array.isArray(
      (raw as Record<string, unknown>).activeShellBuffs,
    )
      ? ((raw as { activeShellBuffs: unknown[] }).activeShellBuffs.filter(
          (b): b is import("@/features/combat/shellAbilities").ShellBuff =>
            !!b &&
            typeof b === "object" &&
            typeof (b as { abilityId?: unknown }).abilityId === "string" &&
            typeof (b as { expiresAt?: unknown }).expiresAt === "number" &&
            typeof (b as { damageBonusPct?: unknown }).damageBonusPct ===
              "number",
        ) as import("@/features/combat/shellAbilities").ShellBuff[])
      : [],
  };

  return {
    ...normalized,
    activeRuns: deriveActiveRuns(normalized),
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
