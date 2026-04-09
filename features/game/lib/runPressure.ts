import type { PlayerState } from "@/features/game/gameTypes";

/**
 * Emotional read on how hard the run is pressing — copy only, no gameplay effects.
 */

export type RunPressureState =
  | "stable"
  | "strained"
  | "danger"
  | "critical";

export function getRunPressureState(input: {
  condition: number;
  hunger: number;
  activeRuns: number;
}): RunPressureState {
  const { condition, hunger, activeRuns } = input;

  if (condition < 30 || hunger < 30) return "critical";
  if (condition < 50 || hunger < 50) return "danger";
  if (activeRuns >= 2) return "strained";

  return "stable";
}

export function getRunPressureLine(state: RunPressureState): string {
  switch (state) {
    case "stable":
      return "You are holding together. For now.";
    case "strained":
      return "You're pushing multiple fronts. Something will slip.";
    case "danger":
      return "Your body is starting to fail under pressure.";
    case "critical":
      return "You won't survive another mistake like this.";
  }
}

/**
 * Tags for concurrent pressure threads — one per queued contract plus at most one open field thread.
 * Kept on `player` for copy/UI; recomputed after reducer transitions and on save load.
 */
export function deriveActiveRuns(player: PlayerState): string[] {
  const mq = Array.isArray(player.missionQueue) ? player.missionQueue : [];
  const tags = mq.map((e) => `queue:${e.queueId}`);
  const fieldOpen =
    player.voidRealtimeBinding !== null ||
    (player.activeProcess !== null && player.activeProcess.status === "running");
  if (fieldOpen) {
    tags.push("field");
  }
  return tags;
}

export function getRunPressureFromPlayer(player: PlayerState): {
  state: RunPressureState;
  line: string;
} {
  const state = getRunPressureState({
    condition: player.condition,
    hunger: player.hunger,
    activeRuns: player.activeRuns?.length ?? 0,
  });
  return { state, line: getRunPressureLine(state) };
}
