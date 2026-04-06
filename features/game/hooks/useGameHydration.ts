import { useEffect } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { initialGameState } from "@/features/game/initialGameState";
import { clearGameState, loadGameState } from "@/features/game/gameStorage";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import { loadRemoteGameState } from "@/features/save/remoteGameState";

type HydrationUser = { id: string } | null;
type HydrationSession = { accessToken: string } | null;

export function useGameHydration({
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
}: {
  status: string;
  user: HydrationUser;
  session: HydrationSession;
  dispatch: Dispatch<GameAction>;
  clearPendingRemoteSave: () => void;
  hasHydratedForUser: boolean;
  hydratedUserId: string | null;
  setHasHydratedForUser: (value: SetStateAction<boolean>) => void;
  setHydratedUserId: (value: SetStateAction<string | null>) => void;
  skipNextRemoteSaveRef: MutableRefObject<boolean>;
}) {
  useEffect(() => {
    clearPendingRemoteSave();

    if (status !== "authenticated" || !user || !session) {
      return;
    }

    if (hasHydratedForUser && hydratedUserId === user.id) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearPendingRemoteSave, session, status, user]);
}
