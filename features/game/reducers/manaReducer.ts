import {
  getShellAbility,
  pruneExpiredShellBuffs,
  SURGE_DAMAGE_BONUS_PCT,
} from "@/features/combat/shellAbilities";
import { clamp } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import {
  MANA_BURN_CONDITION_COST,
  MANA_BURN_CONDITION_GAIN,
  MANA_BURN_HUNGER_COST,
  MANA_BURN_HUNGER_GAIN,
  MANA_BURN_MASTERY_COST,
  MANA_BURN_MASTERY_GAIN,
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

    case "MANA_BURN_FOR_MASTERY": {
      if (state.player.mana < MANA_BURN_MASTERY_COST) return state;
      if (state.player.masteryProgress >= 100) return state;
      return {
        ...state,
        player: {
          ...state.player,
          mana: state.player.mana - MANA_BURN_MASTERY_COST,
          masteryProgress: clamp(
            state.player.masteryProgress + MANA_BURN_MASTERY_GAIN,
            0,
            100,
          ),
        },
      };
    }

    case "MANA_BURN_FOR_CONDITION": {
      if (state.player.mana < MANA_BURN_CONDITION_COST) return state;
      if (state.player.condition >= 100) return state;
      return {
        ...state,
        player: {
          ...state.player,
          mana: state.player.mana - MANA_BURN_CONDITION_COST,
          condition: clamp(
            state.player.condition + MANA_BURN_CONDITION_GAIN,
            0,
            100,
          ),
        },
      };
    }

    case "MANA_BURN_FOR_HUNGER": {
      if (state.player.mana < MANA_BURN_HUNGER_COST) return state;
      if (state.player.hunger >= 100) return state;
      return {
        ...state,
        player: {
          ...state.player,
          mana: state.player.mana - MANA_BURN_HUNGER_COST,
          hunger: clamp(
            state.player.hunger + MANA_BURN_HUNGER_GAIN,
            0,
            100,
          ),
        },
      };
    }

    case "ACTIVATE_SHELL_ABILITY": {
      const ability = getShellAbility(action.payload.abilityId);
      if (!ability) return state;
      if (state.player.mana < ability.manaCost) return state;
      const nowMs = action.payload.nowMs ?? Date.now();
      const pruned = pruneExpiredShellBuffs(
        state.player.activeShellBuffs ?? [],
        nowMs,
      );
      // One stack per ability type — re-activating refreshes the
      // expiry rather than stacking multiple buffs of the same id.
      const filtered = pruned.filter((b) => b.abilityId !== ability.id);
      return {
        ...state,
        player: {
          ...state.player,
          mana: state.player.mana - ability.manaCost,
          activeShellBuffs: [
            ...filtered,
            {
              abilityId: ability.id,
              expiresAt: nowMs + ability.durationMs,
              damageBonusPct: SURGE_DAMAGE_BONUS_PCT,
            },
          ],
        },
      };
    }

    default:
      return null;
  }
}
