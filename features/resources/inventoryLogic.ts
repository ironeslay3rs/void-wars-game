import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export const INVENTORY_CAPACITY_MAX = 120;

export const CAPACITY_RESOURCE_KEYS: ResourceKey[] = [
  "ironOre",
  "scrapAlloy",
  "runeDust",
  "emberCore",
  "bioSamples",
  "coilboundLattice",
  "ashSynodRelic",
  "vaultLatticeShard",
  "ironHeart",
];

export type CapacityReport = {
  used: number;
  max: number;
  percent: number;
  overflow: number;
  isOverloaded: boolean;
};

export type OverflowPenalty = {
  missionRewardPenaltyPct: number;
  movementPenaltyPct: number;
  message: string;
};

export function checkCapacity(
  resources: ResourcesState,
  max = INVENTORY_CAPACITY_MAX,
): CapacityReport {
  const used = CAPACITY_RESOURCE_KEYS.reduce(
    (sum, key) => sum + Math.max(0, resources[key] ?? 0),
    0,
  );
  const overflow = Math.max(0, used - max);
  return {
    used,
    max,
    percent: max > 0 ? (used / max) * 100 : 0,
    overflow,
    isOverloaded: overflow > 0,
  };
}

export function getOverflowPenalty(report: CapacityReport): OverflowPenalty {
  if (!report.isOverloaded) {
    return {
      missionRewardPenaltyPct: 0,
      movementPenaltyPct: 0,
      message: "Within carry limits.",
    };
  }

  const missionRewardPenaltyPct = Math.min(40, 10 + Math.floor(report.overflow / 10) * 5);
  const movementPenaltyPct = Math.min(35, 10 + Math.floor(report.overflow / 8) * 5);

  return {
    missionRewardPenaltyPct,
    movementPenaltyPct,
    message: `Overloaded by ${report.overflow}. Mission rewards reduced by ${missionRewardPenaltyPct}% and movement slowed by ${movementPenaltyPct}%.`,
  };
}

export function enforceCapacity(
  current: ResourcesState,
  incoming?: Partial<ResourcesState>,
  max = INVENTORY_CAPACITY_MAX,
): { accepted: Partial<ResourcesState>; blocked: boolean } {
  if (!incoming) {
    return { accepted: {}, blocked: false };
  }

  const accepted: Partial<ResourcesState> = {};
  let blocked = false;
  let used = checkCapacity(current, max).used;

  for (const [k, rawAmount] of Object.entries(incoming)) {
    const key = k as ResourceKey;
    const amount = typeof rawAmount === "number" ? rawAmount : 0;
    if (!Number.isFinite(amount) || amount === 0) continue;

    const isCapacityTracked = CAPACITY_RESOURCE_KEYS.includes(key);
    if (!isCapacityTracked || amount < 0) {
      accepted[key] = amount;
      continue;
    }

    if (used >= max) {
      blocked = true;
      continue;
    }

    const free = max - used;
    const allow = Math.min(amount, free);
    if (allow > 0) {
      accepted[key] = allow;
      used += allow;
    }

    if (allow < amount) {
      blocked = true;
    }
  }

  return { accepted, blocked };
}
