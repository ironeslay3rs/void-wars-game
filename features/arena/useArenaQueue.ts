"use client";

import { useEffect, useRef, useState } from "react";
import type { ArenaMode, QueueState } from "@/features/arena/arenaTypes";
import { canEnterArenaQueue } from "@/features/arena/arenaView";

type UseArenaQueueOptions = {
  battleModes: ArenaMode[];
  condition: number;
};

export function useArenaQueue({
  battleModes,
  condition,
}: UseArenaQueueOptions) {
  const [selectedMode, setSelectedMode] = useState<ArenaMode>(battleModes[0]);
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const matchmakingTimerRef = useRef<number | null>(null);
  const canQueueSelectedMode = canEnterArenaQueue(selectedMode.id, condition);

  useEffect(() => {
    return () => {
      if (matchmakingTimerRef.current !== null) {
        window.clearTimeout(matchmakingTimerRef.current);
      }
    };
  }, []);

  function resetQueue() {
    if (matchmakingTimerRef.current !== null) {
      window.clearTimeout(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    setQueueState("idle");
  }

  function handleSelectMode(mode: ArenaMode) {
    resetQueue();
    setSelectedMode(mode);
  }

  function handleQueue() {
    if (!canQueueSelectedMode) return;

    resetQueue();
    setQueueState("searching");

    matchmakingTimerRef.current = window.setTimeout(() => {
      setQueueState("matched");
      matchmakingTimerRef.current = null;
    }, 2000);
  }

  return {
    queueState,
    selectedMode,
    canQueueSelectedMode,
    handleSelectMode,
    handleQueue,
    handleCancelQueue: resetQueue,
    resetQueue,
  };
}
