/**
 * Hollowfang Prestige Boss — pure data profile.
 *
 * Canon status (as of 2026-04-13):
 *   - `lore-canon/01 Master Canon/Creatures/` contains only The Void.md;
 *     Hollowfang is not yet a canon entry. Anchors used for design:
 *       • `lore-canon/01 Master Canon/World Laws/` (exposure + adaptation law)
 *       • `lore-canon/01 Master Canon/Creatures/The Void.md` (the Void
 *         forces adaptation; prestige creatures are Void-shaped)
 *       • `lore-canon/CLAUDE.md` empire names (Verdant Coil / Chrome Synod
 *         / Ember Vault) used in phase flavor.
 *   - Naming: always "Pure" (never "Spirit").
 *
 * Design inference:
 *   Hollowfang is a three-phase Void-adapted predator that survived a
 *   Verdant Coil purge by hollowing its own marrow. Each phase escalates
 *   readable tells; players who skip prep will not pass phase 2.
 *
 * This module is pure data. Resolution is in `encounterResolver.ts`.
 */

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type HollowfangPhaseId = "marrow-hunt" | "hollow-rage" | "void-maw";

export type HollowfangTell = {
  /** Stable id used by UI/telegraph banners. */
  id: string;
  /** Short, readable label — Darkest-Dungeon-style telegraph. */
  label: string;
  /** Flavor for the tooltip / battle log. */
  flavor: string;
  /**
   * Scaled "danger budget" 1–10. Resolver multiplies this by phase damage
   * base to compute incoming damage when players mis-prep.
   */
  dangerBudget: number;
};

export type HollowfangPhase = {
  id: HollowfangPhaseId;
  order: 1 | 2 | 3;
  name: string;
  /** HP threshold (fraction of max boss HP) to ENTER this phase. 1.0 = start. */
  hpEnterAt: number;
  /** Phase base incoming-damage tax applied per turn if unprepped. */
  baseDamage: number;
  /**
   * Per-phase hard-wall turn cap. Exceed it and the phase is considered a
   * partial failure (moves to wipe roll based on damage suffered).
   */
  turnCap: number;
  /** The telegraphed tells a prepared party must read and counter. */
  tells: readonly HollowfangTell[];
  /** Optional flavor tying to empire canon. */
  flavor: string;
};

export type HollowfangProfile = {
  id: "hollowfang";
  displayName: string;
  tier: "prestige";
  maxHp: number;
  /** Minimum rank level recommended (used by prep check + UI hint). */
  recommendedRankLevel: number;
  phases: readonly HollowfangPhase[];
  /**
   * Total corruption tax applied for attempting the fight, regardless of
   * outcome. Clear gets a partial refund; wipe pays the full tax.
   */
  baseCorruptionTax: number;
};

// ────────────────────────────────────────────────────────────────────
// Canonical profile
// ────────────────────────────────────────────────────────────────────

export const HOLLOWFANG_PROFILE: HollowfangProfile = {
  id: "hollowfang",
  displayName: "Hollowfang",
  tier: "prestige",
  maxHp: 2200,
  recommendedRankLevel: 12,
  baseCorruptionTax: 12,
  phases: [
    {
      id: "marrow-hunt",
      order: 1,
      name: "Marrow Hunt",
      hpEnterAt: 1.0,
      baseDamage: 18,
      turnCap: 10,
      flavor:
        "Hollowfang paces the edge of the pit. Verdant Coil purge-marks still scar its flank — it remembers being hunted.",
      tells: [
        {
          id: "stalk-step",
          label: "Stalk-Step",
          flavor: "A slow advance; the next strike will arc from flank.",
          dangerBudget: 4,
        },
        {
          id: "bone-flare",
          label: "Bone Flare",
          flavor: "Marrow ignites — counter before it resolves or bleed.",
          dangerBudget: 6,
        },
      ],
    },
    {
      id: "hollow-rage",
      order: 2,
      name: "Hollow Rage",
      hpEnterAt: 0.65,
      baseDamage: 28,
      turnCap: 9,
      flavor:
        "The hollow spaces in its ribs howl. Chrome Synod frame-trauma cannot fix what it chose to become.",
      tells: [
        {
          id: "ribscream",
          label: "Ribscream",
          flavor: "A wide AoE wail — brace or take the full tax.",
          dangerBudget: 7,
        },
        {
          id: "hunger-lunge",
          label: "Hunger Lunge",
          flavor: "It commits — a disciplined burst window opens.",
          dangerBudget: 5,
        },
      ],
    },
    {
      id: "void-maw",
      order: 3,
      name: "Void Maw",
      hpEnterAt: 0.3,
      baseDamage: 42,
      turnCap: 8,
      flavor:
        "The Void adapts it live. Ember Vault resonance is the only readable lens — every second without prep is marrow-paid.",
      tells: [
        {
          id: "maw-yawn",
          label: "Maw Yawn",
          flavor: "A hungry telegraph. A single prepped burst ends it clean.",
          dangerBudget: 8,
        },
        {
          id: "void-bleed",
          label: "Void Bleed",
          flavor: "Corruption pours from the wound it wears like a crown.",
          dangerBudget: 9,
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// Selectors
// ────────────────────────────────────────────────────────────────────

export function getHollowfangPhase(
  id: HollowfangPhaseId,
): HollowfangPhase | undefined {
  return HOLLOWFANG_PROFILE.phases.find((p) => p.id === id);
}

export function getPhaseByOrder(order: 1 | 2 | 3): HollowfangPhase {
  const p = HOLLOWFANG_PROFILE.phases.find((x) => x.order === order);
  if (!p) throw new Error(`hollowfang: missing phase order=${order}`);
  return p;
}

export function totalTurnBudget(profile: HollowfangProfile = HOLLOWFANG_PROFILE): number {
  return profile.phases.reduce((a, p) => a + p.turnCap, 0);
}
