import type { ResourceKey } from "@/features/game/gameTypes";

export type ExtractionSummary = {
  zoneName: string;
  kills: number;
  lootCollected: Partial<Record<ResourceKey, number>>;
  xpEarned: number;
  conditionSpent: number;
};

const XP_PER_KILL = 12;
const CONDITION_PER_KILL = 2;

export function buildExtractionSummary(params: {
  zoneName: string;
  kills: number;
  lootCollected: Partial<Record<ResourceKey, number>>;
}): ExtractionSummary {
  const kills = Math.max(0, Math.floor(params.kills));
  return {
    zoneName: params.zoneName,
    kills,
    lootCollected: params.lootCollected,
    xpEarned: kills * XP_PER_KILL,
    conditionSpent: kills * CONDITION_PER_KILL,
  };
}

