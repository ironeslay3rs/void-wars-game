/**
 * Capacity cost calculation — Blood / Frame / Resonance costs for rune
 * installs. Public facade over the existing install-cost math in
 * `runeMasteryLogic.ts`, extended with preview + depth scaling helpers.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Runes/Rune System.md — "Capacity matters.
 *     Compatibility matters." Hybrid (off-school) installs are more
 *     expensive and erode ceilings.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — mana storage scales
 *     with the vessel; deeper sets demand more of the pool.
 *   - lore-canon/CLAUDE.md — Three Capacities (Blood = Bio, Frame = Mecha,
 *     Resonance = Pure). The school's pool always pays the base cost.
 *
 * Game adaptation:
 *   - Primary-school install: +2 to the school's own pool.
 *   - Off-school (hybrid) install: +3 to the school's pool AND +1 to each
 *     of the other two pools — cross-path installs tax the whole body.
 *   - Deep installs (current depth >= 4) add +1 to the primary pool to
 *     reflect Executional-tier density.
 *
 * Pure functions. No side effects. No component imports.
 */

import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneCapacityPool,
  RuneCapacityState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import {
  getPrimaryRuneSchool,
  schoolToCapacityPool,
} from "@/features/mastery/runeMasteryTypes";
import {
  canAffordCapacityCost as _canAfford,
  computeInstallCost as _baseComputeInstallCost,
  effectiveHybridReliefFromMythic,
  getEffectiveCapacityMax,
} from "@/features/mastery/runeMasteryLogic";

/** Depth at which an install starts charging the Executional surcharge. */
export const DEEP_INSTALL_DEPTH_THRESHOLD = 4;
/** Extra primary-pool cost applied once the install goes into Executional depth. */
export const DEEP_INSTALL_SURCHARGE = 1;

export type CapacityCostInput = {
  alignment: FactionAlignment;
  school: RuneSchool;
  /**
   * Current school depth BEFORE the install. Optional — if omitted, no
   * depth surcharge is applied (caller is asking the base cost).
   */
  currentDepth?: number;
};

/**
 * Compute the full Blood/Frame/Resonance cost for a rune install, including
 * the deep-install Executional surcharge. Wraps `computeInstallCost` from
 * runeMasteryLogic so the base math stays single-sourced.
 */
export function computeCapacityCost(
  input: CapacityCostInput,
): RuneCapacityState {
  const base = _baseComputeInstallCost({
    alignment: input.alignment,
    school: input.school,
  });
  const out: RuneCapacityState = { ...base };
  if (
    input.currentDepth !== undefined &&
    input.currentDepth >= DEEP_INSTALL_DEPTH_THRESHOLD
  ) {
    const pool = schoolToCapacityPool(input.school);
    out[pool] += DEEP_INSTALL_SURCHARGE;
  }
  return out;
}

/** True when the install is into a school that is NOT the player's primary. */
export function isHybridInstall(
  alignment: FactionAlignment,
  school: RuneSchool,
): boolean {
  const primary = getPrimaryRuneSchool(alignment);
  return primary !== null && primary !== school;
}

export type CapacityAffordability = {
  cost: RuneCapacityState;
  hasCapacity: boolean;
  /** Per-pool deficit (0 if sufficient). Useful for UI chip copy. */
  shortfall: RuneCapacityState;
};

/**
 * Does the player currently afford this install? Returns the full cost
 * alongside the Boolean so the UI can render either "cost" or "deficit".
 */
export function getCapacityAffordability(
  mastery: PlayerRuneMasteryState,
  input: CapacityCostInput,
): CapacityAffordability {
  const cost = computeCapacityCost(input);
  const hasCapacity = _canAfford(mastery.capacity, cost);
  const shortfall: RuneCapacityState = {
    blood: Math.max(0, cost.blood - mastery.capacity.blood),
    frame: Math.max(0, cost.frame - mastery.capacity.frame),
    resonance: Math.max(0, cost.resonance - mastery.capacity.resonance),
  };
  return { cost, hasCapacity, shortfall };
}

/**
 * Player-level preview: current capacity vs effective max per pool. Handy
 * for capacity meters and breakthrough planners.
 */
export type CapacityPoolSnapshot = {
  pool: RuneCapacityPool;
  current: number;
  max: number;
  /** Headroom in the pool (max - current)… negative means over-committed. */
  headroom: number;
  spentPct: number;
};

export function getCapacitySnapshots(
  player: PlayerState,
): CapacityPoolSnapshot[] {
  const relief = effectiveHybridReliefFromMythic(player.mythicAscension);
  const effMax = getEffectiveCapacityMax(player.runeMastery, relief);
  const cap = player.runeMastery.capacity;
  const pools: RuneCapacityPool[] = ["blood", "frame", "resonance"];
  return pools.map((pool) => {
    const current = cap[pool];
    const max = effMax[pool];
    const headroom = max - (max - current);
    const spentPct = max <= 0 ? 0 : Math.round(((max - current) / max) * 100);
    return { pool, current, max, headroom: max - current, spentPct };
  }).map((s) => ({ ...s }));
}

/**
 * Sum of costs across a provisional install plan (multi-slot preview).
 * Honors depth surcharge by incrementing the simulated depth per step.
 */
export function totalPlanCost(
  alignment: FactionAlignment,
  plan: readonly { school: RuneSchool; startingDepth: number }[],
): RuneCapacityState {
  const total: RuneCapacityState = { blood: 0, frame: 0, resonance: 0 };
  const depthByEntry = new Map<RuneSchool, number>();
  for (const step of plan) {
    const simDepth =
      depthByEntry.get(step.school) ?? step.startingDepth;
    const stepCost = computeCapacityCost({
      alignment,
      school: step.school,
      currentDepth: simDepth,
    });
    total.blood += stepCost.blood;
    total.frame += stepCost.frame;
    total.resonance += stepCost.resonance;
    depthByEntry.set(step.school, simDepth + 1);
  }
  return total;
}

// Re-export the single-source affordability primitive so callers needing
// raw capacity math can stay inside `capacityCosts` without reaching into
// `runeMasteryLogic` directly.
export { _canAfford as canAffordCapacityCost };
