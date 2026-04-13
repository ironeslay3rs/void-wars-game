/**
 * Arena Ranking System — Elo-style ranking with seasonal resets.
 *
 * Pure, deterministic functions. No storage, no dispatch — callers persist.
 */

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type RankTier =
  | "unranked"
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "void";

export type RankEntry = {
  /** Elo rating. */
  rating: number;
  /** Games played this season. */
  games: number;
  wins: number;
  losses: number;
  /** Ranked wins in a row — used for hot-streak cosmetic. */
  winStreak: number;
  /** Tier computed from rating, cached for UI. */
  tier: RankTier;
  /** Season id the record belongs to. */
  seasonId: string;
};

export type SeasonResetPolicy = {
  /** Soft-reset: pulled toward floor by this fraction of (rating - floor). */
  softPullFraction: number;
  /** Baseline rating a reset drops unranked / placement players to. */
  floor: number;
  /** New season id to stamp onto the reset record. */
  nextSeasonId: string;
};

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────

export const DEFAULT_K_FACTOR = 32;
/** Lower K for high-rated veterans to prevent late-season swings. */
export const VETERAN_K_FACTOR = 20;
export const VETERAN_RATING_THRESHOLD = 2000;
/** Placement K bonus — first N games swing harder to find true rating. */
export const PLACEMENT_K_FACTOR = 48;
export const PLACEMENT_GAMES = 5;

export const BASE_RATING = 1000;
export const RATING_FLOOR = 100;

/** Tier thresholds — inclusive lower bound. */
const TIER_THRESHOLDS: { tier: RankTier; min: number }[] = [
  { tier: "void", min: 2400 },
  { tier: "diamond", min: 2100 },
  { tier: "platinum", min: 1800 },
  { tier: "gold", min: 1500 },
  { tier: "silver", min: 1250 },
  { tier: "bronze", min: 1000 },
  { tier: "iron", min: RATING_FLOOR },
];

// ─────────────────────────────────────────────────────
// Core Elo math
// ─────────────────────────────────────────────────────

/** Standard Elo expected-score formula. */
export function expectedScore(
  playerRating: number,
  opponentRating: number,
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/** Pick a K factor based on rating + games played. */
export function pickKFactor(entry: RankEntry): number {
  if (entry.games < PLACEMENT_GAMES) return PLACEMENT_K_FACTOR;
  if (entry.rating >= VETERAN_RATING_THRESHOLD) return VETERAN_K_FACTOR;
  return DEFAULT_K_FACTOR;
}

/** Tier lookup from rating. */
export function getRankTier(rating: number): RankTier {
  if (rating <= 0) return "unranked";
  for (const t of TIER_THRESHOLDS) {
    if (rating >= t.min) return t.tier;
  }
  return "unranked";
}

// ─────────────────────────────────────────────────────
// Match updates
// ─────────────────────────────────────────────────────

export type MatchOutcome = {
  /** 1 = win, 0 = loss, 0.5 = draw. */
  playerScore: 0 | 0.5 | 1;
  opponentRating: number;
};

export type RankUpdateResult = {
  prev: RankEntry;
  next: RankEntry;
  /** Net rating delta (next - prev). */
  delta: number;
  expected: number;
  kFactor: number;
};

export function applyMatchResult(
  entry: RankEntry,
  outcome: MatchOutcome,
): RankUpdateResult {
  const expected = expectedScore(entry.rating, outcome.opponentRating);
  const kFactor = pickKFactor(entry);
  const rawDelta = kFactor * (outcome.playerScore - expected);
  const nextRatingUnclamped = entry.rating + rawDelta;
  const nextRating = Math.max(
    RATING_FLOOR,
    Math.round(nextRatingUnclamped),
  );
  const isWin = outcome.playerScore === 1;
  const isLoss = outcome.playerScore === 0;
  const next: RankEntry = {
    rating: nextRating,
    games: entry.games + 1,
    wins: entry.wins + (isWin ? 1 : 0),
    losses: entry.losses + (isLoss ? 1 : 0),
    winStreak: isWin ? entry.winStreak + 1 : 0,
    tier: getRankTier(nextRating),
    seasonId: entry.seasonId,
  };
  return {
    prev: entry,
    next,
    delta: next.rating - entry.rating,
    expected,
    kFactor,
  };
}

// ─────────────────────────────────────────────────────
// Seasonal reset
// ─────────────────────────────────────────────────────

/** Apply a soft season reset — pull rating toward floor, zero the streak. */
export function applySeasonReset(
  entry: RankEntry,
  policy: SeasonResetPolicy,
): RankEntry {
  const { softPullFraction, floor, nextSeasonId } = policy;
  const pull = Math.max(0, Math.min(1, softPullFraction));
  const distance = entry.rating - floor;
  const newRating = Math.round(floor + distance * (1 - pull));
  const clamped = Math.max(RATING_FLOOR, newRating);
  return {
    rating: clamped,
    games: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    tier: getRankTier(clamped),
    seasonId: nextSeasonId,
  };
}

/** Create a fresh placement entry for a brand-new player. */
export function createFreshRankEntry(seasonId: string): RankEntry {
  return {
    rating: BASE_RATING,
    games: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    tier: getRankTier(BASE_RATING),
    seasonId,
  };
}

/** Default soft-reset policy — 50% pull to 1000. */
export function defaultSeasonPolicy(nextSeasonId: string): SeasonResetPolicy {
  return {
    softPullFraction: 0.5,
    floor: BASE_RATING,
    nextSeasonId,
  };
}
