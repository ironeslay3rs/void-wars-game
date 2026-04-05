import { buildExpeditionContractSnapshot } from "@/features/expedition/expeditionContractSnapshot";
import {
  getActiveMissionQueueEntry,
  getMissionById,
} from "@/features/game/gameMissionUtils";
import type { GameState } from "@/features/game/gameTypes";

/**
 * M1 single read surface for “what expedition is running” + run ledger + last extraction.
 * UI and guidance should prefer this over re-deriving scattered mission math.
 */
export function getM1ExpeditionRunProgressView(state: GameState, nowMs: number) {
  const queue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const active = getActiveMissionQueueEntry(queue, nowMs);
  const mission =
    active !== null ? getMissionById(state.missions, active.missionId) : null;

  const expeditionContract =
    active !== null &&
    mission !== null &&
    mission.category === "hunting-ground"
      ? state.player.expeditionContractSnapshots[active.queueId] ??
        buildExpeditionContractSnapshot(mission, active)
      : null;

  return {
    activeQueueEntry: active,
    activeMission: mission,
    expeditionContract,
    fieldPickupLedger: state.player.fieldLootGainedThisRun ?? {},
    lastVoidFieldExtractionLedger: state.player.lastVoidFieldExtractionLedger,
  } as const;
}
