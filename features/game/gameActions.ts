import type { GameAction, GameState } from "@/features/game/gameTypes";
import { handleEconomyAction } from "@/features/game/reducers/economyReducer";
import { handleHydrationAction } from "@/features/game/reducers/hydrationReducer";
import { handleMetaAction } from "@/features/game/reducers/metaReducer";
import { handleMissionAction } from "@/features/game/reducers/missionReducer";
import { handlePlayerIdentityAction } from "@/features/game/reducers/playerIdentityReducer";
import { handleProgressionAction } from "@/features/game/reducers/progressionReducer";
import { handleSocialAction } from "@/features/game/reducers/socialReducer";
import { handleSurvivalAction } from "@/features/game/reducers/survivalReducer";
import { handleVoidPressureAction } from "@/features/game/reducers/voidPressureReducer";

const reducerHandlers = [
  handleHydrationAction,
  handlePlayerIdentityAction,
  handleSurvivalAction,
  handleEconomyAction,
  handleProgressionAction,
  handleVoidPressureAction,
  handleSocialAction,
  handleMissionAction,
  handleMetaAction,
] as const;

export function gameReducer(state: GameState, action: GameAction): GameState {
  for (const handleAction of reducerHandlers) {
    const nextState = handleAction(state, action);
    if (nextState !== null) {
      return nextState;
    }
  }

  return state;
}
