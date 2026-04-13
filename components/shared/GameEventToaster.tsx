"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/features/game/gameContext";
import { pushToast } from "@/features/toast/toastBus";

/**
 * Watches game state and emits floating toasts on key transitions.
 * Mounted globally (once) inside AuthProvider.
 *
 * Watches:
 * - lastRuneInstallOutcome (mana + capacity costs, set completion)
 * - lastMythicGateBreakthrough (mythic unlock celebration)
 * - lastAnomalyToast (convergence anomaly surface)
 * - condition transitioning to 0 (death penalty notification)
 * - rankLevel increment (supplements RankUpBanner with a credit/XP line)
 * - pantheonBlessingToken consumption (blessing applied)
 */
export default function GameEventToaster() {
  const { state } = useGame();
  const p = state.player;

  const prevRankRef = useRef<number>(p.rankLevel);
  const prevConditionRef = useRef<number>(p.condition);
  const lastRuneInstallAtRef = useRef<number>(p.lastRuneInstallOutcome?.at ?? 0);
  const lastMythicAtRef = useRef<number>(
    p.lastMythicGateBreakthrough?.at ?? 0,
  );
  const lastAnomalyAtRef = useRef<number>(p.lastAnomalyToast?.at ?? 0);

  // Rune install outcome
  useEffect(() => {
    const o = p.lastRuneInstallOutcome;
    if (!o) return;
    if (o.at === lastRuneInstallAtRef.current) return;
    lastRuneInstallAtRef.current = o.at;
    if (o.ok) {
      pushToast("Rune installed", {
        variant: "success",
        detail: `${o.school} depth ${o.newDepth}`,
      });
    } else {
      pushToast("Install blocked", {
        variant: "warning",
        detail: o.reason,
      });
    }
  }, [p.lastRuneInstallOutcome]);

  // Mythic breakthrough
  useEffect(() => {
    const o = p.lastMythicGateBreakthrough;
    if (!o) return;
    if (o.at === lastMythicAtRef.current) return;
    lastMythicAtRef.current = o.at;
    pushToast(o.headline, {
      variant: "reward",
      detail: o.detail,
    });
  }, [p.lastMythicGateBreakthrough]);

  // Convergence anomaly
  useEffect(() => {
    const o = p.lastAnomalyToast;
    if (!o) return;
    if (o.at === lastAnomalyAtRef.current) return;
    lastAnomalyAtRef.current = o.at;
    pushToast("Anomaly detected", {
      variant: "reward",
      detail: o.text,
    });
  }, [p.lastAnomalyToast]);

  // Death / condition floor
  useEffect(() => {
    const prev = prevConditionRef.current;
    const curr = p.condition;
    if (prev > 0 && curr <= 0) {
      pushToast("Operative down", {
        variant: "warning",
        detail: "10% resource penalty applied on extraction.",
      });
    }
    prevConditionRef.current = curr;
  }, [p.condition]);

  // Rank increment (RankUpBanner covers the celebration; this reinforces
  // with a compact log line and ensures it's logged alongside other beats.)
  useEffect(() => {
    const prev = prevRankRef.current;
    const curr = p.rankLevel;
    if (curr > prev) {
      pushToast(`Rank ${curr}`, {
        variant: "reward",
        detail: "New doctrine lines unlocked.",
      });
    }
    prevRankRef.current = curr;
  }, [p.rankLevel]);

  return null;
}
