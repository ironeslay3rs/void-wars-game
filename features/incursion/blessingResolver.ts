/**
 * applyBlessing — pure cost resolver for accepted blessings.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — the Void taxes
 *     those who draw power from it; blessings are accelerated adaptation
 *     and therefore accelerated corruption.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md + CLAUDE.md Three
 *     Capacities — capacity-stress costs spend Blood / Frame / Resonance.
 *   - lore-canon/14 TaskQueue/Block-4-New-Mechanics.md §4.1 — costs
 *     persist after the run; the buff itself is per-run (tracked separately
 *     by `blessingRunState`).
 *
 * This file only debits the *cost* on the player. Per-run buffs are added
 * to an `ActiveBlessingSet` by the run-state helper. Pure — callers fold.
 */
import type { PlayerState } from "@/features/game/gameTypes";
import type { RuneCapacityPool, RuneCapacityState } from "@/features/mastery/runeMasteryTypes";
import {
  MAX_CORRUPTION,
  clampCorruption,
} from "@/features/condition/corruptionEngine";
import type {
  ActiveBlessing,
  Blessing,
  BlessingCost,
  FusionBlessing,
} from "./blessingTypes";

export type BlessingResolution = {
  player: PlayerState;
  applied: ActiveBlessing;
  /** Summary of what was debited — handy for UI toasts and session logs. */
  debited: {
    corruptionAdded: number;
    conditionDrained: number;
    capacityStress: Partial<RuneCapacityState>;
  };
};

export type ApplyBlessingInput = {
  player: PlayerState;
  blessing: Blessing | FusionBlessing;
  /** Wall-clock for audit (keeps the function pure of Date.now). */
  now?: number;
};

function clampCondition(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 100) return 100;
  return v;
}

function debitOne(
  player: PlayerState,
  cost: BlessingCost,
): {
  player: PlayerState;
  corruptionAdded: number;
  conditionDrained: number;
  capacityStress: Partial<RuneCapacityState>;
} {
  if (cost.kind === "corruption") {
    const before = player.voidInstability;
    const next = clampCorruption(before + cost.amount);
    return {
      player: { ...player, voidInstability: next },
      corruptionAdded: next - before,
      conditionDrained: 0,
      capacityStress: {},
    };
  }
  if (cost.kind === "condition") {
    const before = player.condition;
    const next = clampCondition(before - cost.amount);
    return {
      player: { ...player, condition: next },
      corruptionAdded: 0,
      conditionDrained: before - next,
      capacityStress: {},
    };
  }
  // capacity stress — shave capacity headroom on the requested pool.
  const pool: RuneCapacityPool = cost.pool;
  const capBefore = player.runeMastery.capacity[pool];
  const nextCap = Math.max(0, capBefore - cost.amount);
  const nextPlayer: PlayerState = {
    ...player,
    runeMastery: {
      ...player.runeMastery,
      capacity: {
        ...player.runeMastery.capacity,
        [pool]: nextCap,
      },
    },
  };
  return {
    player: nextPlayer,
    corruptionAdded: 0,
    conditionDrained: 0,
    capacityStress: { [pool]: capBefore - nextCap } as Partial<RuneCapacityState>,
  };
}

function mergeStress(
  a: Partial<RuneCapacityState>,
  b: Partial<RuneCapacityState>,
): Partial<RuneCapacityState> {
  const out: Partial<RuneCapacityState> = { ...a };
  (Object.keys(b) as RuneCapacityPool[]).forEach((k) => {
    out[k] = (out[k] ?? 0) + (b[k] ?? 0);
  });
  return out;
}

/**
 * Debits the blessing's cost(s) on the player and returns the active
 * blessing entry for the run. Pure — no mutation, no global state.
 *
 * NOTE: corruption is clamped at `MAX_CORRUPTION`; condition bottoms at 0;
 * capacity pools bottom at 0 (cannot go negative). Over-spend is silently
 * truncated — the `debited` summary reports the *actual* amounts applied.
 */
export function applyBlessing(input: ApplyBlessingInput): BlessingResolution {
  const now = input.now ?? 0;
  const costs: BlessingCost[] =
    input.blessing.rarity === "fusion"
      ? [...input.blessing.costs]
      : [input.blessing.cost];

  let player = input.player;
  let corruptionAdded = 0;
  let conditionDrained = 0;
  let capacityStress: Partial<RuneCapacityState> = {};
  for (const c of costs) {
    const step = debitOne(player, c);
    player = step.player;
    corruptionAdded += step.corruptionAdded;
    conditionDrained += step.conditionDrained;
    capacityStress = mergeStress(capacityStress, step.capacityStress);
  }

  const applied: ActiveBlessing =
    input.blessing.rarity === "fusion"
      ? { kind: "fusion", blessing: input.blessing, acceptedAt: now }
      : { kind: "school", blessing: input.blessing, acceptedAt: now };

  return {
    player,
    applied,
    debited: { corruptionAdded, conditionDrained, capacityStress },
  };
}

/** Exposed for tests / UI previews — raw ceiling on corruption debit. */
export const CORRUPTION_CEILING = MAX_CORRUPTION;
