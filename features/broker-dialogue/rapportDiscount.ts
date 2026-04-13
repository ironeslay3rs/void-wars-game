/**
 * Rapport-gated price discounts.
 *
 * Trusted customers get better rates. Strangers pay full. This is the
 * mechanical payoff for the rapport loop: dialogue isn't just flavor,
 * it saves you Sinful Coin on every purchase from that broker.
 *
 * Tiers match the rapport bands used throughout the dialogue system
 * (see getRapportBand in brokerDialogueTypes). Discounts apply to the
 * base interaction cost and to unlocked offers alike — rapport is a
 * trust currency that cuts every transaction the broker facilitates.
 */

export const RAPPORT_DISCOUNT_STRANGER_PCT = 0; // < 10
export const RAPPORT_DISCOUNT_ACQUAINTED_PCT = 5; // [10, 30)
export const RAPPORT_DISCOUNT_FAMILIAR_PCT = 10; // [30, 60)
export const RAPPORT_DISCOUNT_TRUSTED_PCT = 20; // >= 60

export function getRapportDiscountPct(rapport: number): number {
  if (rapport >= 60) return RAPPORT_DISCOUNT_TRUSTED_PCT;
  if (rapport >= 30) return RAPPORT_DISCOUNT_FAMILIAR_PCT;
  if (rapport >= 10) return RAPPORT_DISCOUNT_ACQUAINTED_PCT;
  return RAPPORT_DISCOUNT_STRANGER_PCT;
}

/**
 * Applies rapport discount to a base cost. Floors at 1 Sinful Coin so
 * transactions never become free — there's always friction, even for
 * trusted customers.
 */
export function getDiscountedCost(
  baseCost: number,
  rapport: number,
): number {
  if (baseCost <= 0) return 0;
  const pct = getRapportDiscountPct(rapport);
  if (pct === 0) return baseCost;
  const discounted = Math.round(baseCost * (1 - pct / 100));
  return Math.max(1, discounted);
}
