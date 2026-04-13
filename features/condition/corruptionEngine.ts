/**
 * Corruption Engine — pure accumulation logic for void exposure.
 *
 * Canon anchors:
 *   - lore-canon/01 Master Canon/World Laws/The Void.md — the Void is a
 *     prison-realm that forces adaptation; exposure taxes flesh and soul.
 *   - lore-canon/01 Master Canon/Mana/Mana System.md — mana is the opposing
 *     positive-pressure resource; vents/cleansing trade mana for corruption
 *     relief.
 *   - lore-canon/CLAUDE.md — Three Capacities (Blood / Frame / Resonance).
 *
 * Game adaptation:
 *   - `PlayerState.voidInstability` (0–100) IS the player's current
 *     corruption load. We don't add a new field — we expose pure helpers
 *     to accumulate exposure from game events and to read the load back
 *     as a normalized "corruption pct".
 *   - All functions here are pure. Reducers/consumers apply the result.
 *
 * Scale note:
 *   The field is clamped [0, MAX_CORRUPTION = 100]. "Corruption pct" is the
 *   raw value — no remap — so a threshold of 70 means voidInstability ≥ 70.
 */

import type { PlayerState } from "@/features/game/gameTypes";

// ────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────

export const MAX_CORRUPTION = 100;
export const MIN_CORRUPTION = 0;

/**
 * Named exposure sources. Keep this list explicit so consumers cannot
 * invent untuned events. Magnitudes are canonical per-event budgets, not
 * per-second rates.
 */
export type VoidExposureSource =
  | "field_tile_void" // each void tile step in the field
  | "boss_slain" // boss fight lingering corruption
  | "realtime_raid_tick" // per-tick while inside a realtime raid
  | "contract_settle_failed" // failing a void contract
  | "crafting_misfire" // crafting failure while already corrupted
  | "mismatch_install" // installing an off-school rune (hybrid tax)
  | "black_market_fence" // fencing stolen/void-tainted goods
  | "ambient_decay"; // decay tick from offline lifecycle

const EXPOSURE_TABLE: Record<VoidExposureSource, number> = {
  field_tile_void: 0.5,
  boss_slain: 4,
  realtime_raid_tick: 0.25,
  contract_settle_failed: 6,
  crafting_misfire: 3,
  mismatch_install: 2,
  black_market_fence: 1,
  ambient_decay: 0.1,
};

// ────────────────────────────────────────────────────────────────────
// Pure accumulation
// ────────────────────────────────────────────────────────────────────

export type CorruptionDelta = {
  /** Raw unclamped delta (can be negative for vents/cleansing). */
  delta: number;
  /** Resulting corruption after clamp. */
  nextCorruption: number;
  source: VoidExposureSource | "vent" | "cleanse" | "manual";
};

export function clampCorruption(v: number): number {
  if (!Number.isFinite(v)) return MIN_CORRUPTION;
  if (v < MIN_CORRUPTION) return MIN_CORRUPTION;
  if (v > MAX_CORRUPTION) return MAX_CORRUPTION;
  return v;
}

/** Read the current corruption load as a normalized 0–100 pct. */
export function getCorruptionPct(player: Pick<PlayerState, "voidInstability">): number {
  return clampCorruption(player.voidInstability);
}

/**
 * Apply a void-exposure event and return the new corruption pct + delta.
 * Pure — does not mutate the player. Reducers fold the result.
 */
export function applyVoidExposure(
  player: Pick<PlayerState, "voidInstability">,
  source: VoidExposureSource,
  count: number = 1,
): CorruptionDelta {
  const magnitude = EXPOSURE_TABLE[source] * Math.max(0, count);
  const next = clampCorruption(player.voidInstability + magnitude);
  return {
    delta: next - player.voidInstability,
    nextCorruption: next,
    source,
  };
}

/**
 * Vent corruption by spending mana. Returns the delta (negative) plus the
 * mana actually consumed. Pure — caller applies both sides.
 *
 * Canon: mana→void vent is the positive-pressure release valve. Rate
 * mirrors the Status screen's existing vent, kept local so consumers don't
 * need to cross-import the status feature.
 */
export function ventCorruptionWithMana(
  player: Pick<PlayerState, "voidInstability" | "mana">,
  manaToSpend: number,
): { delta: CorruptionDelta; manaSpent: number } {
  const mana = Math.max(0, Math.min(player.mana, Math.floor(manaToSpend)));
  // 1 mana relieves 2 corruption at the baseline vent rate.
  const relief = mana * 2;
  const next = clampCorruption(player.voidInstability - relief);
  return {
    delta: {
      delta: next - player.voidInstability,
      nextCorruption: next,
      source: "vent",
    },
    manaSpent: mana,
  };
}

/**
 * Pure cleanse (hub services, Feast Hall sanctums). Reduces corruption by
 * a fixed amount; no resource cost expressed here — callers gate.
 */
export function cleanseCorruption(
  player: Pick<PlayerState, "voidInstability">,
  amount: number,
): CorruptionDelta {
  const next = clampCorruption(player.voidInstability - Math.max(0, amount));
  return {
    delta: next - player.voidInstability,
    nextCorruption: next,
    source: "cleanse",
  };
}

/** Raw budget lookup — exposed so UI previews can show "+X from event". */
export function exposureBudget(source: VoidExposureSource): number {
  return EXPOSURE_TABLE[source];
}
