import { PlayerState } from "./gameTypes";

export const GAME_STORAGE_KEY = "void-wars-game-state-v1";

export function loadGameState(): PlayerState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PlayerState;
    return parsed;
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
}

export function saveGameState(state: PlayerState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
}

export function clearGameState() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear game state:", error);
  }
}