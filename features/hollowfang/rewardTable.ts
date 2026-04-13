/**
 * Hollowfang reward table — tiered reward rolls.
 *
 * Pure: returns a deterministic reward bundle given (outcome, seed).
 *
 * Phase 2 named-material hook:
 *   - Default (`includePhase2: false`, back-compat): the namedMaterials
 *     array is empty and the seeded roll order is preserved (we burn a
 *     `rand()` slot so downstream rolls remain stable).
 *   - Opt-in (`includePhase2: true`): the Phase 2 registry is rolled
 *     with tier-weighted drop chances. Deterministic for the same seed.
 *
 * Canon anchors:
 *   - `lore-canon/CLAUDE.md` Currency Hierarchy — apex materials
 *     (Bloodvein / Ironheart / Ashveil / Meldheart) and lesser forms
 *     (Veinshards / Heart-Iron / Veil Ash / Meldshards).
 *   - `features/materials/phase2Registry.ts` — Phase 2 metadata source.
 *   - `features/void-maps/rollVoidFieldLoot.ts` — tiered drop pattern.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type { RewardTier } from "@/features/hollowfang/encounterResolver";
import {
  PHASE2_MATERIALS,
  type Phase2MaterialEntry,
} from "@/features/materials/phase2Registry";

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type RewardEntry = {
  key: ResourceKey;
  amount: number;
};

export type NamedMaterialEntry = {
  /** Stable id for Phase 2 named-material registry. */
  id: string;
  /** Human label, only for UI preview. */
  label: string;
};

export type HollowfangRewardBundle = {
  tier: RewardTier;
  seed: number;
  resources: RewardEntry[];
  /**
   * Phase 2 named materials hook. Empty until the named-materials pass
   * wires real ids. Consumers MUST tolerate an empty array.
   */
  namedMaterials: NamedMaterialEntry[];
  /** Flavor string for the result card. */
  flavor: string;
};

// ────────────────────────────────────────────────────────────────────
// Seeded RNG (local copy — pure module, no cross-feature leak)
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

function rollAmount(min: number, max: number, rand: () => number): number {
  return Math.floor(min + rand() * (max - min + 1));
}

// ────────────────────────────────────────────────────────────────────
// Tier tables (pure data — tuneable without touching the roller)
// ────────────────────────────────────────────────────────────────────

type RollSpec = { key: ResourceKey; min: number; max: number };

const VICTORY_ROLLS: RollSpec[] = [
  { key: "credits", min: 800, max: 1400 },
  { key: "runeDust", min: 30, max: 55 },
  { key: "emberCore", min: 4, max: 7 },
  { key: "bloodvein", min: 1, max: 2 },
  { key: "ashveil", min: 1, max: 2 },
  { key: "ironHeart", min: 1, max: 1 },
];

const PARTIAL_ROLLS: RollSpec[] = [
  { key: "credits", min: 300, max: 600 },
  { key: "runeDust", min: 10, max: 22 },
  { key: "emberCore", min: 1, max: 2 },
  { key: "bloodvein", min: 0, max: 1 },
];

const WIPE_ROLLS: RollSpec[] = [
  // Wipe still returns a scraps bag — losing everything would feel
  // punitive without teaching. Corruption + condition tax is the real bite.
  { key: "credits", min: 50, max: 120 },
  { key: "scrapAlloy", min: 2, max: 4 },
];

const FLAVOR: Record<RewardTier, string> = {
  victory:
    "The Hollowfang falls. Marrow steams where Void tried to crown it. Verdant Coil will feel the absence.",
  partial:
    "You broke it, but it broke you too. The pit keeps what you dropped on the way out.",
  wipe:
    "It ate the attempt. Scraps cling to your gear; the rest is in its teeth.",
};

// ────────────────────────────────────────────────────────────────────
// Phase 2 named-material drop table (opt-in via options)
// ────────────────────────────────────────────────────────────────────

/**
 * Tier-weighted expected drop count. Rolled as an independent-chance
 * pass over the Phase 2 registry so lucky seeds can drop multiple mats
 * and unlucky seeds can drop none. Deterministic under the same seed.
 */
const PHASE2_TIER_CHANCE: Record<RewardTier, number> = {
  victory: 0.45,
  partial: 0.15,
  wipe: 0.0,
};

function rollPhase2NamedMaterials(
  tier: RewardTier,
  rand: () => number,
): NamedMaterialEntry[] {
  const chance = PHASE2_TIER_CHANCE[tier];
  const out: NamedMaterialEntry[] = [];
  // Stable iteration order so the seed maps to the same slots every run.
  for (const mat of PHASE2_MATERIALS) {
    const rolled = rand();
    if (rolled < chance) {
      out.push(toNamedEntry(mat));
    }
  }
  return out;
}

function toNamedEntry(mat: Phase2MaterialEntry): NamedMaterialEntry {
  return { id: mat.key, label: mat.displayName };
}

// ────────────────────────────────────────────────────────────────────
// Public roller
// ────────────────────────────────────────────────────────────────────

export type RollHollowfangRewardOptions = {
  /**
   * When true, the Phase 2 named-material drop pass runs and populates
   * `namedMaterials` with tier-weighted entries. Default false preserves
   * the existing API + seeded roll order for back-compat.
   */
  includePhase2?: boolean;
};

export function rollHollowfangReward(
  tier: RewardTier,
  seed: number,
  options: RollHollowfangRewardOptions = {},
): HollowfangRewardBundle {
  const rand = mulberry32(seed);
  const specs = selectSpecs(tier);
  const resources: RewardEntry[] = [];
  for (const spec of specs) {
    const amount = rollAmount(spec.min, spec.max, rand);
    if (amount > 0) resources.push({ key: spec.key, amount });
  }

  // Phase 2 named-materials. Default path burns a single rand() slot so
  // the legacy roll order stays stable. Opt-in path consumes one rand()
  // per registry entry — downstream callers under includePhase2 should
  // expect their own deterministic sequence.
  let namedMaterials: NamedMaterialEntry[];
  if (options.includePhase2) {
    namedMaterials = rollPhase2NamedMaterials(tier, rand);
  } else {
    void rand();
    namedMaterials = [];
  }

  return {
    tier,
    seed,
    resources,
    namedMaterials,
    flavor: FLAVOR[tier],
  };
}

function selectSpecs(tier: RewardTier): RollSpec[] {
  if (tier === "victory") return VICTORY_ROLLS;
  if (tier === "partial") return PARTIAL_ROLLS;
  return WIPE_ROLLS;
}

// ────────────────────────────────────────────────────────────────────
// Convenience: summarize totals for UI preview cards.
// ────────────────────────────────────────────────────────────────────

export function totalResourceCount(bundle: HollowfangRewardBundle): number {
  return bundle.resources.reduce((sum, r) => sum + r.amount, 0);
}
