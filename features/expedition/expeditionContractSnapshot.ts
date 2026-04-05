import type {
  MissionDefinition,
  MissionQueueEntry,
  ExpeditionContractSnapshot,
} from "@/features/game/gameTypes";
import { voidZoneById } from "@/features/void-maps/zoneData";

export function buildExpeditionContractSnapshot(
  mission: MissionDefinition,
  entry: MissionQueueEntry,
): ExpeditionContractSnapshot {
  const targetLabel =
    mission.deployZoneId && voidZoneById[mission.deployZoneId]
      ? voidZoneById[mission.deployZoneId].label
      : mission.title;

  const reward = mission.reward;
  const parts: string[] = [];
  if (reward.rankXp > 0) parts.push(`+${reward.rankXp} rank XP`);
  if (reward.masteryProgress > 0) {
    parts.push(`+${reward.masteryProgress} mastery`);
  }
  if (typeof reward.influence === "number" && reward.influence > 0) {
    parts.push(`+${reward.influence} influence`);
  }
  const res = reward.resources;
  if (res) {
    for (const [k, v] of Object.entries(res)) {
      if (typeof v === "number" && v > 0) {
        parts.push(`+${v} ${k}`);
      }
    }
  }

  const expectedRewardSummary =
    parts.length > 0
      ? parts.slice(0, 5).join(" · ") + (parts.length > 5 ? " · …" : "")
      : "Timer contract — see Hunt Result for final totals.";

  const riskStrainPotential =
    `Contract wear ${reward.conditionDelta} condition on close; Void strain rises with sector friction, haul weight, and how thin you run.`;

  return {
    contractId: mission.id,
    targetLabel,
    deployZoneId: mission.deployZoneId,
    expectedRewardSummary,
    riskStrainPotential,
    queuedAt: entry.queuedAt,
  };
}
