/**
 * Mana selectors — read-only helpers for UI and reducers.
 *
 * The game-side display name is school-flavored to match canon currency
 * vocabulary (Bio → Ichor, Pure → Soul / Will, Mecha → Charge). Unbound
 * players see the universal "Mana" label until they pick a faction.
 */

import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import type { ManaDisplayConfig } from "@/features/mana/manaTypes";

const MANA_DISPLAY_BY_FACTION: Record<FactionAlignment, ManaDisplayConfig> = {
  unbound: {
    faction: "unbound",
    longName: "Mana",
    shortName: "Mana",
    spendVerb: "Vent Mana",
  },
  bio: {
    faction: "bio",
    longName: "Ichor Flow",
    shortName: "Ichor",
    spendVerb: "Vent Ichor",
  },
  mecha: {
    faction: "mecha",
    longName: "Charge Stack",
    shortName: "Charge",
    spendVerb: "Vent Charge",
  },
  pure: {
    faction: "pure",
    longName: "Will Reservoir",
    shortName: "Will",
    spendVerb: "Vent Will",
  },
};

export function getManaDisplay(faction: FactionAlignment): ManaDisplayConfig {
  return MANA_DISPLAY_BY_FACTION[faction];
}

export function getManaPercent(player: PlayerState): number {
  if (player.manaMax <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((player.mana / player.manaMax) * 100)));
}

export function canSpendMana(player: PlayerState, amount: number): boolean {
  return player.mana >= Math.max(0, Math.floor(amount));
}
