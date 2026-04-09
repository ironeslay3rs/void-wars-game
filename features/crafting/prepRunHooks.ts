import type { NextRunModifiers, PlayerState } from "@/features/game/gameTypes";
import {
  RUN_INSTABILITY_DELTA_HUNT,
  RUN_INSTABILITY_DELTA_MISSION,
  reduceRunInstability,
} from "@/features/progression/runInstability";

/** After mission settlement heat tick — primed prep shaves run heat (clear consequence). */
export function applyPrimedPrepRunInstabilityTrim(
  player: PlayerState,
  nextRunMods: NextRunModifiers | null | undefined,
  isHuntingGround: boolean,
): PlayerState {
  const raw = nextRunMods?.applyOnSettlement?.runInstabilityGainReduction ?? 0;
  if (raw <= 0) return player;
  const cap = isHuntingGround
    ? RUN_INSTABILITY_DELTA_HUNT
    : RUN_INSTABILITY_DELTA_MISSION;
  const trim = Math.max(0, Math.min(Math.floor(raw), cap));
  if (trim <= 0) return player;
  return reduceRunInstability(
    player,
    trim,
    `Prep absorbed ${trim}% run heat — the kit did its job on closeout.`,
  );
}

/** Orbs + extract loot: salvage bonus from primed rigging. */
export function boostFieldLootAmountForPrep(
  baseAmount: number,
  nextRunMods: NextRunModifiers | null | undefined,
): number {
  const pct = nextRunMods?.applyInField?.fieldLootBonusPct ?? 0;
  const n = Math.max(0, Math.floor(baseAmount));
  if (pct <= 0 || n <= 0) return n;
  return Math.max(1, Math.round(n * (1 + pct / 100)));
}

export type ActivePrepSurface = {
  state: "primed" | "none";
  /** Single HUD / strip line */
  headline: string;
  /** Sub line — effect reminder or nudge to craft */
  detail: string;
};

/** Home / deploy / void HUD copy */
export function getActivePrepSurface(player: PlayerState): ActivePrepSurface {
  const m = player.nextRunModifiers;
  if (!m) {
    return {
      state: "none",
      headline: "Field prep: none primed",
      detail:
        "Craft a district kit — heat trim, salvage rig, or extract balm — before you deploy.",
    };
  }
  return {
    state: "primed",
    headline: `Field prep: ${m.title}`,
    detail: m.nextRunEffect,
  };
}
