/**
 * Consequence Table — debuffs triggered by condition and corruption.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — the Void forces
 *     adaptation; sustained exposure degrades body AND soul.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — mana is the
 *     opposing positive-pressure force; low mana + high corruption
 *     compounds.
 *
 * Scales:
 *   - `condition` is 0–100, HIGH = healthy, LOW = broken.
 *   - `corruption` (PlayerState.voidInstability) is 0–100, HIGH = tainted.
 *
 * Thresholds (task spec):
 *   - 70% = light wear / creeping rot (first bite)
 *   - 50% = meaningful strain (combat softens, crafts wobble)
 *   - 30% = dangerous (noticeable penalties, mismatch amplifies)
 *   - 10% = critical (hard caps, failure rolls)
 *
 *   For `condition`, "at 70%" means condition <= 70 (since low = bad).
 *   For `corruption`, "at 70%" means corruption >= 70 (since high = bad).
 *
 * Pure functions only. Consumers (combatResolver, craftAction, mission
 * settlement, UI hint) read these selectors and apply.
 */

import type { PlayerState } from "@/features/game/gameTypes";
import { getCorruptionPct } from "@/features/condition/corruptionEngine";

// ────────────────────────────────────────────────────────────────────
// Tier model
// ────────────────────────────────────────────────────────────────────

export type ConsequenceTier = "none" | "wear" | "strain" | "danger" | "critical";

export const CONDITION_TIER_BREAKS = { wear: 70, strain: 50, danger: 30, critical: 10 } as const;
export const CORRUPTION_TIER_BREAKS = { wear: 70, strain: 50, danger: 30, critical: 10 } as const;

/** Tier from condition (low = bad). */
export function conditionTier(condition: number): ConsequenceTier {
  if (condition <= CONDITION_TIER_BREAKS.critical) return "critical";
  if (condition <= CONDITION_TIER_BREAKS.danger) return "danger";
  if (condition <= CONDITION_TIER_BREAKS.strain) return "strain";
  if (condition <= CONDITION_TIER_BREAKS.wear) return "wear";
  return "none";
}

/** Tier from corruption (high = bad). "30%" for corruption means >=70 load. */
export function corruptionTier(corruption: number): ConsequenceTier {
  if (corruption >= 100 - CORRUPTION_TIER_BREAKS.critical) return "critical"; // >=90
  if (corruption >= 100 - CORRUPTION_TIER_BREAKS.danger) return "danger"; // >=70
  if (corruption >= 100 - CORRUPTION_TIER_BREAKS.strain) return "strain"; // >=50
  if (corruption >= 100 - CORRUPTION_TIER_BREAKS.wear) return "wear"; // >=30
  return "none";
}

// ────────────────────────────────────────────────────────────────────
// Combat debuff selector — consumed later by arena/combatResolver
// ────────────────────────────────────────────────────────────────────

export type CombatDebuffs = {
  /** Multiplier on outgoing damage (1 = no penalty). */
  dmgMult: number;
  /** Multiplier on hit/accuracy chance (1 = no penalty). */
  hitMult: number;
  /** Multiplier on incoming damage (1 = neutral; >1 = takes more). */
  takeMult: number;
  /** Flat crit chance penalty (0–1, subtracted). */
  critChancePenalty: number;
  /** Human-readable source tag array (for tooltips). */
  reasons: readonly string[];
};

const NEUTRAL_COMBAT: CombatDebuffs = {
  dmgMult: 1,
  hitMult: 1,
  takeMult: 1,
  critChancePenalty: 0,
  reasons: [],
};

function combatDebuffFromConditionTier(t: ConsequenceTier): CombatDebuffs {
  switch (t) {
    case "wear":
      return { dmgMult: 0.95, hitMult: 0.98, takeMult: 1.02, critChancePenalty: 0, reasons: ["Condition: wear"] };
    case "strain":
      return { dmgMult: 0.9, hitMult: 0.95, takeMult: 1.05, critChancePenalty: 0.02, reasons: ["Condition: strain"] };
    case "danger":
      return { dmgMult: 0.8, hitMult: 0.9, takeMult: 1.1, critChancePenalty: 0.05, reasons: ["Condition: danger"] };
    case "critical":
      return { dmgMult: 0.65, hitMult: 0.8, takeMult: 1.2, critChancePenalty: 0.1, reasons: ["Condition: critical"] };
    default:
      return NEUTRAL_COMBAT;
  }
}

