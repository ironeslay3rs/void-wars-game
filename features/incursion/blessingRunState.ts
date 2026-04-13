/**
 * Per-run blessing state — add/list/clear/summarize helpers.
 *
 * Canon anchors:
 *   - lore-canon/14 TaskQueue/Block-4-New-Mechanics.md §4.1 — blessings
 *     stack *per run*; corruption/condition costs carry back permanently,
 *     the buff does not.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — Three Capacities
 *     (Blood / Frame / Resonance) are the canonical pools whose stress we
 *     track alongside corruption/condition.
 *
 * Pure functions only. This file does not know about PlayerState — cost
 * debits live in `blessingResolver.ts`. Here we just accumulate the
 * accepted blessings and summarize their effects.
 */
import type { RuneCapacityPool } from "@/features/mastery/runeMasteryTypes";
import type {
  ActiveBlessing,
  ActiveBlessingSet,
  BlessingCost,
  BlessingEffect,
  BlessingSummary,
  FusionBlessing,
  Blessing,
} from "./blessingTypes";

/** Empty bless-set factory — always used at run start. */
export function createActiveBlessingSet(runId: string): ActiveBlessingSet {
  return { runId, entries: [] };
}

/** Add a new active blessing to the set. Returns a fresh object. */
export function addBlessing(
  set: ActiveBlessingSet,
  entry: ActiveBlessing,
): ActiveBlessingSet {
  return { runId: set.runId, entries: [...set.entries, entry] };
}

/** Clear all blessings — called when the run ends or is abandoned. */
export function clearBlessings(runId: string): ActiveBlessingSet {
  return createActiveBlessingSet(runId);
}

/** Read-only accessor for UI lists. */
export function listBlessings(
  set: ActiveBlessingSet,
): readonly ActiveBlessing[] {
  return set.entries;
}

/** Has the player already taken this blessing this run? */
export function hasBlessing(
  set: ActiveBlessingSet,
  id: string,
): boolean {
  return set.entries.some((e) => e.blessing.id === id);
}

function zeroEffectTotals(): Required<BlessingEffect> {
  return {
    damagePct: 0,
    regenPerSec: 0,
    shieldPct: 0,
    precisionPct: 0,
    rangePct: 0,
    manaBonus: 0,
    lootPct: 0,
    dodgePct: 0,
    foresightCharges: 0,
    mismatchReductionPct: 0,
  };
}

function addEffect(
  acc: Required<BlessingEffect>,
  eff: BlessingEffect,
): Required<BlessingEffect> {
  return {
    damagePct: acc.damagePct + (eff.damagePct ?? 0),
    regenPerSec: acc.regenPerSec + (eff.regenPerSec ?? 0),
    shieldPct: acc.shieldPct + (eff.shieldPct ?? 0),
    precisionPct: acc.precisionPct + (eff.precisionPct ?? 0),
    rangePct: acc.rangePct + (eff.rangePct ?? 0),
    manaBonus: acc.manaBonus + (eff.manaBonus ?? 0),
    lootPct: acc.lootPct + (eff.lootPct ?? 0),
    dodgePct: acc.dodgePct + (eff.dodgePct ?? 0),
    foresightCharges: acc.foresightCharges + (eff.foresightCharges ?? 0),
    mismatchReductionPct:
      acc.mismatchReductionPct + (eff.mismatchReductionPct ?? 0),
  };
}

function foldCosts(
  costs: readonly BlessingCost[],
  summary: BlessingSummary,
): void {
  for (const c of costs) {
    if (c.kind === "corruption") summary.corruptionPaid += c.amount;
    else if (c.kind === "condition") summary.conditionPaid += c.amount;
    else summary.capacityStress[c.pool] += c.amount;
  }
}

function costsOf(
  b: Blessing | FusionBlessing,
): readonly BlessingCost[] {
  return b.rarity === "fusion" ? b.costs : [b.cost];
}

/**
 * Stacked totals across every active blessing in the run. Combat systems,
 * loot rollers, and the UI all read from this summary — it's the one
 * aggregation point so no downstream system re-walks the entries.
 */
export function summarizeActiveBlessings(
  set: ActiveBlessingSet,
): BlessingSummary {
  const capacityStress: Record<RuneCapacityPool, number> = {
    blood: 0,
    frame: 0,
    resonance: 0,
  };
  const summary: BlessingSummary = {
    runId: set.runId,
    count: set.entries.length,
    totals: zeroEffectTotals(),
    corruptionPaid: 0,
    conditionPaid: 0,
    capacityStress,
  };
  for (const entry of set.entries) {
    summary.totals = addEffect(summary.totals, entry.blessing.effect);
    foldCosts(costsOf(entry.blessing), summary);
  }
  return summary;
}
