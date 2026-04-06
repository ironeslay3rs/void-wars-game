import { useEffect } from "react";
import type { Dispatch } from "react";
import type { GameAction } from "@/features/game/gameTypes";

export function useMissionQueueProcessor(
  dispatch: Dispatch<GameAction>,
  hasHydratedForUser: boolean,
) {
  useEffect(() => {
    if (!hasHydratedForUser) return;

    dispatch({
      type: "PROCESS_MISSION_QUEUE",
      payload: { now: Date.now() },
    });
  }, [dispatch, hasHydratedForUser]);

  useEffect(() => {
    if (!hasHydratedForUser) return;

    const interval = window.setInterval(() => {
      dispatch({
        type: "PROCESS_MISSION_QUEUE",
        payload: { now: Date.now() },
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [dispatch, hasHydratedForUser]);

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
  }, [dispatch, hasHydratedForUser]);
}
