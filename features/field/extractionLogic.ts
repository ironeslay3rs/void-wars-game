import type { ResourceKey } from "@/features/game/gameTypes";

export type ExtractionSummary = {
  zoneName: string;
  kills: number;
  lootCollected: Partial<Record<ResourceKey, number>>;
  xpEarned: number;
  conditionSpent: number;
};

export const VOID_FIELD_EXTRACTION_XP_PER_KILL = 12;
export const VOID_FIELD_EXTRACTION_CONDITION_PER_KILL = 2;

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
    xpEarned: kills * VOID_FIELD_EXTRACTION_XP_PER_KILL,
    conditionSpent: kills * VOID_FIELD_EXTRACTION_CONDITION_PER_KILL,
  };
}

