"use client";

import ExpeditionResultGlanceBoard from "@/components/expedition/ExpeditionResultGlanceBoard";
import {
  buildVoidFieldExtractionGlanceModel,
  type ExtractionGlancePlayerSnapshot,
} from "@/features/expedition/expeditionResultGlanceModel";
import type { VoidFieldExtractionLedgerResult } from "@/features/game/gameTypes";

export default function ExtractionSummary({
  ledger,
  playerSnapshot,
}: {
  ledger: VoidFieldExtractionLedgerResult;
  playerSnapshot?: ExtractionGlancePlayerSnapshot;
}) {
  const model = buildVoidFieldExtractionGlanceModel(ledger, playerSnapshot);

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-[min(820px,96vw)] max-h-[min(92vh,900px)] overflow-y-auto">
        <ExpeditionResultGlanceBoard model={model} variant="modal" />
      </div>
    </div>
  );
}
