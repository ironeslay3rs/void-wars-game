"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import type { PathType } from "@/features/game/gameTypes";

const SCHOOL_ACCENT: Record<PathType, string> = {
  bio: "border-emerald-500/40 bg-emerald-950/90",
  mecha: "border-cyan-400/40 bg-slate-950/90",
  pure: "border-amber-400/40 bg-amber-950/90",
};

const TOAST_DURATION_MS = 4200;

/**
 * One-time anomaly toast — fires when the player first touches off-school material.
 * Shows a subtle, school-voiced message, then fades and auto-clears.
 */
export default function AnomalyToast() {
  const { state } = useGame();
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<{ text: string; school: PathType } | null>(null);
  const seenAt = useRef<number | null>(null);

  useEffect(() => {
    const t = state.player.lastAnomalyToast;
    if (!t) return;
    if (seenAt.current === t.at) return;
    seenAt.current = t.at;

    setToast({ text: t.text, school: t.school });
    // Small delay so the fade-in is visible
    const showId = window.setTimeout(() => setVisible(true), 100);
    const hideId = window.setTimeout(() => {
      setVisible(false);
      // Clear after fade-out
      window.setTimeout(() => setToast(null), 400);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, [state.player.lastAnomalyToast]);

  if (!toast) return null;

  return (
    <div
      className={[
        "fixed inset-x-4 bottom-28 z-50 mx-auto max-w-md rounded-xl border px-4 py-3 backdrop-blur-md transition-opacity duration-400",
        SCHOOL_ACCENT[toast.school],
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <p className="text-xs italic leading-relaxed text-white/70">
        {toast.text}
      </p>
    </div>
  );
}
