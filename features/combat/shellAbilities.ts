/**
 * Shell combat abilities — first foundation slice for the M3 combat
 * engine integration with the mana axis.
 *
 * The realtime shell combat system in `features/void-maps/realtime/`
 * is in active development. This module ships the ABILITY DATA LAYER
 * + a buff state slice so the combat engine has somewhere to pull
 * from when M3 wires the actual damage math. Foundation only — no
 * combat hookup yet, no UI buttons.
 *
 * Surge is the first ability:
 *   - Cost: 15 mana
 *   - Effect: the player's next shell hit lands at +50% damage
 *   - Duration: 8 seconds (expires whether or not the hit landed)
 *   - Affinity: assault loadout (body-forward kits gain the most)
 *
 * The buff state lives on PlayerState as `activeShellBuffs` so future
 * realtime combat code can read it via a selector. Buffs are pruned
 * lazily by `pruneExpiredShellBuffs(buffs, nowMs)` — no background tick
 * needed.
 */

import type { FieldLoadoutProfile } from "@/features/game/gameTypes";

export type ShellAbilityId = "surge";

export type ShellAbilityDefinition = {
  id: ShellAbilityId;
  name: string;
  manaCost: number;
  /** How long the granted buff sits on the player after activation. */
  durationMs: number;
  /** Loadout this ability synergizes with most strongly. Future combat
   *  math can apply a per-loadout damage scalar; foundation slice just
   *  records the affinity for UI hints. */
  loadoutAffinity: FieldLoadoutProfile;
  /** Short player-facing tooltip. */
  description: string;
  /** Long-form lore beat for the ability detail panel. */
  longForm: string;
};

export const SURGE_DAMAGE_BONUS_PCT = 50;
export const SURGE_DURATION_MS = 8_000;

export const SHELL_ABILITIES: Record<ShellAbilityId, ShellAbilityDefinition> = {
  surge: {
    id: "surge",
    name: "Surge",
    manaCost: 15,
    durationMs: SURGE_DURATION_MS,
    loadoutAffinity: "assault",
    description: `Your next shell hit lands at +${SURGE_DAMAGE_BONUS_PCT}% damage. ${SURGE_DURATION_MS / 1000}s buff window.`,
    longForm:
      "Surge channels the operative's positive-pressure pool through " +
      "the shell's primary muscle bundles for one decisive strike. The " +
      "Bonehowl call it the wolf-leap; the Pharos call it the line-of-" +
      "sight commit. By any name, Surge is the answer to a window that " +
      "won't open twice.",
  },
};

export function getShellAbility(id: ShellAbilityId): ShellAbilityDefinition {
  return SHELL_ABILITIES[id];
}

/**
 * Active buff slot. Stored on PlayerState as `activeShellBuffs`. Future
 * combat code reads this to apply the damage scalar to the next hit.
 */
export type ShellBuff = {
  abilityId: ShellAbilityId;
  /** ms epoch — buff is active until this timestamp. */
  expiresAt: number;
  /** Snapshot of the granted bonus pct so combat math is stable across
   *  ability data tweaks. */
  damageBonusPct: number;
};

/**
 * Drop expired buffs. Called by selectors and the activate reducer to
 * keep the array tight (no background tick required).
 */
export function pruneExpiredShellBuffs(
  buffs: ShellBuff[],
  nowMs: number,
): ShellBuff[] {
  return buffs.filter((b) => b.expiresAt > nowMs);
}

/**
 * Total damage bonus pct from all active surge-style buffs at `nowMs`.
 * Returns 0 when no active buffs grant a damage bonus. Future combat
 * math can call this once per shell hit to compute the scalar.
 */
export function getActiveShellDamageBonusPct(
  buffs: ShellBuff[],
  nowMs: number,
): number {
  return pruneExpiredShellBuffs(buffs, nowMs).reduce(
    (acc, b) => acc + b.damageBonusPct,
    0,
  );
}
