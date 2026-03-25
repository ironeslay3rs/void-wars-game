import type {
  PlayerBehaviorStats,
  RealtimeFieldRole,
} from "@/features/game/gameTypes";

export type RoleTrendHint = {
  label: "Emerging Role" | "Role Trend";
  dominantRole: RealtimeFieldRole;
  dominancePct: number; // 0..100
  totalRealtimeHuntsWithContribution: number;
};

export function getDominantRoleTrend(
  behaviorStats: PlayerBehaviorStats,
): { dominantRole: RealtimeFieldRole; dominancePct: number } {
  const total = behaviorStats.totalRealtimeHuntsWithContribution;

  if (total <= 0) {
    return { dominantRole: "Spotter", dominancePct: 0 };
  }

  const counts = behaviorStats.roleCounts;
  const roles = Object.keys(counts) as RealtimeFieldRole[];

  const maxCount = Math.max(...roles.map((r) => counts[r] ?? 0));
  const dominantRole =
    roles.find((r) => (counts[r] ?? 0) === maxCount) ?? "Spotter";

  const dominancePct = Math.round((maxCount / total) * 100);
  return { dominantRole, dominancePct };
}

export function getEmergingRoleHint(
  behaviorStats: PlayerBehaviorStats,
): RoleTrendHint | null {
  const total = behaviorStats.totalRealtimeHuntsWithContribution;
  if (total < 2) return null;

  const { dominantRole, dominancePct } = getDominantRoleTrend(behaviorStats);

  const label: RoleTrendHint["label"] =
    dominancePct >= 60 ? "Emerging Role" : "Role Trend";

  return {
    label,
    dominantRole,
    dominancePct,
    totalRealtimeHuntsWithContribution: total,
  };
}

export type RoleSoftModifiers = {
  dominantRole: RealtimeFieldRole;
  dominancePct: number;
  // Multiplier applied only to realtime reward math (delta within [-0.05..+0.05]).
  rewardBiasMultiplier: number;
};

function getDominantRoleSign(dominantRole: RealtimeFieldRole): number {
  switch (dominantRole) {
    case "Executioner":
      return 1;
    case "Artillery":
      return 0.5;
    case "Pressure Specialist":
      return 0;
    case "Spotter":
    default:
      return -1;
  }
}

export function getRoleSoftModifiers(
  behaviorStats: PlayerBehaviorStats,
): RoleSoftModifiers {
  const total = behaviorStats.totalRealtimeHuntsWithContribution;
  if (total < 2) {
    return {
      dominantRole: behaviorStats.lastRealtimeRole ?? "Spotter",
      dominancePct: 0,
      rewardBiasMultiplier: 0,
    };
  }

  const { dominantRole, dominancePct } = getDominantRoleTrend(behaviorStats);

  // Soft bias: at most +/-5% impact, scaled by dominancePct.
  const amplitude = 0.05;
  const sign = getDominantRoleSign(dominantRole);
  // Anti-monotony: once dominance gets "too high" (~70%),
  // reward-bias magnitude diminishes so hybrid play is encouraged.
  const dominance01 = dominancePct / 100; // 0..1
  const excessAfter70 = Math.max(0, dominancePct - 70) / 30; // 0..1 when dominancePct in [70..100]
  const diminishingFactor = 1 - 0.35 * Math.min(1, excessAfter70); // 1.00 -> 0.65

  const scaled = dominance01 * amplitude * sign * diminishingFactor;

  const rewardBiasMultiplier = Math.max(-0.05, Math.min(0.05, scaled));

  return {
    dominantRole,
    dominancePct,
    rewardBiasMultiplier,
  };
}

