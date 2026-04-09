"use client";

import { useCallback, useEffect, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import {
  checkForNewDoctrine,
  markDoctrineSeen,
  type PendingDoctrineEncounter,
} from "@/features/mastery/doctrineEncounterCheck";
import type { PathType } from "@/features/game/gameTypes";

const SCHOOL_ACCENT: Record<PathType, { bg: string; border: string; glow: string; text: string }> = {
  bio: {
    bg: "bg-emerald-950/95",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_80px_rgba(52,211,153,0.15)]",
    text: "text-emerald-200",
  },
  mecha: {
    bg: "bg-slate-950/95",
    border: "border-cyan-400/40",
    glow: "shadow-[0_0_80px_rgba(34,211,238,0.12)]",
    text: "text-cyan-200",
  },
  pure: {
    bg: "bg-amber-950/95",
    border: "border-amber-400/40",
    glow: "shadow-[0_0_80px_rgba(251,191,36,0.15)]",
    text: "text-amber-200",
  },
};

const SCHOOL_LABEL: Record<PathType, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

export default function DoctrineEncounterOverlay() {
  const { state } = useGame();
  const [encounter, setEncounter] = useState<PendingDoctrineEncounter | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pending = checkForNewDoctrine(state.player.runeMastery);
    if (pending) {
      setEncounter(pending);
      // Small delay for dramatic effect
      const tid = window.setTimeout(() => setVisible(true), 300);
      return () => window.clearTimeout(tid);
    }
  }, [state.player.runeMastery]);

  const handleDismiss = useCallback(() => {
    if (encounter) {
      markDoctrineSeen(encounter.school, encounter.milestone.depth);
    }
    setVisible(false);
    // Allow fade-out animation before clearing
    const tid = window.setTimeout(() => setEncounter(null), 400);
    return () => window.clearTimeout(tid);
  }, [encounter]);

  if (!encounter) return null;

  const accent = SCHOOL_ACCENT[encounter.school];
  const { milestone } = encounter;

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-400",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={`Doctrine milestone: ${milestone.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Content */}
      <div
        className={[
          "relative w-full max-w-lg rounded-3xl border p-6 sm:p-8",
          accent.bg,
          accent.border,
          accent.glow,
        ].join(" ")}
      >
        {/* School badge */}
        <div className={`text-[10px] font-bold uppercase tracking-[0.28em] ${accent.text}`}>
          {SCHOOL_LABEL[encounter.school]} · Depth {milestone.depth}
        </div>

        {/* Doctrine title */}
        <h2 className="mt-4 text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
          {milestone.title}
        </h2>

        {/* The truth — the core line */}
        <div className="mt-5 border-l-2 border-white/20 pl-4">
          <p className="text-lg font-semibold italic leading-relaxed text-white/90 sm:text-xl">
            &ldquo;{milestone.truth}&rdquo;
          </p>
        </div>

        {/* The teaching — school-voiced explanation */}
        <p className="mt-5 text-sm leading-relaxed text-white/60">
          {milestone.teaching}
        </p>

        {/* Mechanic hint */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
            What this unlocks
          </div>
          <p className="mt-1 text-xs text-white/55">
            {milestone.mechanicHint}
          </p>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={[
            "mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition active:scale-[0.98]",
            `${accent.border} bg-white/5 text-white hover:bg-white/10`,
          ].join(" ")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
