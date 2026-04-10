/**
 * Institutional pressure on the War Exchange.
 *
 * The Phase 9 Sin Institutions are currently pure data + UI — they show up
 * as broker chips and origin tooltips, but they don't move any economic
 * needles in the game. This module starts that shift by giving the
 * **Vishrava Ledger** (Greed) its first concrete economic verb.
 *
 * Canon (`features/institutions/institutionData.ts` and the master-canon
 * Sin Institutions hub):
 *   "The Ledger runs the Pure Empire's hoard-vaults in the subcontinent
 *    and operates the Golden Bazaar exchange floors in Blackcity. Every
 *    trade routes through one of their abacuses; every loan accrues
 *    interest in two currencies — credits and patience."
 *
 * That sentence is the design hook. Translation into game-side math:
 *   - Buys pay a small **abacus tithe** (the Ledger taxes the route).
 *   - Sells earn a small **patience interest** (the Ledger pays loyal
 *     positions to be held).
 *   - Pure-aligned players see the strongest version of both — the
 *     Ledger is their institution, and it is harshest with its own kind
 *     while also paying them the highest interest. Other factions see
 *     a softer outsider rate.
 *   - Unbound players see the baseline — light tithe, light interest.
 *
 * The pressure is intentionally small (1-5% nudges) so it composes with
 * the existing war-front demand multipliers without dominating them.
 *
 * Out of scope for this slice: pressure for the other 6 institutions.
 * Bonehowl Syndicate is canon-locked but its hooks are in hunting
 * contracts (not the War Exchange), and the other five are
 * `canonSource: "game-specific"` and need a canon pass before they get
 * load-bearing economic verbs. Vishrava is the strongest single hook
 * canon offers today, and shipping it first proves the architecture.
 */

import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";

/** Always-on baseline tithe rate the Ledger charges on every War Exchange buy. */
export const VISHRAVA_LEDGER_BUY_TITHE_BASE = 1.02;
/** Heaviest tithe rate — applied when the buyer is aligned with the Ledger's parent empire. */
export const VISHRAVA_LEDGER_BUY_TITHE_PURE = 1.04;
/** Softest tithe rate — outsiders (Bio / Mecha) get a small discount on the abacus pass-through. */
export const VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER = 1.01;

/** Always-on baseline interest rate the Ledger pays on every War Exchange sell. */
export const VISHRAVA_LEDGER_SELL_INTEREST_BASE = 1.03;
/** Strongest interest rate — paid to Pure-aligned operatives whose patience funds the Ledger. */
export const VISHRAVA_LEDGER_SELL_INTEREST_PURE = 1.05;
/** Softest interest rate — outsiders still get a courtesy bump for using the Golden Bazaar. */
export const VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER = 1.02;

/**
 * Buy-side multiplier the Vishrava Ledger applies to every War Exchange
 * purchase. Composes multiplicatively with stall arrears + war-front
 * demand multipliers in `marketActions.applyMarketBuy`.
 */
export function getVishravaLedgerBuyMultiplier(
  player: Pick<PlayerState, "factionAlignment">,
): number {
  return getVishravaLedgerBuyMultiplierForFaction(player.factionAlignment);
}

export function getVishravaLedgerBuyMultiplierForFaction(
  faction: FactionAlignment,
): number {
  if (faction === "pure") return VISHRAVA_LEDGER_BUY_TITHE_PURE;
  if (faction === "bio" || faction === "mecha") {
    return VISHRAVA_LEDGER_BUY_TITHE_OUTSIDER;
  }
  return VISHRAVA_LEDGER_BUY_TITHE_BASE;
}

/**
 * Sell-side multiplier the Vishrava Ledger applies to every War Exchange
 * sell quote. Stacks before the broker tithe in
 * `marketActions.quoteSellPriceCredits`.
 */
export function getVishravaLedgerSellMultiplier(
  player: Pick<PlayerState, "factionAlignment">,
): number {
  return getVishravaLedgerSellMultiplierForFaction(player.factionAlignment);
}

export function getVishravaLedgerSellMultiplierForFaction(
  faction: FactionAlignment,
): number {
  if (faction === "pure") return VISHRAVA_LEDGER_SELL_INTEREST_PURE;
  if (faction === "bio" || faction === "mecha") {
    return VISHRAVA_LEDGER_SELL_INTEREST_OUTSIDER;
  }
  return VISHRAVA_LEDGER_SELL_INTEREST_BASE;
}

export type VishravaLedgerPressureCopy = {
  headline: string;
  detail: string;
  buyMult: number;
  sellMult: number;
  /** True when the player's alignment makes the pressure worth surfacing. */
  loadBearing: boolean;
};

/**
 * Build a one-line UI callout describing the current Vishrava Ledger
 * pressure. The headline / detail strings are stable per faction so the
 * War Exchange can display them as a chip + tooltip.
 */
export function getVishravaLedgerPressureCopy(
  player: Pick<PlayerState, "factionAlignment">,
): VishravaLedgerPressureCopy {
  const buyMult = getVishravaLedgerBuyMultiplier(player);
  const sellMult = getVishravaLedgerSellMultiplier(player);
  const buyPct = Math.round((buyMult - 1) * 100);
  const sellPct = Math.round((sellMult - 1) * 100);

  if (player.factionAlignment === "pure") {
    return {
      headline: "Vishrava Ledger pressure — Pure ledger seat",
      detail:
        `Your own institution. Buys pay +${buyPct}% abacus tithe; sells earn +${sellPct}% patience interest. The Ledger is harshest and most generous to its own seat.`,
      buyMult,
      sellMult,
      loadBearing: true,
    };
  }
  if (player.factionAlignment === "unbound") {
    return {
      headline: "Vishrava Ledger pressure — neutral pass",
      detail:
        `The Golden Bazaar abacuses still tax every trade. Buys +${buyPct}%, sells +${sellPct}% (baseline rates for unbound operatives).`,
      buyMult,
      sellMult,
      loadBearing: true,
    };
  }
  return {
    headline: "Vishrava Ledger pressure — outsider rate",
    detail:
      `Bio and Mecha buyers route through the same abacuses on softer terms. Buys +${buyPct}%, sells +${sellPct}% — the Ledger keeps every door open.`,
    buyMult,
    sellMult,
    loadBearing: true,
  };
}
