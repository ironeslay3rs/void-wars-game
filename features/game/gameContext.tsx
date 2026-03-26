"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/useAuth";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import {
  clearGameState,
  loadGameState,
  saveGameState,
} from "@/features/game/gameStorage";
import {
  loadRemoteGameState,
  saveRemoteGameState,
} from "@/features/save/remoteGameState";
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

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const clearPendingRemoteSave = useCallback(() => {
    if (pendingSaveTimeoutRef.current !== null) {
      window.clearTimeout(pendingSaveTimeoutRef.current);
      pendingSaveTimeoutRef.current = null;
    }
  }, []);

  const persistRemoteSaveNow = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      status !== "authenticated" ||
      !user ||
      !session ||
      !hasHydratedForUser ||
      hydratedUserId !== user.id
    ) {
      return;
    }

    clearPendingRemoteSave();

    await saveRemoteGameState({
      userId: user.id,
      accessToken: session.accessToken,
      gameState: latestStateRef.current,
    });
  }, [
    clearPendingRemoteSave,
    hasHydratedForUser,
    hydratedUserId,
    session,
    status,
    user,
  ]);

  useEffect(() => {
    setBeforeLogoutHandler(persistRemoteSaveNow);

    return () => {
      setBeforeLogoutHandler(null);
    };
  }, [persistRemoteSaveNow, setBeforeLogoutHandler]);

  useEffect(() => {
    clearPendingRemoteSave();

    if (status !== "authenticated" || !user || !session) {
      return;
    }

    const authenticatedUser = user;
    const authenticatedSession = session;

    let isCancelled = false;

    async function hydrateGameState() {
      setHasHydratedForUser(false);
      setHydratedUserId(null);

      let nextState: GameState = {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          lastConditionTickAt: Date.now(),
        },
      };

      try {
        const remoteState = await loadRemoteGameState(
          authenticatedUser.id,
          authenticatedSession.accessToken,
        );

        if (remoteState) {
          nextState = remoteState;
        } else {
          clearGameState(authenticatedUser.id);
        }
      } catch {
        const cachedState = loadGameState(authenticatedUser.id);

        if (cachedState) {
          nextState = cachedState;
        }
      }

      if (isCancelled) {
        return;
      }

      skipNextRemoteSaveRef.current = true;
      dispatch({
        type: "HYDRATE_STATE",
        payload: nextState,
      });
      setHydratedUserId(authenticatedUser.id);
      setHasHydratedForUser(true);
    }

    void hydrateGameState();

    return () => {
      isCancelled = true;
    };
  }, [clearPendingRemoteSave, session, status, user]);

  useEffect(() => {
    if (!hasHydratedForUser) return;

    dispatch({
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: Date.now() },
    });
  }, [hasHydratedForUser]);

  useEffect(() => {
    if (
      !hasHydratedForUser ||
      status !== "authenticated" ||
      !user ||
      hydratedUserId !== user.id
    ) {
      return;
    }

    saveGameState(user.id, state);

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    clearPendingRemoteSave();

    pendingSaveTimeoutRef.current = window.setTimeout(() => {
      void persistRemoteSaveNow();
    }, 1000);

    return () => {
      clearPendingRemoteSave();
    };
  }, [
    clearPendingRemoteSave,
    hasHydratedForUser,
    hydratedUserId,
    persistRemoteSaveNow,
    state,
    status,
    user,
  ]);

  useEffect(() => {
    if (!hasHydratedForUser) return;

    const interval = window.setInterval(() => {
      dispatch({
        type: "PROCESS_MISSION_QUEUE",
        payload: { now: Date.now() },
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasHydratedForUser]);

  useEffect(() => {
    if (!hasHydratedForUser) return;

    const syncMissionQueue = () => {
      dispatch({
        type: "PROCESS_MISSION_QUEUE",
        payload: { now: Date.now() },
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncMissionQueue();
      }
    };

    window.addEventListener("focus", syncMissionQueue);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncMissionQueue);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasHydratedForUser]);

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
        {children}
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
