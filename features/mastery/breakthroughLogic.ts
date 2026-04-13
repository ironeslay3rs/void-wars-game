/**
 * Breakthrough — Overmortal-style ascension wall for rune depth promotion.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/Runes/Rune System.md
 *       L1 standard / L2 Executional / L3 Rare / L4 nearly impossible /
 *       L5 mythical / L6+ beyond normal creation. Capacity and compatibility
 *       are gating laws; "stronger individuals can usually hold more and
 *       better runes." Breakthroughs gate the jump to higher levels.
 *   - lore-canon/CLAUDE.md (Currency Hierarchy)
 *       Apex materials per empire: Bloodvein (Bio), Ironheart (Mecha),
 *       Ashveil (Pure). Meldheart is the Black Market fusion apex and is
 *       NOT used here — single-school breakthroughs only.
 *
 * Game adaptation:
 *   - Three breakthrough walls at depths 3, 5, 7. Crossing the wall is
 *     the act of promoting from one canon set level to the next.
 *   - Each wall demands the school's apex material AND capacity headroom.
 *   - 70% base success at the wall; failure consumes HALF the apex
 *     (Darkest Dungeon consequence layer) but always at least 1.
 *   - Pure functions; reducers wrap the result and persist outcome.
 */

import type { PlayerState, ResourceKey } from "@/features/game/gameTypes";
import type {
  PlayerRuneMasteryState,
  RuneSchool,
} from "@/features/mastery/runeMasteryTypes";
import { schoolToCapacityPool } from "@/features/mastery/runeMasteryTypes";
import {
  RUNE_DEPTH_MAX,
  getEffectiveCapacityMax,
  effectiveHybridReliefFromMythic,
} from "@/features/mastery/runeMasteryLogic";

/** Depth values that REQUIRE a breakthrough to cross (L1->L2, L2->L3, L3->L4). */
export const BREAKTHROUGH_THRESHOLDS: readonly number[] = [3, 5, 7];

/** Base wall success — 70% feels like a real wall without being punishing. */
export const BREAKTHROUGH_BASE_SUCCESS_PCT = 70;

/** Apex amount required per wall (escalates with depth). Tunable. */
const APEX_AMOUNT_BY_THRESHOLD: Record<number, number> = {
  3: 1,
  5: 2,
  7: 3,
};

/** Capacity headroom needed per wall — proves the player has room to grow. */
const CAPACITY_HEADROOM_BY_THRESHOLD: Record<number, number> = {
  3: 2,
  5: 3,
  7: 4,
};

export type BreakthroughRequirement = {
  apexMaterial: ResourceKey;
  apexAmount: number;
  capacityHeadroomNeeded: number;
};

/** Empire-apex material per school (canon: vault CLAUDE.md Currency Hierarchy). */
export function getApexMaterialForSchool(
  school: RuneSchool,
): "bloodvein" | "ironHeart" | "ashveil" {
  if (school === "bio") return "bloodvein";
  if (school === "mecha") return "ironHeart";
  return "ashveil";
}

/**
 * Returns the breakthrough requirement to promote FROM `fromDepth` to
 * `fromDepth + 1`, or null if no wall sits at that promotion.
 */
export function getBreakthroughRequirement(
  school: RuneSchool,
  fromDepth: number,
): BreakthroughRequirement | null {
  const targetDepth = fromDepth + 1;
  if (!BREAKTHROUGH_THRESHOLDS.includes(targetDepth)) return null;
  if (targetDepth > RUNE_DEPTH_MAX) return null;
  return {
    apexMaterial: getApexMaterialForSchool(school),
    apexAmount: APEX_AMOUNT_BY_THRESHOLD[targetDepth] ?? 1,
    capacityHeadroomNeeded:
      CAPACITY_HEADROOM_BY_THRESHOLD[targetDepth] ?? 1,
  };
}

export type BreakthroughGateCheck =
  | { ok: true }
  | { ok: false; reason: string };

function getCapacityHeadroom(
  player: PlayerState,
  school: RuneSchool,
): number {
  const pool = schoolToCapacityPool(school);
  const relief = effectiveHybridReliefFromMythic(player.mythicAscension);
  const eff = getEffectiveCapacityMax(player.runeMastery, relief);
  // Headroom = how much of the school's pool the player still has banked.
  return Math.min(player.runeMastery.capacity[pool], eff[pool]);
}

