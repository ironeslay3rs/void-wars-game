import type {
  FactionAlignment,
  GameAction,
} from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

export function selectFactionPath(
  dispatch: React.Dispatch<GameAction>,
  path: PathSelection,
) {
  dispatch({ type: "SET_FACTION_ALIGNMENT", payload: path });
}

export function unlockRoute(
  dispatch: React.Dispatch<GameAction>,
  route: string,
) {
  dispatch({ type: "UNLOCK_ROUTE", payload: route });
}

export function chargeTeleportGate(dispatch: React.Dispatch<GameAction>) {
  dispatch({ type: "SET_GATE_STATUS", payload: "traveling" });
}

export function openTeleportGate(dispatch: React.Dispatch<GameAction>) {
  dispatch({ type: "SET_GATE_STATUS", payload: "available" });
  dispatch({ type: "UNLOCK_ROUTE", payload: "/bazaar/teleport-gate" });
}

export function resetToNewGame(dispatch: React.Dispatch<GameAction>) {
  dispatch({ type: "RESET_GAME" });
}