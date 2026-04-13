/**
 * Hollowfang encounter resolver — deterministic, seeded.
 *
 * Reuses the mulberry32 pattern from `features/arena/combatResolver.ts`
 * (kept local so this module stays in its own feature dir).
 *
 * Resolution model (readable, auditable):
 *   For each phase, the party must clear `phase.baseDamage * phaseHpShare`
 *   worth of boss HP within `phase.turnCap` turns. Each turn:
 *     - If the party is prepped, readable tells are countered → less
 *       incoming damage, more outgoing.
 *     - If partial-prepped, they eat a share of tells and grind.
 *     - If un-prepped, tells land hard and the phase can time out.
 *
 * Outcomes:
 *   - victory   — all 3 phases cleared
 *   - partial   — phase 1 cleared but 2 or 3 timed out
 *   - wipe      — phase 1 itself timed out, or damageSuffered > wipe wall
 */

import type { PlayerState } from "@/features/game/gameTypes";
import { getCombatDebuffsFromCondition } from "@/features/condition/consequenceTable";
import {
  HOLLOWFANG_PROFILE,
  type HollowfangPhase,
  type HollowfangProfile,
} from "@/features/hollowfang/hollowfangProfile";
import {
  checkPrep,
  type PrepCheck,
  readinessScore,
  HOLLOWFANG_PREP,
  type HollowfangPrepRequirements,
} from "@/features/hollowfang/prepRequirements";

// ────────────────────────────────────────────────────────────────────
// Public types
// ────────────────────────────────────────────────────────────────────

export type EncounterOutcome = "victory" | "partial" | "wipe";

export type RewardTier = "victory" | "partial" | "wipe";

export type EncounterResult = {
  seed: number;
  outcome: EncounterOutcome;
  phasesCleared: 0 | 1 | 2 | 3;
  damageSuffered: number;
  rewardTier: RewardTier;
  conditionCost: number;
  corruptionGain: number;
  /** Per-phase trace for UI replay / tests. */
  phaseTrace: PhaseTrace[];
  /** Echo of prep snapshot used to resolve (readiness 0..1). */
  readiness: number;
  /** Prep check at the moment of attempt. */
  prep: PrepCheck;
};

export type PhaseTrace = {
  phaseId: HollowfangPhase["id"];
  order: 1 | 2 | 3;
  turnsUsed: number;
  cleared: boolean;
  incomingDamage: number;
  tellsLanded: number;
  tellsCountered: number;
};

export type HollowfangAttemptPlayer = Pick<
  PlayerState,
  "rankLevel" | "condition" | "voidInstability" | "resources"
>;

// ────────────────────────────────────────────────────────────────────
// Seeded RNG — mulberry32 (matches features/arena/combatResolver.ts)
// ────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ────────────────────────────────────────────────────────────────────
// Phase simulation
// ────────────────────────────────────────────────────────────────────

type ResolveCtx = {
  rand: () => number;
  readiness: number; // 0..1
  /** Outgoing damage multiplier from condition+corruption (already applied). */
  outgoingMult: number;
  /** Incoming damage multiplier from condition+corruption (takeMult). */
  incomingMult: number;
  /** Effective party damage-per-turn baseline. */
  partyDps: number;
};

function resolvePhase(phase: HollowfangPhase, ctx: ResolveCtx): PhaseTrace {
  const phaseHp = HOLLOWFANG_PROFILE.maxHp * phaseHpShareForOrder(phase.order);
  let hpLeft = phaseHp;
  let incoming = 0;
  let tellsLanded = 0;
  let tellsCountered = 0;
  let turns = 0;

  while (turns < phase.turnCap && hpLeft > 0) {
    turns += 1;

    // Party damage this turn (readiness boosts, jitter ±15%).
    const jitter = 0.85 + ctx.rand() * 0.3;
    const readinessDmgMult = 0.6 + ctx.readiness * 0.8; // 0.6..1.4
    const dmg = ctx.partyDps * readinessDmgMult * ctx.outgoingMult * jitter;
    hpLeft = Math.max(0, hpLeft - dmg);

    // Tell resolution — each tell rolls against readiness.
    for (const t of phase.tells) {
      const readRoll = ctx.rand();
      const countered = readRoll < ctx.readiness;
      if (countered) {
        tellsCountered += 1;
      } else {
        tellsLanded += 1;
        // danger budget scaled by phase baseDamage + incoming mult.
        incoming += (t.dangerBudget / 10) * phase.baseDamage * ctx.incomingMult;
      }
    }
  }

  return {
    phaseId: phase.id,
    order: phase.order,
    turnsUsed: turns,
    cleared: hpLeft <= 0,
    incomingDamage: Math.round(incoming),
    tellsLanded,
    tellsCountered,
  };
}

