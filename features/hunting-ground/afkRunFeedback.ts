import type {
  LatestHuntResult,
  MissionDefinition,
  PlayerState,
} from "@/features/game/gameTypes";
import {
  HUNGER_FED_THRESHOLD,
  HUNGER_PRESSURE_THRESHOLD,
} from "@/features/status/survival";

export type AfkExtractionStrength = "high" | "mid" | "low";

export type AfkRunQualityTrend = "up" | "same" | "down" | null;

function missionDurationBand(
  mission: MissionDefinition | null,
): "short" | "medium" | "long" {
  if (!mission) return "medium";
  const h = mission.durationHours;
  if (h <= 0.0042) return "short";
  if (h <= 0.0056) return "medium";
  return "long";
}

function getExtractionStrength(conditionAfter: number): AfkExtractionStrength {
  if (conditionAfter >= 72) return "high";
  if (conditionAfter >= 48) return "mid";
  return "low";
}

export function computeAfkQualityScore(
  result: LatestHuntResult,
  rankLevel: number,
): number {
  const cappedRank = Math.min(rankLevel, 12);
  return Math.round(
    Math.min(100, result.conditionAfter * 0.62 + cappedRank * 3.2),
  );
}

export function getAfkRunTrend(
  previousScore: number | null,
  currentScore: number,
): AfkRunQualityTrend {
  if (previousScore === null) return null;
  if (currentScore >= previousScore + 6) return "up";
  if (currentScore <= previousScore - 6) return "down";
  return "same";
}

function getIntensityLabel(rankLv: number, mastery: number): string {
  const depth = rankLv * 8 + mastery;
  if (depth < 60) return "Initiate rhythm";
  if (depth < 120) return "Field-seasoned pull";
  return "Hard-line deployment";
}

export function getLiveFieldIntensityLabel(player: PlayerState): string {
  return getIntensityLabel(player.rankLevel, player.masteryProgress);
}

export function getExtractionQualityLabelForCondition(
  conditionAfter: number,
): string {
  const s = getExtractionStrength(conditionAfter);
  if (s === "high") return "Clean extraction";
  if (s === "mid") return "Standard pull";
  return "Strained extraction";
}

export type AfkFieldRiskBand = "safe" | "pressured" | "critical";

/** In-run survival read only (current condition + hunger). No new simulation. */
export function getAfkFieldRiskRead(params: {
  condition: number;
  hunger: number;
}): {
  band: AfkFieldRiskBand;
  label: string;
  detail: string;
} {
  const { condition, hunger } = params;

  if (condition < 50 || hunger < HUNGER_PRESSURE_THRESHOLD) {
    return {
      band: "critical",
      label: "Risk: critical",
      detail:
        "Stores or condition are too low to treat this as a free background clock. Plan recovery before you stack another op.",
    };
  }

  if (condition < 68 || hunger < HUNGER_FED_THRESHOLD) {
    return {
      band: "pressured",
      label: "Risk: pressured",
      detail:
        "Run is still legal, but the body is trending toward a hard landing. Keep Feast Hall or status in sight for the handoff.",
    };
  }

  return {
    band: "safe",
    label: "Risk: safe margin",
    detail:
      "You still have buffer when this timer closes. Read rewards, then decide whether to queue again.",
  };
}

function pickVariant(resolvedAt: number, rankLevel: number): number {
  return (resolvedAt + rankLevel * 7) % 3;
}

export type AfkFieldRunFeedback = {
  qualityScore: number;
  intensityLabel: string;
  extractionLabel: string;
  strength: AfkExtractionStrength;
  contractStrideLabel: string;
  heroTagline: string;
  consequenceLine: string;
  footerLine: string;
  outcomeTitle: string;
};

export type AfkFieldRunProgressSlice = Pick<
  PlayerState,
  "rankLevel" | "masteryProgress"
>;

export function buildAfkFieldRunFeedback(
  result: LatestHuntResult,
  mission: MissionDefinition | null,
  progress: AfkFieldRunProgressSlice,
): AfkFieldRunFeedback {
  const strength = getExtractionStrength(result.conditionAfter);
  const band = missionDurationBand(mission);
  const intensityLabel = getIntensityLabel(
    progress.rankLevel,
    progress.masteryProgress,
  );
  const v = pickVariant(result.resolvedAt, progress.rankLevel);

  const extractionLabels: Record<AfkExtractionStrength, string> = {
    high: "Clean extraction",
    mid: "Standard pull",
    low: "Strained extraction",
  };

  const strideByBand: Record<typeof band, string> = {
    short: "Snap contract stride",
    medium: "Sustained field stride",
    long: "Long haul stride",
  };

  const outcomeTitles: Record<AfkExtractionStrength, string> = {
    high: "Strong closeout",
    mid: "Solid settlement",
    low: "Costly settlement",
  };

  const heroLines: Record<AfkExtractionStrength, [string, string, string]> = {
    high: [
      "Contract crew held discipline on the return leg.",
      "Telemetry stayed quiet—smooth contract handoff.",
      "Net reports read like a textbook field closeout.",
    ],
    mid: [
      "Honest work under live mission pressure.",
      "No drama on extract; payout locked on schedule.",
      "Team pushed through without overspending reserves.",
    ],
    low: [
      "Rough edges, but the haul crossed the wire.",
      "Extraction bled more condition than ideal.",
      "They brought it home—thin margins on the readout.",
    ],
  };

  const consequenceLines: Record<
    AfkExtractionStrength,
    [string, string, string]
  > = {
    high: [
      "Readiness after closeout still looks elastic—another contract stays plausible.",
      "Body kept room after payout; the loop reads forward, not stalled.",
      "This finish keeps appetite alive for the next deploy if stores allow.",
    ],
    mid: [
      "Balanced wear: profit that matters, cost you should respect.",
      "Middle band—steady practice, not a spike or a wipe.",
      "Payout landed where expected; pressure is workable if you gate hunger.",
    ],
    low: [
      "Readiness took a hit—recover before stacking more timed ops.",
      "Contract dug deep; assume fatigue when you queue the next run.",
      "Wear dominates the read—bank the haul, then hard-gate redeploy.",
    ],
  };

  const footerLines: Record<AfkExtractionStrength, [string, string]> = {
    high: [
      "Stronger run logged—same timer, better posture walking out.",
      "Quality reads up versus a baseline contract scrape.",
    ],
    mid: [
      "Holding near typical contract-board output this session.",
      "Steady as issued—nothing flashy, nothing wasted.",
    ],
    low: [
      "Heavier run: let stores and condition argue before the next hop.",
      "This one bit harder—price the next queue like it costs real reserves.",
    ],
  };

  return {
    qualityScore: computeAfkQualityScore(result, progress.rankLevel),
    intensityLabel,
    extractionLabel: extractionLabels[strength],
    strength,
    contractStrideLabel: strideByBand[band],
    outcomeTitle: outcomeTitles[strength],
    heroTagline: heroLines[strength][v],
    consequenceLine: consequenceLines[strength][v],
    footerLine: footerLines[strength][v % 2],
  };
}

export function formatAfkTrendLabel(trend: AfkRunQualityTrend): string {
  if (trend === "up") return "↑ Cleaner than last contract readout";
  if (trend === "down") return "↓ Rougher exit than last contract";
  if (trend === "same") return "→ Same band as last contract quality";
  return "First read this session—trend starts next payout";
}
