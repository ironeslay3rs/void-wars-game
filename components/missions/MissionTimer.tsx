"use client";

import { useEffect, useState } from "react";
import { getSecondsRemaining } from "@/features/missions/missionRunner";

export default function MissionTimer({
  endsAt,
  labelWhenDone = "Complete",
  onDone,
}: {
  endsAt: number;
  labelWhenDone?: string;
  onDone?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const secondsRemaining = getSecondsRemaining(endsAt, now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsRemaining === 0) {
      onDone?.();
    }
  }, [onDone, secondsRemaining]);

  if (secondsRemaining === 0) {
    return <span>{labelWhenDone}</span>;
  }

  return <span>{secondsRemaining}s</span>;
}

