"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { completeMission, selectPath, startMission } from "./gameActions";
import { initialGameState } from "./initialGameState";
import { clearGameState, loadGameState, saveGameState } from "./gameStorage";
import { PathType, PlayerState } from "./gameTypes";

type GameAction =
  | { type: "SELECT_PATH"; payload: PathType }
  | { type: "START_MISSION"; payload: string }
  | { type: "COMPLETE_MISSION"; payload: string }
  | { type: "LOAD_STATE"; payload: PlayerState }
  | { type: "RESET_GAME" };

type GameContextValue = {
  state: PlayerState;
  resetGame: () => void;
  selectPath: (path: PathType) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

function reducer(state: PlayerState, action: GameAction): PlayerState {
  switch (action.type) {
    case "SELECT_PATH":
      return selectPath(state, action.payload);
    case "START_MISSION":
      return startMission(state, action.payload);
    case "COMPLETE_MISSION":
      return completeMission(state, action.payload);
    case "LOAD_STATE":
      return action.payload;
    case "RESET_GAME":
      return initialGameState;
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialGameState);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const savedState = loadGameState();

    if (savedState) {
      dispatch({ type: "LOAD_STATE", payload: savedState });
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;

    saveGameState(state);
  }, [state, hasLoadedStorage]);

  const value = useMemo(
    () => ({
      state,
      resetGame: () => {
        clearGameState();
        dispatch({ type: "RESET_GAME" });
      },
      selectPath: (path: PathType) =>
        dispatch({ type: "SELECT_PATH", payload: path }),
      startMission: (missionId: string) =>
        dispatch({ type: "START_MISSION", payload: missionId }),
      completeMission: (missionId: string) =>
        dispatch({ type: "COMPLETE_MISSION", payload: missionId }),
    }),
    [state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}