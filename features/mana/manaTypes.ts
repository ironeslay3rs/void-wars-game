/**
 * Mana — the canonical positive-pressure resource.
 *
 * Per `lore-canon/01 Master Canon/Mana/Mana System.md`, mana is "tied to law,
 * memory, power, adaptation, and the deeper structure of reality." Canon
 * names the resource and its philosophy but leaves the mechanics open: how
 * regen works, what caps look like, and whether each school draws it
 * differently are all unanswered questions in the master canon hub.
 *
 * The current game-side implementation is a foundation slice:
 *   - One universal pool: `mana` / `manaMax` on PlayerState.
 *   - Earned passively from mission settlements + Feast Hall services.
 *   - Spent via the `VENT_MANA_TO_VOID_INSTABILITY` action — the canonical
 *     "positive pressure burns negative pressure" exchange that plays the
 *     mana ↔ void instability axis explicit.
 *   - School-flavored display name (Bio: "Ichor Flow", Mecha: "Charge
 *     Stack", Pure: "Will Reservoir", Unbound: "Mana") so the same number
 *     reads as the player's chosen empire's vocabulary.
 *
 * No combat or mastery hookup yet — those are M3/M4 work. Foundation only.
 */

import type { FactionAlignment } from "@/features/game/gameTypes";

export type ManaDisplayConfig = {
  faction: FactionAlignment;
  /** Long-form display name (e.g. "Ichor Flow"). */
  longName: string;
  /** Short label for tight chips (e.g. "Ichor"). */
  shortName: string;
  /** Verb used for spend buttons ("Vent Ichor"). */
  spendVerb: string;
};

/**
 * Vent costs / yields. Defined in one place so the reducer, the test, and
 * the UI all reference the same constants.
 */
export const VENT_MANA_COST = 20;
export const VENT_MANA_INSTABILITY_RELIEF = 10;

/** Foundation slice — passive mana grants on bookkeeping events. */
export const MANA_PER_MISSION_SETTLEMENT = 5;
export const MANA_PER_HUNTING_GROUND_SETTLEMENT = 7;
export const MANA_PER_FEAST_HALL_OFFER = 8;

/**
 * Deepening slice — directed spends. Each is an atomic mana → benefit
 * exchange that the reducer guards both ends of (afford check + cap check).
 *
 * - Mastery burn: pours mana into rune-school memory. Smaller bump than
 *   a real install but always available.
 * - Condition burn: a "self-stabilization" rite that turns positive
 *   pressure into recovered condition without going through the citadel.
 * - Hunger burn: distilled tribute, paid out of personal reserves.
 *
 * These three plus the existing void-instability vent give mana 4 total
 * spend surfaces — enough that the resource feels load-bearing, not just
 * decorative.
 */
export const MANA_BURN_MASTERY_COST = 15;
export const MANA_BURN_MASTERY_GAIN = 5;

export const MANA_BURN_CONDITION_COST = 20;
export const MANA_BURN_CONDITION_GAIN = 8;

export const MANA_BURN_HUNGER_COST = 15;
export const MANA_BURN_HUNGER_GAIN = 12;
