"use client";

import { useEffect, useState } from "react";
import type { ActiveProcess } from "@/features/game/gameTypes";

export function useActiveProcessTimer(activeProcess: ActiveProcess | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
  }, [activeProcess?.id, activeProcess?.status, activeProcess?.endsAt]);

  useEffect(() => {
    if (!activeProcess || activeProcess.status !== "running") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeProcess]);

  const remainingMs = activeProcess
    ? Math.max(0, activeProcess.endsAt - now)
    : 0;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return {
    remainingMs,
    remainingSeconds,
    isRunning: activeProcess?.status === "running",
    isComplete: activeProcess?.status === "complete",
  };
}
