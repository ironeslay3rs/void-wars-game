"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import {
  canGrantRuneCrafterLicense,
  canPrimeConvergence,
  canUnlockL3RareRuneSet,
  getConvergenceArcBrief,
  getRuneKnightReadiness,
  getSaintRuneL5Panel,
} from "@/features/progression/mythicAscensionLogic";
import { getActiveMythicGateBreakthrough } from "@/features/progression/ascensionStep";
import SectionCard from "@/components/shared/SectionCard";

export default function MythicAscensionPanel() {
  const { state, dispatch } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const p = state.player;

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const breakthrough = getActiveMythicGateBreakthrough(p, now);
  const m = p.mythicAscension;
  const saint = getSaintRuneL5Panel(m);
  const knight = getRuneKnightReadiness(p);
  const convergence = getConvergenceArcBrief(m, p);
  const l3Ok = canUnlockL3RareRuneSet(p);
  const crafterOk = canGrantRuneCrafterLicense(p);
  const convergenceOk = canPrimeConvergence(p);

  return (
    <SectionCard
      title="Mythic ladder (late progression)"
      description="Rare L3 sets, Rune Crafter recognition, and the Saint Rune road — Book 1 exposes gates, not the full L5 forge."
    >
      <div className="space-y-4 text-sm text-white/70">
        {breakthrough ? (
          <div className="rounded-xl border border-amber-200/40 bg-[linear-gradient(90deg,rgba(120,60,12,0.45),rgba(20,14,8,0.92))] px-4 py-3 shadow-[0_0_28px_rgba(251,191,36,0.18)]">
            <p className="text-[10px] font-black uppercase leading-snug tracking-[0.14em] text-amber-50">
              {breakthrough.headline}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-amber-100/88">
              {breakthrough.detail}
            </p>
          </div>
        ) : null}
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/20 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/80">
            Ironheart
          </div>
          <p className="mt-1 text-white/80">
            Stock:{" "}
            <span className="font-semibold text-white">{p.resources.ironHeart}</span>
            {" · "}
            Boss-named drops on the void field (war metals).
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                L3 Rare Rune set
              </p>
              <p className="mt-1 text-white/85">
                {m.l3RareRuneSetUnlocked
                  ? "Unlocked — obsidian-cycle set available to crafters."
                  : "Sealed — needs rune depth, rank, Ironheart, and dust tithe."}
              </p>
              {!m.l3RareRuneSetUnlocked ? (
                <p className="mt-2 text-xs text-white/50">
                  Requires rank 4+, depth 4+, 1× Ironheart, 30 rune dust.
                </p>
              ) : null}
            </div>
            {!m.l3RareRuneSetUnlocked ? (
              <button
                type="button"
                disabled={!l3Ok}
                onClick={() =>
                  dispatch({
                    type: "ATTEMPT_MYTHIC_UNLOCK",
                    payload: "l3-rare-rune-set",
                  })
                }
                className="min-h-[44px] w-full rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Unlock
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Rune Crafter title
              </p>
              <p className="mt-1 text-white/85">
                {m.runeCrafterLicense
                  ? "Licensed — profession recognised on the Professions board."
                  : "Requires L3 unlock, rank 5+, 2× Ironheart tithe."}
              </p>
            </div>
            {m.l3RareRuneSetUnlocked && !m.runeCrafterLicense ? (
              <button
                type="button"
                disabled={!crafterOk}
                onClick={() =>
                  dispatch({
                    type: "ATTEMPT_MYTHIC_UNLOCK",
                    payload: "rune-crafter-license",
                  })
                }
                className="min-h-[44px] w-full rounded-lg border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-violet-100 touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Earn license
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Phase 9 · Convergence filing
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/75">
                {convergence.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {convergence.body}
              </p>
            </div>
            {!m.convergencePrimed ? (
              <button
                type="button"
                disabled={!convergenceOk}
                onClick={() =>
                  dispatch({
                    type: "ATTEMPT_MYTHIC_UNLOCK",
                    payload: "convergence-prime",
                  })
                }
                className="min-h-[44px] w-full rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                File convergence
              </button>
            ) : null}
          </div>
          {m.convergencePrimed ? (
            <div className="mt-3 space-y-3 rounded-lg border border-cyan-400/20 bg-cyan-950/20 px-3 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/80">
                  Rune Knight valor
                </p>
                <p className="mt-1 font-mono text-sm text-white/90">
                  {m.runeKnightValor}
                  <span className="text-white/45">/99</span>
                </p>
                <p className="mt-1 text-[11px] text-white/55">
                  Earn +1 on ranked or tournament wins (SR gain). Spend below — prestige should cost.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  disabled={m.runeKnightValor < 5}
                  onClick={() =>
                    dispatch({
                      type: "REDEEM_RUNE_KNIGHT_VALOR",
                      payload: "mastery-boon",
                    })
                  }
                  className="min-h-[44px] flex-1 rounded-lg border border-cyan-400/45 bg-cyan-500/15 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-cyan-100 touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[9rem]"
                >
                  Mastery boon — 5 valor (+12 progress)
                </button>
                <button
                  type="button"
                  disabled={m.runeKnightValor < 3}
                  onClick={() =>
                    dispatch({
                      type: "REDEEM_RUNE_KNIGHT_VALOR",
                      payload: "influence-seal",
                    })
                  }
                  className="min-h-[44px] flex-1 rounded-lg border border-amber-400/40 bg-amber-500/12 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-amber-100 touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[9rem]"
                >
                  Influence seal — 3 valor (+2 influence)
                </button>
              </div>
              <p className="text-[10px] text-white/40">
                Ivory Tower hosts a pride rite that also taxes credits — see Black Market → Ivory Tower.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-violet-400/25 bg-violet-950/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200/80">
            {saint.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{saint.body}</p>
        </div>

        <div className="rounded-xl border border-rose-400/22 bg-rose-950/18 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-200/80">
            {knight.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{knight.body}</p>
        </div>
      </div>
    </SectionCard>
  );
}