/**
 * Pure precondition check — does NOT mutate. UI mirrors this for the
 * "attempt" CTA enable/disable + reason copy.
 */
export function canAttemptBreakthrough(
  player: PlayerState,
  school: RuneSchool,
  fromDepth: number,
): BreakthroughGateCheck {
  const currentDepth = player.runeMastery.depthBySchool[school];
  if (currentDepth !== fromDepth) {
    return {
      ok: false,
      reason: `Current ${school} depth is ${currentDepth}, not ${fromDepth}.`,
    };
  }
  if (fromDepth >= RUNE_DEPTH_MAX) {
    return { ok: false, reason: "Already at max rune depth." };
  }
  const req = getBreakthroughRequirement(school, fromDepth);
  if (!req) {
    return { ok: false, reason: "No breakthrough wall at this depth." };
  }
  const apexHeld = player.resources[req.apexMaterial] ?? 0;
  if (apexHeld < req.apexAmount) {
    return {
      ok: false,
      reason: `Need ${req.apexAmount} ${req.apexMaterial} (have ${apexHeld}).`,
    };
  }
  const headroom = getCapacityHeadroom(player, school);
  if (headroom < req.capacityHeadroomNeeded) {
    return {
      ok: false,
      reason: `Need ${req.capacityHeadroomNeeded} capacity headroom on the ${school} pool (have ${headroom}).`,
    };
  }
  return { ok: true };
}

/** Deterministic 0..1 hash from a numeric seed (xorshift-style). */
function seededUnit(seed: number): number {
  let x = Math.floor(seed) | 0;
  if (x === 0) x = 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // Map signed int32 to [0, 1).
  return ((x >>> 0) % 1000000) / 1000000;
}

export type BreakthroughRoll = { success: boolean };

/** Pure roll — caller supplies a seed (Date.now() in the reducer is fine). */
export function rollBreakthroughOutcome(seed: number): BreakthroughRoll {
  const u = seededUnit(seed);
  return { success: u * 100 < BREAKTHROUGH_BASE_SUCCESS_PCT };
}

export type BreakthroughAttemptResult = {
  player: PlayerState;
  outcome: "success" | "fail";
  apexConsumed: number;
};

/**
 * Attempt a breakthrough. Pure — returns a NEW PlayerState.
 *
 * Always consumes apex material (at least 1):
 *   - success: full `apexAmount`, depth +1.
 *   - fail:    floor(apexAmount / 2), clamped to ≥ 1, depth unchanged.
 *
 * If preconditions fail, returns the player unchanged with outcome "fail"
 * and apexConsumed 0 — reducers should typically gate on
 * `canAttemptBreakthrough` first and surface the reason.
 */
export function attemptBreakthrough(
  player: PlayerState,
  school: RuneSchool,
  fromDepth: number,
  seed: number,
): BreakthroughAttemptResult {
  const gate = canAttemptBreakthrough(player, school, fromDepth);
  if (!gate.ok) {
    return { player, outcome: "fail", apexConsumed: 0 };
  }
  const req = getBreakthroughRequirement(school, fromDepth);
  if (!req) {
    return { player, outcome: "fail", apexConsumed: 0 };
  }

  const roll = rollBreakthroughOutcome(seed);

  const apexConsumed = roll.success
    ? req.apexAmount
    : Math.max(1, Math.floor(req.apexAmount / 2));

  const apexHeld = player.resources[req.apexMaterial] ?? 0;
  const nextResources = {
    ...player.resources,
    [req.apexMaterial]: Math.max(0, apexHeld - apexConsumed),
  };

  const nextMastery: PlayerRuneMasteryState = roll.success
    ? {
        ...player.runeMastery,
        depthBySchool: {
          ...player.runeMastery.depthBySchool,
          [school]: Math.min(RUNE_DEPTH_MAX, fromDepth + 1),
        },
      }
    : player.runeMastery;

  return {
    player: {
      ...player,
      resources: nextResources,
      runeMastery: nextMastery,
    },
    outcome: roll.success ? "success" : "fail",
    apexConsumed,
  };
}
