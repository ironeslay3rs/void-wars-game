import type {
  LatestHuntResult,
  PlayerState,
  ResourceKey,
  ResourcesState,
} from "@/features/game/gameTypes";
import {
  checkCapacity,
  getOverflowPenalty,
} from "@/features/resources/inventoryLogic";
import {
  getResourceWarSupplySchool,
  getWarExchangeSellDemandMultiplier,
} from "@/features/world/warDemandMarket";

export function buildCarryPressureSummary(resources: ResourcesState): string {
  const cap = checkCapacity(resources);
  if (!cap.isOverloaded) {
    return `Carry ${cap.used}/${cap.max} — within citadel haul limits.`;
  }
  return getOverflowPenalty(cap).message;
}

export function buildWarExchangeSellLinesForResources(
  player: PlayerState,
  nowMs: number,
  keys: ResourceKey[],
): string[] {
  const lines: string[] = [];
  const seen = new Set<ResourceKey>();
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    if (!getResourceWarSupplySchool(key)) continue;
    const mult = getWarExchangeSellDemandMultiplier(
      key,
      player.factionAlignment,
      nowMs,
    );
    const pct = Math.round((mult - 1) * 100);
    const sign = pct > 0 ? "+" : "";
    lines.push(
      `War Exchange sell on ${key}: ×${mult.toFixed(2)} (${sign}${pct}% vs quiet market)`,
    );
  }
  return lines.slice(0, 8);
}

function resourceKeysWithPositive(
  ...partials: Array<Partial<ResourcesState> | undefined>
): ResourceKey[] {
  const out = new Set<ResourceKey>();
  for (const p of partials) {
    if (!p) continue;
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "number" && v > 0) {
        out.add(k as ResourceKey);
      }
    }
  }
  return [...out];
}

/** Attach readable carry + broker pressure to a hunt result (M1 legibility). */
export function withPostSettlementMarketLegibility(
  result: LatestHuntResult,
  playerAfter: PlayerState,
  resolvedAt: number,
): LatestHuntResult {
  const warKeys = resourceKeysWithPositive(
    result.resourcesGained,
    result.fieldLootGained,
  );
  return {
    ...result,
    carryPressureSummary: buildCarryPressureSummary(playerAfter.resources),
    warExchangeSellPressureLines: buildWarExchangeSellLinesForResources(
      playerAfter,
      resolvedAt,
      warKeys,
    ),
  };
}
