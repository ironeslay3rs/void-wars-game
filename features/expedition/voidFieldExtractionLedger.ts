import { boostFieldLootAmountForPrep } from "@/features/crafting/prepRunHooks";
import { buildWarExchangeSellLinesForResources } from "@/features/expedition/postRunMarketPressure";
import {
  VOID_FIELD_EXTRACTION_CONDITION_PER_KILL,
  VOID_FIELD_EXTRACTION_XP_PER_KILL,
} from "@/features/field/extractionLogic";
import { applyRankXp, clamp } from "@/features/game/gameMissionUtils";
import type {
  PlayerState,
  ResourceKey,
  ResourcesState,
  VoidFieldExtractionLedgerResult,
} from "@/features/game/gameTypes";
import {
  computeVoidStrainFromFieldLootPickup,
  computeVoidStrainFromVoidFieldExtraction,
} from "@/features/progression/phase3Progression";
import { resetRunInstability } from "@/features/progression/runInstability";
import {
  CAPACITY_RESOURCE_KEYS,
  checkCapacity,
  enforcePickup,
  getOverflowPenalty,
} from "@/features/resources/inventoryLogic";
function sumCapacityTrackedBanked(
  banked: Partial<ResourcesState>,
): number {
  let n = 0;
  for (const key of CAPACITY_RESOURCE_KEYS) {
    n += Math.max(0, Math.floor(banked[key] ?? 0));
  }
  return n;
}

export function computeVoidFieldExtractionLedger(params: {
  player: PlayerState;
  kills: number;
  zoneName: string;
  zoneId?: string;
  nowMs: number;
}): VoidFieldExtractionLedgerResult {
  const { player, kills, zoneName, zoneId, nowMs } = params;
  const resolvedAt = nowMs;
  const ledgerLootAttempted = { ...(player.fieldLootGainedThisRun ?? {}) };

  let resources: ResourcesState = { ...player.resources };
  const carryBefore = checkCapacity(resources);

  const resourcesBanked: Partial<ResourcesState> = {};
  const resourcesRejected: Partial<ResourcesState> = {};
  let pickupStrainFromBanking = 0;

  const keys = Object.keys(ledgerLootAttempted).sort() as ResourceKey[];
  for (const key of keys) {
    const raw = ledgerLootAttempted[key] ?? 0;
    const amt = Math.max(0, Math.floor(raw));
    if (amt <= 0) continue;

    const boosted = boostFieldLootAmountForPrep(amt, player.nextRunModifiers);
    if (boosted <= 0) continue;

    const { accepted } = enforcePickup(resources, { [key]: boosted });
    const acc = accepted[key] ?? 0;
    if (acc > 0) {
      resourcesBanked[key] = (resourcesBanked[key] ?? 0) + acc;
      resources = {
        ...resources,
        [key]: resources[key] + acc,
      };
      pickupStrainFromBanking += computeVoidStrainFromFieldLootPickup(acc);
    }
    if (acc < boosted) {
      resourcesRejected[key] = (resourcesRejected[key] ?? 0) + (boosted - acc);
    }
  }

  const carryAfter = checkCapacity(resources);
  const rankXpGained = kills * VOID_FIELD_EXTRACTION_XP_PER_KILL;
  const conditionSpent = kills * VOID_FIELD_EXTRACTION_CONDITION_PER_KILL;
  const conditionAfter = clamp(player.condition - conditionSpent, 0, 100);
  const lootUnits = sumCapacityTrackedBanked(resourcesBanked);
  const extractionStrainDelta = computeVoidStrainFromVoidFieldExtraction({
    kills,
    conditionAfter,
    conditionDelta: -conditionSpent,
    lootUnits,
  });

  const rejectedParts = Object.entries(resourcesRejected)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .map(([k, v]) => `${k} −${v} (haul limit)`);

  let overloadWhy: string | null = null;
  if (rejectedParts.length > 0) {
    overloadWhy = `${rejectedParts.join("; ")}. Salvage that could not fit stays at the gate.`;
  }
  if (carryAfter.isOverloaded) {
    const pen = getOverflowPenalty(carryAfter);
    overloadWhy = overloadWhy
      ? `${overloadWhy} ${pen.message}`
      : pen.message;
  }

  const bankedKeys = Object.keys(resourcesBanked).filter(
    (k) => (resourcesBanked[k as ResourceKey] ?? 0) > 0,
  ) as ResourceKey[];

  const warExchangeSellPressureLines = buildWarExchangeSellLinesForResources(
    { ...player, resources },
    nowMs,
    bankedKeys,
  );

  return {
    zoneName,
    zoneId,
    resolvedAt,
    kills,
    ledgerLootAttempted,
    resourcesBanked,
    resourcesRejected,
    pickupStrainFromBanking,
    extractionStrainDelta,
    rankXpGained,
    conditionSpent,
    carryBefore: {
      used: carryBefore.used,
      max: carryBefore.max,
      isOverloaded: carryBefore.isOverloaded,
    },
    carryAfter: {
      used: carryAfter.used,
      max: carryAfter.max,
      isOverloaded: carryAfter.isOverloaded,
    },
    overloadWhy,
    warExchangeSellPressureLines,
    resourcesAfterBanking: resources,
  };
}

export function applyVoidFieldExtractionSettlement(params: {
  player: PlayerState;
  kills: number;
  zoneName: string;
  zoneId?: string;
  nowMs: number;
}): { player: PlayerState; ledger: VoidFieldExtractionLedgerResult } {
  const { player, kills, zoneName, zoneId, nowMs } = params;
  const ledger = computeVoidFieldExtractionLedger({
    player,
    kills,
    zoneName,
    zoneId,
    nowMs,
  });

  const rankState = applyRankXp(
    player.rankLevel,
    player.rankXp,
    ledger.rankXpGained,
  );

  const next: PlayerState = resetRunInstability({
    ...player,
    resources: ledger.resourcesAfterBanking,
    fieldLootGainedThisRun: {},
    voidInstability: clamp(
      player.voidInstability +
        ledger.pickupStrainFromBanking +
        ledger.extractionStrainDelta,
      0,
      100,
    ),
    ...rankState,
    condition: clamp(player.condition - ledger.conditionSpent, 0, 100),
    expeditionReadyStabilityPending: false,
    lastVoidFieldExtractionLedger: ledger,
  });

  return { player: next, ledger };
}
