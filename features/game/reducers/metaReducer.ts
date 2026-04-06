import { initialGameState } from "@/features/game/initialGameState";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";

export function handleMetaAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "RESET_GAME":
      return initialGameState;

    default:
      return null;
  }
}
