/**
 * generateBlessingOffer — pure, seeded picker for Void Field run blessings.
 *
 * Canon anchors:
 *   - lore-canon/14 TaskQueue/Block-4-New-Mechanics.md §4.1 — "3 blessings
 *     (1 per school)", plus a rare Black City fusion swap.
 *   - lore-canon/CLAUDE.md — Black City = neutral fusion territory; empire
 *     names appear in flavor (Verdant Coil / Chrome Synod / Ember Vault).
 *
 * Determinism: `mulberry32` mirrors `features/arena/combatResolver.ts` so
 * every randomness path in the codebase uses the same PRNG family.
 */
import type {
  Blessing,
  BlessingOffer,
  BlessingSchool,
  FusionBlessing,
} from "./blessingTypes";
import {
  BLACK_CITY_FUSION_BLESSINGS,
  blessingsForSchool,
} from "./blessingRegistry";

/** Canonical school slot order. Do not re-order without canon review. */
export const SCHOOL_SLOT_ORDER: readonly BlessingSchool[] = [
  "bio",
  "mecha",
  "pure",
];

/** Chance per-run that a Black City fusion replaces one school pick. */
export const FUSION_SWAP_CHANCE = 0.15;

export type BlessingOfferInput = {
  seed: number;
  runId: string;
  /**
   * Optional player context — reserved for future tuning (e.g. weight
   * toward primary school, suppress fusion for low-level players). For the
   * functional layer we use it only to hash into the seed so offers are
   * stable per-player-per-run.
   */
  player?: {
    alignment?: "unbound" | "bio" | "mecha" | "pure";
    runCount?: number;
  };
};

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

/** Cheap string hash so runId can feed the seed without non-determinism. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pickOne<T>(rand: () => number, pool: readonly T[]): T {
  if (pool.length === 0) {
    throw new Error("blessingOffer: empty pool");
  }
  const idx = Math.floor(rand() * pool.length);
  return pool[Math.min(idx, pool.length - 1)];
}

/**
 * Produce the 3-pick (optionally fusion-swapped) offer for this run.
 * Pure: identical inputs always yield identical output.
 */
export function generateBlessingOffer(
  input: BlessingOfferInput,
): BlessingOffer {
  const alignmentSalt = input.player?.alignment ?? "unbound";
  const combinedSeed =
    (input.seed >>> 0) ^
    hashString(input.runId) ^
    hashString(alignmentSalt) ^
    ((input.player?.runCount ?? 0) >>> 0);
  const rand = mulberry32(combinedSeed);

  const picks: Blessing[] = SCHOOL_SLOT_ORDER.map((school) =>
    pickOne(rand, blessingsForSchool(school)),
  );

  let fusionSwap: BlessingOffer["fusionSwap"] = null;
  if (rand() < FUSION_SWAP_CHANCE) {
    const slotIndex = Math.floor(rand() * 3) as 0 | 1 | 2;
    const candidates = filterFusionForSlot(
      BLACK_CITY_FUSION_BLESSINGS,
      SCHOOL_SLOT_ORDER[slotIndex],
    );
    const fusion = pickOne(rand, candidates);
    fusionSwap = { slotIndex, fusion };
  }

  return {
    runId: input.runId,
    seed: combinedSeed,
    picks: [picks[0], picks[1], picks[2]],
    fusionSwap,
  };
}

/**
 * Fusion blessings that include the given school — so a "mecha" slot can
 * only be swapped for a fusion that touches Chrome Synod, preserving the
 * canonical 3-school layout.
 */
function filterFusionForSlot(
  pool: readonly FusionBlessing[],
  school: BlessingSchool,
): readonly FusionBlessing[] {
  const filtered = pool.filter((f) => f.pair.includes(school));
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Flatten an offer into the three concrete choices the UI actually shows,
 * honoring the fusion swap. Useful for Frontend / Tests.
 */
export function resolveOfferChoices(
  offer: BlessingOffer,
): readonly (Blessing | FusionBlessing)[] {
  const slots: (Blessing | FusionBlessing)[] = [...offer.picks];
  if (offer.fusionSwap) {
    slots[offer.fusionSwap.slotIndex] = offer.fusionSwap.fusion;
  }
  return slots;
}
