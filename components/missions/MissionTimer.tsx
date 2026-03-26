"use client";

import { useEffect, useState } from "react";
import { getSecondsRemaining } from "@/features/missions/missionRunner";

export default function MissionTimer({
  startsAt,
  endsAt,
  labelWhenDone = "Complete",
  onDone,
}: {
  startsAt?: number;
  endsAt: number;
  labelWhenDone?: string;
  onDone?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const secondsRemaining = getSecondsRemaining(endsAt, now);
  const startedAt = startsAt ?? Math.min(now, endsAt);
  const totalMs = Math.max(1, endsAt - startedAt);
  const elapsedMs = Math.max(0, Math.min(totalMs, now - startedAt));
  const progressPct = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));

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

  return (
    <span className="inline-flex min-w-[86px] flex-col gap-1">
      <span>{secondsRemaining}s</span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <span
          className="block h-full rounded-full bg-cyan-300/85 transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </span>
    </span>
  );
}

