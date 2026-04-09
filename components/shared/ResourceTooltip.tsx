"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PathType, ResourceKey } from "@/features/game/gameTypes";
import { getResourceFlavor } from "@/features/lore/resourceFlavorData";

const SCHOOL_BORDER: Record<PathType | "neutral", string> = {
  bio: "border-emerald-500/30",
  mecha: "border-cyan-400/30",
  pure: "border-amber-400/30",
  neutral: "border-white/15",
};

const AUTO_DISMISS_MS = 5000;

/**
 * Tap-to-reveal resource lore tooltip.
 * Wraps children (the resource chip) and shows flavor data on tap.
 */
export default function ResourceTooltip({
  resourceKey,
  children,
}: {
  resourceKey: ResourceKey;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        // Auto-dismiss after timeout
        timerRef.current = window.setTimeout(dismiss, AUTO_DISMISS_MS);
        return true;
      }
      dismiss();
      return false;
    });
  }, [dismiss]);

  // Dismiss on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        dismiss();
      }
    }
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open, dismiss]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const flavor = getResourceFlavor(resourceKey);
  const border = SCHOOL_BORDER[flavor.school];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left"
        aria-expanded={open}
      >
        {children}
      </button>

      {open ? (
        <div
          className={`absolute bottom-full left-0 z-40 mb-2 w-56 rounded-xl border bg-black/95 p-3 shadow-lg backdrop-blur-sm ${border}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
            {flavor.displayName}
          </div>
          <p className="mt-1.5 text-[11px] italic leading-snug text-white/50">
            {flavor.flavorLine}
          </p>
          <div className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30">
            {flavor.originHint}
          </div>
        </div>
      ) : null}
    </div>
  );
}
