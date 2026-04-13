/**
 * Arena Behavior Profile — temperament weights, triggers, priorities.
 *
 * Pure module — no React, no dispatch. Consumed by combatResolver.ts.
 *
 * Canon:
 * - PathType ("bio" | "mecha" | "pure") is the school identity.
 * - Bio teaches through INSTINCT (aggressive, adaptive).
 * - Mecha teaches through COMPREHENSION (structured, systemic).
 * - Pure teaches through WISDOM (patient, decisive).
 */

import type { PathType } from "@/features/game/gameTypes";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

/** Temperament axis weights — all values in [0, 1]. */
export type TemperamentWeights = {
  /** Willingness to open / press / swing big. */
  aggression: number;
  /** Tendency to turtle / heal / stall. */
  caution: number;
  /** Ability to swap tactics mid-fight off triggers. */
  adaptability: number;
  /** Preference for patient tempo, burst windows. */
  patience: number;
  /** Raw commitment — how hard a chosen move is pursued. */
  focus: number;
};

/** Priority ordering — first matching priority wins a given turn. */
export type TacticalPriorityId =
  | "finish-low-hp"
  | "burst-window"
  | "sustain-shield"
  | "disrupt-setup"
  | "stall-cooldowns"
  | "pressure-steady";

/** Reactive trigger — fires mid-fight when a condition is met. */
export type BehaviorTriggerId =
  | "self-hp-below-40"
  | "self-hp-below-20"
  | "foe-hp-below-30"
  | "foe-burst-telegraphed"
  | "stall-over-threshold";

export type BehaviorTrigger = {
  id: BehaviorTriggerId;
  /** Aggression shift when trigger fires (can be negative). */
  aggressionShift: number;
  /** Caution shift when trigger fires (can be negative). */
  cautionShift: number;
};

export type BehaviorProfile = {
  /** School doctrine drives combat identity. */
  school: PathType;
  /** Display label for logs/UI. */
  label: string;
  /** Core temperament. */
  temperament: TemperamentWeights;
  /** Tactical priority ordering. Earlier priorities outrank later ones. */
  priorities: TacticalPriorityId[];
  /** Active triggers — reactive layer. */
  triggers: BehaviorTrigger[];
};

// ─────────────────────────────────────────────────────
// School defaults — starting points before player tuning
// ─────────────────────────────────────────────────────

/** Bio: Instinct. High aggression + adaptability, low caution. */
export const BIO_DEFAULT_PROFILE: BehaviorProfile = {
  school: "bio",
  label: "Coil Instinct",
  temperament: {
    aggression: 0.78,
    caution: 0.22,
    adaptability: 0.72,
    patience: 0.3,
    focus: 0.55,
  },
  priorities: [
    "finish-low-hp",
    "pressure-steady",
    "burst-window",
    "disrupt-setup",
    "sustain-shield",
    "stall-cooldowns",
  ],
  triggers: [
    { id: "foe-hp-below-30", aggressionShift: 0.15, cautionShift: -0.05 },
    { id: "self-hp-below-20", aggressionShift: 0.1, cautionShift: 0.05 },
  ],
};

/** Mecha: Comprehension. Balanced, high focus, reads setups. */
export const MECHA_DEFAULT_PROFILE: BehaviorProfile = {
  school: "mecha",
  label: "Synod Systemic",
  temperament: {
    aggression: 0.5,
    caution: 0.55,
    adaptability: 0.6,
    patience: 0.65,
    focus: 0.8,
  },
  priorities: [
    "disrupt-setup",
    "burst-window",
    "finish-low-hp",
    "sustain-shield",
    "pressure-steady",
    "stall-cooldowns",
  ],
  triggers: [
    { id: "foe-burst-telegraphed", aggressionShift: -0.1, cautionShift: 0.2 },
    { id: "self-hp-below-40", aggressionShift: -0.05, cautionShift: 0.15 },
  ],
};

/** Pure: Wisdom. Patient, decisive, committed to chosen fire. */
export const PURE_DEFAULT_PROFILE: BehaviorProfile = {
  school: "pure",
  label: "Ember Wisdom",
  temperament: {
    aggression: 0.45,
    caution: 0.4,
    adaptability: 0.45,
    patience: 0.85,
    focus: 0.9,
  },
  priorities: [
    "burst-window",
    "finish-low-hp",
    "stall-cooldowns",
    "sustain-shield",
    "disrupt-setup",
    "pressure-steady",
  ],
  triggers: [
    { id: "stall-over-threshold", aggressionShift: 0.2, cautionShift: -0.1 },
    { id: "foe-hp-below-30", aggressionShift: 0.1, cautionShift: -0.05 },
  ],
};

export const SCHOOL_DEFAULT_PROFILES: Record<PathType, BehaviorProfile> = {
  bio: BIO_DEFAULT_PROFILE,
  mecha: MECHA_DEFAULT_PROFILE,
  pure: PURE_DEFAULT_PROFILE,
};

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/** Get a fresh copy of the school default profile. */
export function getDefaultProfile(school: PathType): BehaviorProfile {
  const base = SCHOOL_DEFAULT_PROFILES[school];
  return {
    school: base.school,
    label: base.label,
    temperament: { ...base.temperament },
    priorities: [...base.priorities],
    triggers: base.triggers.map((t) => ({ ...t })),
  };
}

/** Merge partial temperament overrides (player tuning) into a default. */
export function tuneProfile(
  base: BehaviorProfile,
  overrides: Partial<TemperamentWeights>,
): BehaviorProfile {
  return {
    ...base,
    temperament: {
      aggression: clamp01(
        overrides.aggression ?? base.temperament.aggression,
      ),
      caution: clamp01(overrides.caution ?? base.temperament.caution),
      adaptability: clamp01(
        overrides.adaptability ?? base.temperament.adaptability,
      ),
      patience: clamp01(overrides.patience ?? base.temperament.patience),
      focus: clamp01(overrides.focus ?? base.temperament.focus),
    },
    priorities: [...base.priorities],
    triggers: base.triggers.map((t) => ({ ...t })),
  };
}

/** Apply triggered shifts to a temperament snapshot. */
export function applyTriggerShifts(
  weights: TemperamentWeights,
  firedTriggers: BehaviorTrigger[],
): TemperamentWeights {
  let aggression = weights.aggression;
  let caution = weights.caution;
  for (const t of firedTriggers) {
    aggression += t.aggressionShift;
    caution += t.cautionShift;
  }
  return {
    aggression: clamp01(aggression),
    caution: clamp01(caution),
    adaptability: weights.adaptability,
    patience: weights.patience,
    focus: weights.focus,
  };
}

/** True if this trigger id should fire given a snapshot. */
export function shouldTriggerFire(
  id: BehaviorTriggerId,
  ctx: {
    selfHpPct: number;
    foeHpPct: number;
    foeTelegraphing: boolean;
    turnsSinceLastHit: number;
  },
): boolean {
  if (id === "self-hp-below-40") return ctx.selfHpPct < 0.4;
  if (id === "self-hp-below-20") return ctx.selfHpPct < 0.2;
  if (id === "foe-hp-below-30") return ctx.foeHpPct < 0.3;
  if (id === "foe-burst-telegraphed") return ctx.foeTelegraphing;
  if (id === "stall-over-threshold") return ctx.turnsSinceLastHit >= 3;
  return false;
}
