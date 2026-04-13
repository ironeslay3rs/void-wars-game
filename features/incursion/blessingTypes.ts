/**
 * Void Incursion Blessings — canonical types.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Schools/The Three Evolution Schools.md
 *     (Bio/Verdant Coil, Mecha/Chrome Synod, Pure/Ember Vault)
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — Three Capacities.
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — exposure is a tax
 *     on the body, mind, and soul; the Void forces adaptation at a cost.
 *   - lore-canon/CLAUDE.md — "Pure" (never "Spirit"); empire names in flavor;
 *     Black City = neutral fusion ground.
 *
 * Hades-style adaptation: each Void Field run offers 3 blessings (one per
 * school) and a rare Black City fusion swap. Blessings are per-run buffs;
 * their *costs* (corruption, condition, capacity stress) persist.
 */
import type { RuneCapacityPool } from "@/features/mastery/runeMasteryTypes";

/** School key used by the incursion layer. "pure" — never "spirit". */
export type BlessingSchool = "bio" | "mecha" | "pure";

/**
 * Rare Black City fusion pairs two schools. Canonical pairs only — Black
 * City is neutral ground where the three schools collide.
 */
export type BlessingFusionPair =
  | "bio+mecha"
  | "mecha+pure"
  | "pure+bio";

export type BlessingRarity = "common" | "rare";

/**
 * Effect magnitudes are stat-agnostic deltas that Frontend/combat consumers
 * sum via `summarizeActiveBlessings`. All are additive; keep units sane.
 */
export type BlessingEffect = {
  /** % damage added to shell/realtime combat (0–100). */
  damagePct?: number;
  /** Flat regen ticks per second applied during the run. */
  regenPerSec?: number;
  /** % shield / mitigation granted for the run. */
  shieldPct?: number;
  /** % precision/crit chance granted for the run. */
  precisionPct?: number;
  /** % range/reach granted for the run. */
  rangePct?: number;
  /** Flat mana bonus added for the run (soft cap for preview). */
  manaBonus?: number;
  /** % drop / loot roll boost applied during the run. */
  lootPct?: number;
  /** % dodge/evasion granted for the run. */
  dodgePct?: number;
  /** Foresight / soul-echo — count of "peek" charges for the run. */
  foresightCharges?: number;
  /** Adaptation — % mismatch penalty suppression during this run. */
  mismatchReductionPct?: number;
};

/** Blessing cost — what the player pays when they accept a blessing. */
export type BlessingCost =
  | {
      kind: "corruption";
      /** Points of voidInstability added immediately (0–100 scale). */
      amount: number;
    }
  | {
      kind: "condition";
      /** Flat condition points drained immediately (0–100 scale). */
      amount: number;
    }
  | {
      kind: "capacity";
      /** Capacity stress points applied to a chosen pool. */
      amount: number;
      /** Which Capacity pool eats the stress (Blood/Frame/Resonance). */
      pool: RuneCapacityPool;
    };

export type Blessing = {
  id: string;
  name: string;
  school: BlessingSchool;
  /** Short canonical flavor line (empire names; "Pure" not "Spirit"). */
  flavor: string;
  effect: BlessingEffect;
  cost: BlessingCost;
  rarity: BlessingRarity;
};

/**
 * Black City fusion blessing — combines two schools. Higher power ceiling
 * but pays two costs (instability = cost to flesh AND pool stress).
 */
export type FusionBlessing = Omit<Blessing, "school" | "cost" | "rarity"> & {
  rarity: "fusion";
  pair: BlessingFusionPair;
  /** Both costs paid up-front; order doesn't matter. */
  costs: [BlessingCost, BlessingCost];
};

/** The exact offer a player sees when entering a run. */
export type BlessingOffer = {
  runId: string;
  /** Seed used to produce this offer — stored for audit / replay. */
  seed: number;
  /** One blessing per school, in canonical order [bio, mecha, pure]. */
  picks: [Blessing, Blessing, Blessing];
  /**
   * If present, a rare Black City fusion replaces one of the picks. The
   * slotIndex points to which school slot was swapped out (0/1/2).
   */
  fusionSwap: {
    slotIndex: 0 | 1 | 2;
    fusion: FusionBlessing;
  } | null;
};

/** A blessing the player has actually accepted for this run. */
export type ActiveBlessing =
  | { kind: "school"; blessing: Blessing; acceptedAt: number }
  | { kind: "fusion"; blessing: FusionBlessing; acceptedAt: number };

/** All blessings accepted during the current Void Field run. */
export type ActiveBlessingSet = {
  runId: string;
  entries: ActiveBlessing[];
};

/** Stacked totals consumed by combat / loot systems. */
export type BlessingSummary = {
  runId: string;
  count: number;
  totals: Required<BlessingEffect>;
  /** Instability carried into the summary (sum of corruption costs paid). */
  corruptionPaid: number;
  /** Condition drained into the summary (sum of condition costs paid). */
  conditionPaid: number;
  /** Capacity stress applied per pool. */
  capacityStress: Record<RuneCapacityPool, number>;
};
