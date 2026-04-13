/**
 * Task 3.3 — Quality System.
 *
 * Maps average material quality + profession bonus to an output quality tier.
 * Canon has no authored quality tier list yet, so we use tuning names:
 *   rough → standard → refined → exemplary
 *
 * Pure functions. No side effects. Pure-Empire naming (no "Spirit").
 */

export type QualityTier = "rough" | "standard" | "refined" | "exemplary";

export const QUALITY_ORDER: QualityTier[] = [
  "rough",
  "standard",
  "refined",
  "exemplary",
];

/** Numeric score by tier: 0..3. */
export function qualityToScore(q: QualityTier): number {
  return QUALITY_ORDER.indexOf(q);
}

export function scoreToQuality(score: number): QualityTier {
  const clamped = Math.max(0, Math.min(QUALITY_ORDER.length - 1, Math.round(score)));
  return QUALITY_ORDER[clamped];
}

/**
 * Average of per-material quality tiers. Empty input → "standard" baseline.
 * Input is an array of QualityTier (one per material stack consumed).
 */
export function averageMaterialQuality(materials: QualityTier[]): QualityTier {
  if (materials.length === 0) return "standard";
  const total = materials.reduce((sum, q) => sum + qualityToScore(q), 0);
  return scoreToQuality(total / materials.length);
}

/**
 * Derive output quality given material average + a profession bonus (−1..+2).
 * Profession bonus typically comes from `computeCraftingQualityBonus()` in
 * `craftAction.ts` (careerFocus + rankLevel).
 */
export function deriveOutputQuality(
  materials: QualityTier[],
  professionBonus: number,
): QualityTier {
  const matScore = qualityToScore(averageMaterialQuality(materials));
  return scoreToQuality(matScore + professionBonus);
}

/** Display label for UI. */
export const qualityLabels: Record<QualityTier, string> = {
  rough: "Rough",
  standard: "Standard",
  refined: "Refined",
  exemplary: "Exemplary",
};
