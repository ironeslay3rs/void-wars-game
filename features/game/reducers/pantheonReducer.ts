import type { GameAction, GameState } from "@/features/game/gameTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { isPlayerAlignedPantheon } from "@/features/pantheons/pantheonReward";
import type { PantheonId } from "@/features/pantheons/pantheonTypes";
import { PANTHEONS } from "@/features/pantheons/pantheonData";

/**
 * Pantheon reducer — handles the visit-blessing token.
 *
 * - `GRANT_PANTHEON_BLESSING` — only fires when the requested pantheon
 *   matches the player's affinity school's pantheon. Otherwise no-op.
 *   Idempotent: re-granting while the flag is already true is also a
 *   no-op (one blessing slot at a time).
 * - `CLEAR_PANTHEON_BLESSING` — explicit clear (used by the mission
 *   settle pipeline after the bonus is applied; also exposed for tests).
 */
export function handlePantheonAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "GRANT_PANTHEON_BLESSING": {
      const { pantheonId } = action.payload;
      // Validate pantheon id is canonical.
      if (!(pantheonId in PANTHEONS)) return state;
      // Validate pantheon belongs to player's aligned school.
      if (!isPlayerAlignedPantheon(state.player, pantheonId as PantheonId)) {
        return state;
      }
      // Already pending — no-op (one slot at a time).
      if (state.player.pantheonBlessingPending) return state;
      return {
        ...state,
        player: {
          ...state.player,
          pantheonBlessingPending: true,
        },
      };
    }

    case "CLEAR_PANTHEON_BLESSING": {
      if (!state.player.pantheonBlessingPending) return state;
      return {
        ...state,
        player: {
          ...state.player,
          pantheonBlessingPending: false,
        },
      };
    }

    default:
      return null;
  }
}
