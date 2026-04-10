"use client";

import { useEffect, useRef, useState } from "react";

export type KillFeedEntry = {
  id: string;
  text: string;
  at: number;
};

const MAX_ENTRIES = 5;
const ENTRY_TTL_MS = 4000;

/**
 * Tiny kill feed overlay — shows recent kills + loot pickups as
 * ephemeral lines that fade after 4 seconds. Positioned top-left
 * of the void field, below the HUD.
 */
export default function KillFeed({
  entries,
}: {
  entries: KillFeedEntry[];
}) {
  const [visible, setVisible] = useState<KillFeedEntry[]>([]);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (entries.length > prevLenRef.current) {
      const newEntries = entries.slice(prevLenRef.current);
      setVisible((prev) => [...newEntries, ...prev].slice(0, MAX_ENTRIES));
    }
    prevLenRef.current = entries.length;
  }, [entries]);

  // Prune expired entries.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setVisible((prev) =>
        prev.filter((e) => now - e.at < ENTRY_TTL_MS),
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (visible.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-[max(0.75rem,env(safe-area-inset-left))] top-[calc(7.5rem+env(safe-area-inset-top,0px))] z-40 flex max-w-[240px] flex-col gap-1">
      {visible.map((entry) => {
        const age = Date.now() - entry.at;
        const opacity = age > ENTRY_TTL_MS * 0.7 ? 0.3 : 0.85;
        return (
          <div
            key={entry.id}
            className="rounded-md bg-black/60 px-2 py-1 text-[9px] font-semibold leading-snug text-white/90 backdrop-blur-sm transition-opacity duration-500"
            style={{ opacity }}
          >
            {entry.text}
          </div>
        );
      })}
    </div>
  );
}
