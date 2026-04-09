import type { PlayerState, RunArchetype } from "@/features/game/gameTypes";
import { appendRunInstabilityLog } from "@/features/progression/runInstability";

const MAX_RI_SAMPLES = 12;

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Population variance; used to detect volatile heat swings. */
function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((s, x) => s + (x - m) ** 2, 0) / values.length;
}

/**
 * Infer posture from rolling post-settlement heat, greed streak, and vent/push totals.
 * Priority: volatile (oscillation) → greedy (streak + push / hot runs) → safe (vent-heavy, cool avg) → balanced.
 */
export function inferRunArchetype(input: {
  samples: number[];
  instabilityStreakTurns: number;
  ventCount: number;
  pushCount: number;
}): RunArchetype {
  const { samples, instabilityStreakTurns, ventCount, pushCount } = input;
  const avgRi = mean(samples);
  const varRi = variance(samples);
  const vp = ventCount + pushCount;
  const ventShare = vp === 0 ? 0 : ventCount / vp;
  const pushShare = vp === 0 ? 0 : pushCount / vp;

  if (samples.length >= 4 && varRi > 220) {
    return "volatile";
  }

  if (
    instabilityStreakTurns >= 3 &&
    (pushCount >= ventCount || pushCount >= 2)
  ) {
    return "greedy";
  }
  if (avgRi >= 52 && pushShare >= 0.45 && pushCount >= 1) {
    return "greedy";
  }
  if (instabilityStreakTurns >= 2 && pushCount >= 3 && pushShare > 0.55) {
    return "greedy";
  }

  if (
    ventCount >= 2 &&
    ventShare >= 0.58 &&
    avgRi <= 46 &&
    samples.length >= 2
  ) {
    return "safe";
  }
  if (ventCount >= 3 && ventCount > pushCount * 1.4 && avgRi < 50) {
    return "safe";
  }

  return "balanced";
}

/** Player-facing title for HUD (e.g. "Run Style: Greedy"). */
export function formatRunStyleLabel(archetype: RunArchetype | undefined): string {
  const a = archetype ?? "balanced";
  const word =
    a === "balanced"
      ? "Balanced"
      : a === "greedy"
        ? "Greedy"
        : a === "safe"
          ? "Safe"
          : "Volatile";
  return `Run Style: ${word}`;
}

/** One-shot log line when archetype shifts into a distinctive posture (balanced = none). */
export function runArchetypeChangeLogLine(archetype: RunArchetype): string | null {
  switch (archetype) {
    case "greedy":
      return "You stayed too long.";
    case "safe":
      return "You pull back before it breaks.";
    case "volatile":
      return "You're riding chaos.";
    default:
      return null;
  }
}

/** Append current run heat after settlement tick (and prep trim) and refresh archetype. */
export function updateRunArchetypeAfterSettlement(
  player: PlayerState,
): PlayerState {
  const ri = Math.max(
    0,
    Math.min(100, Math.round(player.runInstability ?? 0)),
  );
  const prev = player.runStyleRiSamples ?? [];
  const samples = [...prev, ri].slice(-MAX_RI_SAMPLES);
  const previousArchetype = player.runArchetype ?? "balanced";
  const archetype = inferRunArchetype({
    samples,
    instabilityStreakTurns: player.instabilityStreakTurns ?? 0,
    ventCount: player.runStyleVentCount ?? 0,
    pushCount: player.runStylePushCount ?? 0,
  });

  let runInstabilityLog = player.runInstabilityLog;
  if (archetype !== previousArchetype) {
    const line = runArchetypeChangeLogLine(archetype);
    if (line) {
      runInstabilityLog = appendRunInstabilityLog(runInstabilityLog, line);
    }
  }

  return {
    ...player,
    runStyleRiSamples: samples,
    runArchetype: archetype,
    runInstabilityLog,
  };
}

export function bumpRunStyleVentCount(player: PlayerState): PlayerState {
  return {
    ...player,
    runStyleVentCount: Math.min(
      9999,
      Math.max(0, (player.runStyleVentCount ?? 0) + 1),
    ),
  };
}

export function bumpRunStylePushCount(player: PlayerState): PlayerState {
  return {
    ...player,
    runStylePushCount: Math.min(
      9999,
      Math.max(0, (player.runStylePushCount ?? 0) + 1),
    ),
  };
}

export function isRunArchetype(value: unknown): value is RunArchetype {
  return (
    value === "safe" ||
    value === "balanced" ||
    value === "greedy" ||
    value === "volatile"
  );
}
