/**
 * Block 4 Task 4.2 — pure seeded harvest roll.
 *
 * Rules:
 *   - Deterministic via mulberry32 (same pattern as arena/combatResolver).
 *   - Profession rank increases roll count and widens the rarity ceiling.
 *   - Kill method gates certain parts (requiredKillMethod).
 *   - Body region slices the candidate pool.
 *   - Returns HarvestOutcome (possibly empty).
 */

import type {
  CreaturePart,
  CreaturePartRarity,
  HarvestAttempt,
  HarvestOutcome,
  HarvestedPart,
  KillMethod,
} from "@/features/harvest/trophyTypes";
import {
  getDropCandidates,
  getRarityWeight,
} from "@/features/harvest/creatureDropTable";

// ────────────────────────────────────────────────────────────────
// Seeded RNG (mulberry32) — mirrors features/arena/combatResolver.ts
// ────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────
// Profession-rank curve
// ────────────────────────────────────────────────────────────────

/** Roll count increases with rank (1 at rank 0, up to 4 at rank 10). */
function rollCountForRank(rank: number): number {
  const r = Math.max(0, Math.min(10, Math.floor(rank)));
  return 1 + Math.floor(r / 3); // 1,1,1,2,2,2,3,3,3,4,4
}

/**
 * Rarity ceiling — a harvester can only obtain parts up to this rarity.
 * Legendary requires rank 8+.
 */
function rarityCeilingForRank(rank: number): CreaturePartRarity {
  if (rank >= 8) return "legendary";
  if (rank >= 6) return "epic";
  if (rank >= 4) return "rare";
  if (rank >= 2) return "uncommon";
  return "common";
}

const RARITY_ORDER: CreaturePartRarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

function rarityRank(r: CreaturePartRarity): number {
  return RARITY_ORDER.indexOf(r);
}

// ────────────────────────────────────────────────────────────────
// Kill-method gate
// ────────────────────────────────────────────────────────────────

/**
 * A kill method satisfies a required method if it matches, OR if the
 * player went above/beyond — finishers always satisfy "clean", and
 * "brutal" still satisfies "environmental". Keeps gating lenient in
 * favor of the hunter without trivialising it.
 */
function killMethodSatisfies(
  got: KillMethod,
  required: KillMethod | undefined,
): boolean {
  if (!required) return true;
  if (got === required) return true;
  if (required === "clean" && got === "finisher") return true;
  if (required === "environmental" && got === "brutal") return true;
  return false;
}

// ────────────────────────────────────────────────────────────────
// Weighted pick
// ────────────────────────────────────────────────────────────────

type Weighted = { part: CreaturePart; weight: number };

function pickWeighted(
  rand: () => number,
  pool: Weighted[],
): CreaturePart | undefined {
  if (pool.length === 0) return undefined;
  const total = pool.reduce((a, w) => a + w.weight, 0);
  if (total <= 0) return undefined;
  let roll = rand() * total;
  for (const w of pool) {
    roll -= w.weight;
    if (roll <= 0) return w.part;
  }
  return pool[pool.length - 1].part;
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export function performHarvest(attempt: HarvestAttempt): HarvestOutcome {
  const {
    creatureId,
    bodyRegion,
    killMethod,
    professionRank,
    seed,
  } = attempt;

  const rand = mulberry32(seed);
  const notes: string[] = [];
  const ceiling = rarityRank(rarityCeilingForRank(professionRank));

  const candidates = getDropCandidates(creatureId, bodyRegion);
  // Gate by kill method + profession rank + rarity ceiling.
  const eligible: Weighted[] = candidates
    .filter((c) => {
      if (!killMethodSatisfies(killMethod, c.part.requiredKillMethod)) {
        return false;
      }
      if (
        c.part.minProfessionRank !== undefined &&
        professionRank < c.part.minProfessionRank
      ) {
        return false;
      }
      if (rarityRank(c.part.rarity) > ceiling) return false;
      return true;
    })
    .map((c) => ({
      part: c.part,
      // Rank tilts the curve toward higher rarities.
      weight: getRarityWeight(c.part.rarity) *
        (1 + rarityRank(c.part.rarity) * professionRank * 0.05),
    }));

  if (eligible.length === 0) {
    notes.push(
      `No viable harvest: ${bodyRegion} yielded nothing for a rank ${professionRank} ${killMethod} kill.`,
    );
    return { attempt, parts: [], notes, empty: true };
  }

  const rollCount = rollCountForRank(professionRank);
  const parts: HarvestedPart[] = [];
  // Unique trophies only drop once per harvest.
  const uniqueTaken = new Set<string>();

  for (let i = 0; i < rollCount; i++) {
    // Filter out already-taken unique trophies for each subsequent roll.
    const pool = eligible.filter((w) => !uniqueTaken.has(w.part.id));
    const picked = pickWeighted(rand, pool);
    if (!picked) continue;
    if (picked.uniqueTrophy) uniqueTaken.add(picked.id);
    parts.push({
      partId: picked.id,
      displayName: picked.displayName,
      rarity: picked.rarity,
      school: picked.school,
      sourceCreature: picked.sourceCreature,
      bodyRegion: picked.bodyRegion,
    });
    notes.push(`Harvested ${picked.displayName} (${picked.rarity}).`);
  }

  return { attempt, parts, notes, empty: parts.length === 0 };
}

// Exported helpers for tests / UI tuning.
export const _internals = {
  rollCountForRank,
  rarityCeilingForRank,
  killMethodSatisfies,
};
