"use client";

import { useEffect, useRef, useState } from "react";
import type { ArenaMode, QueueState } from "@/features/arena/arenaTypes";

type UseArenaQueueOptions = {
  battleModes: ArenaMode[];
  arenaEligibility: string;
};

export function useArenaQueue({
  battleModes,
  arenaEligibility,
}: UseArenaQueueOptions) {
  const [selectedMode, setSelectedMode] = useState<ArenaMode>(battleModes[0]);
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const matchmakingTimerRef = useRef<number | null>(null);

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
    if (arenaEligibility !== "Eligible") return;

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
    handleSelectMode,
    handleQueue,
    handleCancelQueue: resetQueue,
    resetQueue,
  };
}