function combatDebuffFromCorruptionTier(t: ConsequenceTier): CombatDebuffs {
  switch (t) {
    case "wear":
      return { dmgMult: 1, hitMult: 0.99, takeMult: 1.02, critChancePenalty: 0, reasons: ["Corruption: creeping"] };
    case "strain":
      return { dmgMult: 0.97, hitMult: 0.97, takeMult: 1.05, critChancePenalty: 0.02, reasons: ["Corruption: strain"] };
    case "danger":
      return { dmgMult: 0.92, hitMult: 0.93, takeMult: 1.1, critChancePenalty: 0.04, reasons: ["Corruption: danger"] };
    case "critical":
      return { dmgMult: 0.85, hitMult: 0.85, takeMult: 1.2, critChancePenalty: 0.08, reasons: ["Corruption: critical"] };
    default:
      return NEUTRAL_COMBAT;
  }
}

/** Compose two debuff sets multiplicatively. */
function combineCombat(a: CombatDebuffs, b: CombatDebuffs): CombatDebuffs {
  return {
    dmgMult: a.dmgMult * b.dmgMult,
    hitMult: a.hitMult * b.hitMult,
    takeMult: a.takeMult * b.takeMult,
    critChancePenalty: Math.min(0.5, a.critChancePenalty + b.critChancePenalty),
    reasons: [...a.reasons, ...b.reasons],
  };
}

/**
 * Public selector — combat consumers pass PlayerState and receive the
 * aggregated combat debuffs from BOTH condition and corruption.
 */
export function getCombatDebuffsFromCondition(
  player: Pick<PlayerState, "condition" | "voidInstability">,
): CombatDebuffs {
  const cond = combatDebuffFromConditionTier(conditionTier(player.condition));
  const corr = combatDebuffFromCorruptionTier(corruptionTier(getCorruptionPct(player)));
  return combineCombat(cond, corr);
}

// ────────────────────────────────────────────────────────────────────
// Crafting instability selector — consumed later by craftAction
// ────────────────────────────────────────────────────────────────────

export type CraftingInstability = {
  /** Multiplier on base success chance (0–1, multiplicative). */
  successMult: number;
  /** Additive weight [0, 1] that consumers can roll against for side effects. */
  sideEffectWeight: number;
  /** Boolean convenience flag — true when the craft should at least roll a misfire. */
  canMisfire: boolean;
  reasons: readonly string[];
};

const NEUTRAL_CRAFT: CraftingInstability = {
  successMult: 1,
  sideEffectWeight: 0,
  canMisfire: false,
  reasons: [],
};

export function getCraftingInstabilityFromCorruption(
  player: Pick<PlayerState, "condition" | "voidInstability">,
): CraftingInstability {
  const cTier = corruptionTier(getCorruptionPct(player));
  const condTier = conditionTier(player.condition);

  let successMult = 1;
  let sideEffectWeight = 0;
  const reasons: string[] = [];

  switch (cTier) {
    case "wear":
      successMult *= 0.98;
      sideEffectWeight += 0.05;
      reasons.push("Corruption: creeping");
      break;
    case "strain":
      successMult *= 0.93;
      sideEffectWeight += 0.12;
      reasons.push("Corruption: strain");
      break;
    case "danger":
      successMult *= 0.85;
      sideEffectWeight += 0.22;
      reasons.push("Corruption: danger");
      break;
    case "critical":
      successMult *= 0.7;
      sideEffectWeight += 0.4;
      reasons.push("Corruption: critical");
      break;
  }

  // Broken body compounds on top of a tainted soul.
  switch (condTier) {
    case "strain":
      successMult *= 0.97;
      sideEffectWeight += 0.03;
      reasons.push("Condition: strain");
      break;
    case "danger":
      successMult *= 0.92;
      sideEffectWeight += 0.08;
      reasons.push("Condition: danger");
      break;
    case "critical":
      successMult *= 0.85;
      sideEffectWeight += 0.15;
      reasons.push("Condition: critical");
      break;
  }

  const canMisfire = sideEffectWeight > 0;
  if (!canMisfire) return NEUTRAL_CRAFT;
  return {
    successMult,
    sideEffectWeight: Math.min(0.95, sideEffectWeight),
    canMisfire,
    reasons,
  };
}

// ────────────────────────────────────────────────────────────────────
// Composite snapshot — handy for UI hint badges and tests.
// ────────────────────────────────────────────────────────────────────

export type ConsequenceSnapshot = {
  conditionTier: ConsequenceTier;
  corruptionTier: ConsequenceTier;
  combat: CombatDebuffs;
  crafting: CraftingInstability;
};

export function getConsequenceSnapshot(
  player: Pick<PlayerState, "condition" | "voidInstability">,
): ConsequenceSnapshot {
  return {
    conditionTier: conditionTier(player.condition),
    corruptionTier: corruptionTier(getCorruptionPct(player)),
    combat: getCombatDebuffsFromCondition(player),
    crafting: getCraftingInstabilityFromCorruption(player),
  };
}
