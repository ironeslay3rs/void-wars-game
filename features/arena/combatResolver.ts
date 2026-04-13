/**
 * Arena Combat Resolver — deterministic, seeded simulation of a ranked duel.
 * Pure module. Seeded RNG guarantees reproducibility for tests.
 */

import type { PathType } from "@/features/game/gameTypes";
import {
  applyTriggerShifts,
  shouldTriggerFire,
  type BehaviorProfile,
  type BehaviorTrigger,
  type TacticalPriorityId,
} from "@/features/arena/behaviorProfile";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type CombatLoadout = {
  /** Combat name / label. */
  label: string;
  /** School identity (should match the profile's school). */
  school: PathType;
  /** Base max HP. */
  maxHp: number;
  /** Base damage floor per successful hit. */
  minDamage: number;
  /** Base damage ceiling per successful hit. */
  maxDamage: number;
  /** Chance of a crit, 0..1. */
  critChance: number;
  /** Crit multiplier, typically 1.2..1.6. */
  critMultiplier: number;
  /** Composite rating influencing Elo expected-score (higher = better). */
  rating: number;
};

export type CombatSide = {
  profile: BehaviorProfile;
  loadout: CombatLoadout;
};

export type CombatActionKind = "strike" | "burst" | "guard" | "stall";

export type CombatRound = {
  turn: number;
  /** 0 = side A, 1 = side B. */
  attackerIdx: 0 | 1;
  action: CombatActionKind;
  priority: TacticalPriorityId;
  damage: number;
  crit: boolean;
  attackerHpAfter: number;
  defenderHpAfter: number;
  firedTriggers: BehaviorTrigger[];
};

export type CombatResult = {
  seed: number;
  /** 0 | 1 — winning side index. */
  winnerIdx: 0 | 1;
  /** How many turns resolved (one action per turn). */
  turns: number;
  /** Whether the fight ended on the hard turn cap (draw-broken by remaining HP). */
  cappedOut: boolean;
  rounds: CombatRound[];
  /** Final HP per side. */
  finalHp: [number, number];
  /** Total damage dealt per side. */
  damageDealt: [number, number];
};

// ─────────────────────────────────────────────────────
// Deterministic RNG — Mulberry32
// ─────────────────────────────────────────────────────

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

const MAX_TURNS = 40;

type LiveSide = {
  profile: BehaviorProfile;
  loadout: CombatLoadout;
  hp: number;
  telegraphing: boolean;
  turnsSinceHit: number;
  guarding: boolean;
};

function initSide(side: CombatSide): LiveSide {
  return {
    profile: side.profile,
    loadout: side.loadout,
    hp: side.loadout.maxHp,
    telegraphing: false,
    turnsSinceHit: 0,
    guarding: false,
  };
}

function evaluateTriggers(
  side: LiveSide,
  foe: LiveSide,
): BehaviorTrigger[] {
  const ctx = {
    selfHpPct: side.hp / side.loadout.maxHp,
    foeHpPct: foe.hp / foe.loadout.maxHp,
    foeTelegraphing: foe.telegraphing,
    turnsSinceLastHit: side.turnsSinceHit,
  };
  return side.profile.triggers.filter((t) => shouldTriggerFire(t.id, ctx));
}

function pickPriority(
  side: LiveSide,
  foe: LiveSide,
): TacticalPriorityId {
  const foePct = foe.hp / foe.loadout.maxHp;
  const selfPct = side.hp / side.loadout.maxHp;
  for (const p of side.profile.priorities) {
    if (p === "finish-low-hp" && foePct < 0.25) return p;
    if (p === "burst-window" && foe.telegraphing) return p;
    if (p === "sustain-shield" && selfPct < 0.35) return p;
    if (p === "disrupt-setup" && foe.telegraphing) return p;
    if (p === "stall-cooldowns" && side.turnsSinceHit < 2 && selfPct < 0.5)
      return p;
    if (p === "pressure-steady") return p;
  }
  return "pressure-steady";
}

function priorityToAction(
  priority: TacticalPriorityId,
  aggression: number,
  caution: number,
): CombatActionKind {
  if (priority === "finish-low-hp") return "burst";
  if (priority === "burst-window") return aggression >= 0.5 ? "burst" : "strike";
  if (priority === "sustain-shield") return "guard";
  if (priority === "disrupt-setup") return "strike";
  if (priority === "stall-cooldowns") return caution >= 0.5 ? "guard" : "stall";
  return "strike";
}