function phaseHpShareForOrder(order: 1 | 2 | 3): number {
  // Derived from HOLLOWFANG_PROFILE.phases hpEnterAt thresholds.
  // p1 = 1.0 → 0.65 = 0.35 of bar
  // p2 = 0.65 → 0.30 = 0.35 of bar
  // p3 = 0.30 → 0.0  = 0.30 of bar
  if (order === 1) return 0.35;
  if (order === 2) return 0.35;
  return 0.3;
}

// ────────────────────────────────────────────────────────────────────
// Top-level resolver
// ────────────────────────────────────────────────────────────────────

export type ResolveOptions = {
  profile?: HollowfangProfile;
  requirements?: HollowfangPrepRequirements;
  /**
   * Base party damage-per-turn. Defaults to a value calibrated so a
   * fully-prepped, fully-healthy attempt clears in ~22–25 turns.
   */
  partyBaseDps?: number;
};

export function resolveHollowfangEncounter(
  player: HollowfangAttemptPlayer,
  seed: number,
  opts: ResolveOptions = {},
): EncounterResult {
  const profile = opts.profile ?? HOLLOWFANG_PROFILE;
  const req = opts.requirements ?? HOLLOWFANG_PREP;
  const partyBaseDps = opts.partyBaseDps ?? 95;

  const rand = mulberry32(seed);
  const prep = checkPrep(player, req);
  const readiness = readinessScore(player, req);

  const debuffs = getCombatDebuffsFromCondition(player);
  const ctx: ResolveCtx = {
    rand,
    readiness,
    outgoingMult: debuffs.dmgMult,
    incomingMult: debuffs.takeMult,
    partyDps: partyBaseDps,
  };

  const traces: PhaseTrace[] = [];
  let phasesCleared: 0 | 1 | 2 | 3 = 0;
  let totalIncoming = 0;

  for (const phase of profile.phases) {
    const trace = resolvePhase(phase, ctx);
    traces.push(trace);
    totalIncoming += trace.incomingDamage;
    if (trace.cleared) {
      phasesCleared = trace.order;
    } else {
      break; // phase timed out → stop
    }
  }

  // Wipe wall — if damageSuffered exceeds a hard cap, outcome flips to wipe.
  const WIPE_WALL = 350;
  let outcome: EncounterOutcome;
  if (phasesCleared === 3 && totalIncoming <= WIPE_WALL) {
    outcome = "victory";
  } else if (phasesCleared === 0 || totalIncoming > WIPE_WALL) {
    outcome = "wipe";
  } else {
    outcome = "partial";
  }

  // Condition cost + corruption gain scale with incoming damage and outcome.
  const conditionCost = computeConditionCost(outcome, totalIncoming);
  const corruptionGain = computeCorruptionGain(outcome, profile.baseCorruptionTax);

  return {
    seed,
    outcome,
    phasesCleared,
    damageSuffered: totalIncoming,
    rewardTier: outcome, // mirror — rewardTable maps each tier.
    conditionCost,
    corruptionGain,
    phaseTrace: traces,
    readiness,
    prep,
  };
}

// ────────────────────────────────────────────────────────────────────
// Post-resolution taxes
// ────────────────────────────────────────────────────────────────────

function computeConditionCost(outcome: EncounterOutcome, incoming: number): number {
  const base = Math.round(incoming * 0.25);
  if (outcome === "victory") return Math.min(40, Math.max(8, base));
  if (outcome === "partial") return Math.min(60, Math.max(20, base + 10));
  return Math.min(85, Math.max(45, base + 25)); // wipe
}

function computeCorruptionGain(outcome: EncounterOutcome, base: number): number {
  if (outcome === "victory") return Math.round(base * 0.4);
  if (outcome === "partial") return Math.round(base * 0.8);
  return base + 8; // wipe — full tax + bleed
}
