import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { GameState } from "@/features/game/gameTypes";

/**
 * One-line contract payout preview for the void field HUD (base mission only;
 * realtime bonus is resolved on Hunt Result).
 */
export function voidFieldContractPayoutPreview(state: GameState): string | null {
  const ap = state.player.activeProcess;
  if (!ap || ap.kind !== "hunt" || ap.status !== "running") {
    return null;
  }
  if (!ap.sourceId) return null;

  const mission = state.missions.find((m) => m.id === ap.sourceId);
  if (!mission) return null;

  const r = mission.reward;
  const parts: string[] = [];

  if (r.rankXp > 0) parts.push(`+${r.rankXp} Rank XP`);
  if (r.masteryProgress > 0) parts.push(`+${r.masteryProgress} Mastery`);
  if (r.influence && r.influence > 0) parts.push(`+${r.influence} Influence`);

  const res = r.resources;
  if (res) {
    for (const [k, v] of Object.entries(res)) {
      if (typeof v === "number" && v > 0) {
        parts.push(`+${v} ${formatResourceLabel(k)}`);
      }
    }
  }

  if (r.conditionDelta !== 0) {
    parts.push(
      r.conditionDelta > 0
        ? `Condition +${r.conditionDelta}`
        : `Condition ${r.conditionDelta}`,
    );
  }

  if (parts.length === 0) {
    return "Payout on resolve — see Hunt Result for totals.";
  }

  const head = parts.slice(0, 4).join(" · ");
  const tail = parts.length > 4 ? " · …" : "";
  return `Base contract (timer): ${head}${tail} · Realtime bonus + final totals on Hunt Result`;
}