function rollDamage(
  attacker: LiveSide,
  defender: LiveSide,
  action: CombatActionKind,
  aggression: number,
  focus: number,
  rand: () => number,
): { damage: number; crit: boolean } {
  if (action === "guard" || action === "stall") {
    return { damage: 0, crit: false };
  }
  const { minDamage, maxDamage, critChance, critMultiplier } = attacker.loadout;
  const roll = minDamage + rand() * (maxDamage - minDamage);
  const aggressionBoost = 0.85 + aggression * 0.3; // 0.85..1.15
  const focusBoost = 0.9 + focus * 0.2; // 0.9..1.10
  let dmg = roll * aggressionBoost * focusBoost;
  if (action === "burst") dmg *= 1.35;
  const crit = rand() < critChance;
  if (crit) dmg *= critMultiplier;
  // Defender guard mitigates
  if (defender.guarding) dmg *= 0.55;
  return { damage: Math.max(1, Math.round(dmg)), crit };
}

export function resolveCombat(
  sideA: CombatSide,
  sideB: CombatSide,
  seed: number,
): CombatResult {
  const rand = mulberry32(seed);
  const sides: [LiveSide, LiveSide] = [initSide(sideA), initSide(sideB)];
  const rounds: CombatRound[] = [];
  const damageDealt: [number, number] = [0, 0];

  // Decide who moves first — higher focus + small rng jitter.
  const focusA = sides[0].profile.temperament.focus;
  const focusB = sides[1].profile.temperament.focus;
  let current: 0 | 1 = focusA + rand() * 0.1 >= focusB + rand() * 0.1 ? 0 : 1;

  let turn = 0;
  let cappedOut = false;
  while (turn < MAX_TURNS) {
    turn += 1;
    const attacker = sides[current];
    const defender = sides[1 - current] as LiveSide;

    const firedTriggers = evaluateTriggers(attacker, defender);
    const tuned = applyTriggerShifts(
      attacker.profile.temperament,
      firedTriggers,
    );

    const priority = pickPriority(attacker, defender);
    const action = priorityToAction(priority, tuned.aggression, tuned.caution);

    // Telegraph burst so foe can react next turn.
    attacker.telegraphing = action === "burst";
    // Guarding carries to next incoming swing, then clears.
    if (action === "guard") attacker.guarding = true;

    const { damage, crit } = rollDamage(
      attacker,
      defender,
      action,
      tuned.aggression,
      tuned.focus,
      rand,
    );
    if (damage > 0) {
      defender.hp = Math.max(0, defender.hp - damage);
      damageDealt[current] += damage;
      attacker.turnsSinceHit = 0;
      defender.guarding = false;
    } else {
      attacker.turnsSinceHit += 1;
    }

    rounds.push({
      turn,
      attackerIdx: current,
      action,
      priority,
      damage,
      crit,
      attackerHpAfter: attacker.hp,
      defenderHpAfter: defender.hp,
      firedTriggers,
    });

    if (defender.hp <= 0) {
      return {
        seed,
        winnerIdx: current,
        turns: turn,
        cappedOut: false,
        rounds,
        finalHp: [sides[0].hp, sides[1].hp],
        damageDealt,
      };
    }

    current = (1 - current) as 0 | 1;
  }

  cappedOut = true;
  const winnerIdx: 0 | 1 = sides[0].hp >= sides[1].hp ? 0 : 1;
  return {
    seed,
    winnerIdx,
    turns: turn,
    cappedOut,
    rounds,
    finalHp: [sides[0].hp, sides[1].hp],
    damageDealt,
  };
}

/** Convenience: build a loadout from a profile + base stats (uniform defaults). */
export function buildLoadout(
  label: string,
  school: PathType,
  rating: number,
  overrides: Partial<CombatLoadout> = {},
): CombatLoadout {
  return {
    label,
    school,
    maxHp: overrides.maxHp ?? 380,
    minDamage: overrides.minDamage ?? 22,
    maxDamage: overrides.maxDamage ?? 36,
    critChance: overrides.critChance ?? 0.09,
    critMultiplier: overrides.critMultiplier ?? 1.35,
    rating,
  };
}
