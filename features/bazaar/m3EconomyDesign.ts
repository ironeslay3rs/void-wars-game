/**
 * M3 — Crafting economy design (canon-safe framing, implementation map)
 *
 * Goal: **economy becomes real** — every meaningful sink and faucet goes through
 * typed resources, explicit recipe lines, or the commodity desk (not hidden UI math).
 *
 * ## Resource tiers (saved on `PlayerState.resources`)
 *
 * - **Tier A — “five active” HUD strip:** `credits` + `scrapAlloy`, `emberCore`,
 *   `runeDust`, `bioSamples`. Credits settle market buys; the four materials trade
 *   on the Void Market desk (`VOID_MARKET_TRADE`).
 * - **Tier B — field & district utility:** `ironOre`, `mossRations`. Not listed on
 *   the commodity desk; ore refines to scrap in Crafting District; rations come from
 *   the Moss Binder recipe.
 * - **Tier C — boss-only phase‑2 named:** `coilboundLattice`, `ashSynodRelic`,
 *   `vaultLatticeShard`. Dropped from void bosses only; **recipes** sink them in
 *   Crafting District (refines → Tier A/B stock).
 *
 * ## Closed loops
 *
 * 1. **Acquire:** void field pickups, hunt settlement, missions, exploration — all
 *    credit `ADD_RESOURCE` / partial reward bags.
 * 2. **Convert:** district recipes — inputs → outputs (`gameActions` + UI spend
 *    guards). Costs use `getDistrictCraftingCost` (Crafting focus + profession tier).
 * 3. **Exchange:** Void Market — taxed **buy**, listing-fee **sell**; Gathering focus
 *    raises sell **gross** before fees (`quoteVoidMarketSell`).
 * 4. **Navigate:** Bazaar hub → Void Market or Black Market map; **Greed / Golden
 *    Bazaar** hits the same commodity desk route as the legal exchange counterpart.
 *
 * ## Profession value (no extra save fields in M3 slice)
 *
 * - **Gathering:** field loot multiplier + better void market sell quotes.
 * - **Crafting:** district material discounts via depth/sigil-derived **profession tier**
 *   (`craftingProfession.ts`).
 * - **Combat:** shell drill modifier (outside economy module).
 *
 * ## Contracts
 *
 * Mission queue and hunt results remain the **pressure spine**; market and crafting
 * are sinks and fluidity layers on top of the same `ResourcesState`.
 *
 * @module
 */

export const M3_ECONOMY_SCHEMA_REVISION = 1 as const;

/** Legal commodity desk (also linked from Black Market Golden Bazaar). */
export const M3_VOID_MARKET_ROUTE = "/bazaar/void-market";

export const M3_CRAFTING_DISTRICT_ROUTE = "/bazaar/crafting-district";

export const M3_BLACK_MARKET_ROUTE = "/bazaar/black-market";
