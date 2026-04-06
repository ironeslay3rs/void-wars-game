import { useCallback, useEffect } from "react";
import type { MutableRefObject } from "react";
import { saveGameState } from "@/features/game/gameStorage";
import type { GameState } from "@/features/game/gameTypes";
import { saveRemoteGameState } from "@/features/save/remoteGameState";

type PersistenceUser = { id: string } | null;
type PersistenceSession = { accessToken: string } | null;

export function useGamePersistence({
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
}: {
  state: GameState;
  status: string;
  user: PersistenceUser;
  session: PersistenceSession;
  hasHydratedForUser: boolean;
  hydratedUserId: string | null;
  setBeforeLogoutHandler: (handler: (() => Promise<void>) | null) => void;
  pendingSaveTimeoutRef: MutableRefObject<number | null>;
  latestStateRef: MutableRefObject<GameState>;
  skipNextRemoteSaveRef: MutableRefObject<boolean>;
  clearPendingRemoteSave: () => void;
}) {
  useEffect(() => {
    latestStateRef.current = state;
  }, [latestStateRef, state]);

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
    latestStateRef,
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
    pendingSaveTimeoutRef,
    persistRemoteSaveNow,
    skipNextRemoteSaveRef,
    state,
    status,
    user,
  ]);
}
