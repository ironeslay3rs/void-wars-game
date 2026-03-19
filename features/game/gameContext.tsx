"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import { loadGameState, saveGameState } from "@/features/game/gameStorage";
import type {
  FactionAlignment,
  GameAction,
  GameState,
} from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  selectPath: (path: PathSelection) => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    const savedState = loadGameState();

    if (savedState) {
      dispatch({
        type: "HYDRATE_STATE",
        payload: savedState,
      });
    }

    setHasHydratedFromStorage(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;

    dispatch({
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: Date.now() },
    });
  }, [hasHydratedFromStorage]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    saveGameState(state);
  }, [state, hasHydratedFromStorage]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;

    const interval = window.setInterval(() => {
      dispatch({
        type: "PROCESS_MISSION_QUEUE",
        payload: { now: Date.now() },
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasHydratedFromStorage]);

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

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}