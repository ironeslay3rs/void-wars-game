import { clamp } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import {
  VENT_MANA_COST,
  VENT_MANA_INSTABILITY_RELIEF,
} from "@/features/mana/manaTypes";

/**
 * Mana reducer — handles all mana-axis actions:
 *
 * - `MANA_GAIN` / `MANA_SPEND` — additive deltas, clamped to [0, manaMax].
 * - `MANA_RESTORE_FULL` — fill to cap (Feast Hall finishers / future relics).
 * - `VENT_MANA_TO_VOID_INSTABILITY` — the canonical mana ↔ void exchange.
 *   Spends `VENT_MANA_COST` mana, reduces void instability by
 *   `VENT_MANA_INSTABILITY_RELIEF`. Fail-soft: returns the same state if the
 *   player can't afford the cost or instability is already 0.
 * - `SET_MANA_MAX` — progression-tuning hook (future rank gates).
 *
 * Mana is the positive-pressure axis opposite `voidInstability`. The vent
 * action is the only spend in the foundation slice; combat / mastery hooks
 * arrive in M3+.
 */
export function handleManaAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "MANA_GAIN": {
      const amount = Math.max(0, Math.floor(action.payload.amount));
      if (amount === 0) return state;
      const next = clamp(state.player.mana + amount, 0, state.player.manaMax);
      if (next === state.player.mana) return state;
      return {
        ...state,
        player: { ...state.player, mana: next },
      };
    }

    case "MANA_SPEND": {
      const amount = Math.max(0, Math.floor(action.payload.amount));
      if (amount === 0) return state;
      if (state.player.mana < amount) return state;
      return {
        ...state,
        player: {
          ...state.player,
          mana: clamp(state.player.mana - amount, 0, state.player.manaMax),
        },
      };
    }

    case "MANA_RESTORE_FULL": {
      if (state.player.mana >= state.player.manaMax) return state;
      return {
        ...state,
        player: { ...state.player, mana: state.player.manaMax },
      };
    }

    case "VENT_MANA_TO_VOID_INSTABILITY": {
      if (state.player.mana < VENT_MANA_COST) return state;
      if (state.player.voidInstability <= 0) return state;
      return {
        ...state,
        player: {
          ...state.player,
          mana: state.player.mana - VENT_MANA_COST,
          voidInstability: clamp(
            state.player.voidInstability - VENT_MANA_INSTABILITY_RELIEF,
            0,
            100,
          ),
        },
      };
    }

    case "SET_MANA_MAX": {
      const max = Math.max(1, Math.floor(action.payload.max));
      if (max === state.player.manaMax) return state;
      return {
        ...state,
        player: {
          ...state.player,
          manaMax: max,
          mana: Math.min(state.player.mana, max),
        },
      };
    }

    default:
      return null;
  }
}
