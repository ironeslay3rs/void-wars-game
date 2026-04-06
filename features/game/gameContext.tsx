"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/useAuth";
import { gameReducer } from "@/features/game/gameActions";
import { GameOnboardingRouteGuard } from "@/features/game/components/GameOnboardingRouteGuard";
import { useGameHydration } from "@/features/game/hooks/useGameHydration";
import { useGamePersistence } from "@/features/game/hooks/useGamePersistence";
import { useMissionQueueProcessor } from "@/features/game/hooks/useMissionQueueProcessor";
import { initialGameState } from "@/features/game/initialGameState";
import type {
  FactionAlignment,
  GameAction,
  GameState,
} from "@/features/game/gameTypes";
import { VoidRealtimeBridge } from "@/features/void-maps/realtime/VoidRealtimeBridge";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  selectPath: (path: PathSelection) => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { status, user, session, setBeforeLogoutHandler } = useAuth();
  const [hasHydratedForUser, setHasHydratedForUser] = useState(false);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const pendingSaveTimeoutRef = useRef<number | null>(null);
  const latestStateRef = useRef(state);
  const skipNextRemoteSaveRef = useRef(false);

  const clearPendingRemoteSave = useCallback(() => {
    if (pendingSaveTimeoutRef.current !== null) {
      window.clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }
  }, []);

  useGameHydration({
    status,
    user,
    session,
    dispatch,
    clearPendingRemoteSave,
    hasHydratedForUser,
    hydratedUserId,
    setHasHydratedForUser,
    setHydratedUserId,
    skipNextRemoteSaveRef,
  });

  useGamePersistence({
    state,
    status,
    user,
    session,
    hasHydratedForUser,
    hydratedUserId,
    setBeforeLogoutHandler,
    pendingSaveTimeoutRef,
    latestStateRef,
    skipNextRemoteSaveRef,
    clearPendingRemoteSave,
  });

  useMissionQueueProcessor(dispatch, hasHydratedForUser);

  const selectPath = useCallback((path: PathSelection) => {
    dispatch({
      type: "SET_FACTION_ALIGNMENT",
      payload: path,
    });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      selectPath,
      resetGame,
    }),
    [state, selectPath, resetGame],
  );

  if (status === "authenticated" && !hasHydratedForUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/70">
        Syncing wasteland record...
      </div>
    );
  }

  return (
    <GameContext.Provider value={value}>
      <VoidRealtimeBridge state={state} dispatch={dispatch}>
        <GameOnboardingRouteGuard
          characterCreated={state.player.characterCreated}
        >
          {children}
        </GameOnboardingRouteGuard>
      </VoidRealtimeBridge>
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}
