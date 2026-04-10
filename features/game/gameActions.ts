import type { GameAction, GameState } from "@/features/game/gameTypes";
import { deriveActiveRuns } from "@/features/game/lib/runPressure";
import { handleEconomyAction } from "@/features/game/reducers/economyReducer";
import { handleHydrationAction } from "@/features/game/reducers/hydrationReducer";
import { handleManaAction } from "@/features/game/reducers/manaReducer";
import { handleMetaAction } from "@/features/game/reducers/metaReducer";
import { handleMissionAction } from "@/features/game/reducers/missionReducer";
import { handlePantheonAction } from "@/features/game/reducers/pantheonReducer";
import { handlePlayerIdentityAction } from "@/features/game/reducers/playerIdentityReducer";
import { handleProgressionAction } from "@/features/game/reducers/progressionReducer";
import { handleSocialAction } from "@/features/game/reducers/socialReducer";
import { handleSurvivalAction } from "@/features/game/reducers/survivalReducer";
import { handleVoidPressureAction } from "@/features/game/reducers/voidPressureReducer";

/** Order matters: first handler that returns non-null wins. Add new actions in exactly one domain reducer. */
const reducerHandlers = [
  handleHydrationAction,
  handlePlayerIdentityAction,
  handleSurvivalAction,
  handleEconomyAction,
  handleProgressionAction,
  handleVoidPressureAction,
  handleManaAction,
  handlePantheonAction,
  handleSocialAction,
  handleMissionAction,
  handleMetaAction,
] as const;

function withDerivedActiveRuns(state: GameState): GameState {
  const activeRuns = deriveActiveRuns(state.player);
  return {
    ...state,
    player: { ...state.player, activeRuns },
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  for (const handleAction of reducerHandlers) {
    const nextState = handleAction(state, action);
    if (nextState !== null) {
      return withDerivedActiveRuns(nextState);
    }
  }

  return withDerivedActiveRuns(state);
}
