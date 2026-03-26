"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ScreenHeader from "@/components/shared/ScreenHeader";
import BossResult from "@/components/field/BossResult";
import { useGame } from "@/features/game/gameContext";
import { hollowfangBoss } from "@/features/combat/bossData";
import {
  activateDodgeWindow,
  buildBossFightResult,
  createBossFightState,
  tickBossFight,
  type BossFightState,
} from "@/features/combat/bossEngine";
import type { ResourceKey } from "@/features/game/gameTypes";

function pct(current: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export default function BossEncounterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnHref = searchParams.get("return") ?? "/deploy-into-void/field";
  const { state, dispatch } = useGame();

  const [seed] = useState(
    () => `${state.player.playerName}-hollowfang-${Date.now()}`,
  );
  const [autoAttack, setAutoAttack] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [phase, setPhase] = useState<"intro" | "fighting">("intro");
  const [fightState, setFightState] = useState<BossFightState>(() =>
    createBossFightState(state.player, hollowfangBoss, Date.now()),
  );
  const [dodgeLockedUntil, setDodgeLockedUntil] = useState(0);
  const resultAppliedRef = useRef(false);

  const result = useMemo(() => {
    if (!fightState.isResolved || !fightState.outcome) return null;
    return buildBossFightResult({
      state: fightState,
      player: state.player,
      boss: hollowfangBoss,
      seed,
    });
  }, [fightState, seed, state.player]);

  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "fighting") return;
    loopRef.current = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      setFightState((prev) =>
        tickBossFight({
          state: prev,
          player: state.player,
          boss: hollowfangBoss,
          now,
          autoAttackEnabled: autoAttack,
        }),
      );
    }, 220);

    return () => {
      if (loopRef.current !== null) {
        window.clearInterval(loopRef.current);
      }
      loopRef.current = null;
    };
  }, [phase, autoAttack, state.player]);

  useEffect(() => {
    if (!result || resultAppliedRef.current) return;

    if (result.conditionLoss > 0) {
      dispatch({ type: "ADJUST_CONDITION", payload: -result.conditionLoss });
    }

    if (result.outcome === "victory") {
      if (result.rankXp > 0) {
        dispatch({ type: "GAIN_RANK_XP", payload: result.rankXp });
      }
      if (result.influenceGain > 0) {
        dispatch({ type: "ADD_INFLUENCE", payload: result.influenceGain });
      }
      for (const [k, v] of Object.entries(result.resourcePayout)) {
        if (typeof v === "number" && v > 0) {
          dispatch({
            type: "ADD_FIELD_LOOT",
            payload: { key: k as ResourceKey, amount: v },
          });
        }
      }
    } else {
      for (const [k, v] of Object.entries(result.lootLost)) {
        if (typeof v === "number" && v > 0) {
          dispatch({
            type: "SPEND_RESOURCE",
            payload: { key: k as ResourceKey, amount: v },
          });
        }
      }
    }

    resultAppliedRef.current = true;
  }, [dispatch, result]);

  function handleStart() {
    if (phase !== "intro") return;
    setPhase("fighting");
  }

  function handleDodge() {
    if (phase !== "fighting" || nowMs < dodgeLockedUntil) return;
    const now = nowMs;
    setFightState((prev) => activateDodgeWindow(prev, now));
    setDodgeLockedUntil(now + 2500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(153,27,27,0.25),rgba(3,7,18,1)_58%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <ScreenHeader
          backHref={returnHref}
          backLabel="Return"
          eyebrow="Void Boss Encounter"
          title="Hollowfang Lair"
          subtitle="Flagship predator. Phase shift below 30% HP triggers Frenzy."
        />

        <section className="rounded-2xl border border-white/12 bg-black/30 p-5">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-red-300/20 bg-[radial-gradient(circle_at_40%_30%,rgba(239,68,68,0.18),rgba(0,0,0,0.8)_72%)] p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                Boss Visual
              </div>
              <div className="mt-3 flex h-52 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-center">
                <div>
                  <div className="text-4xl">🐺</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.18em] text-red-100/85">
                    Hollowfang
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {fightState.phase === "frenzy"
                      ? "Frenzy active: double attack speed"
                      : "Normal phase"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/60">
                  <span>Boss HP</span>
                  <span>
                    {Math.round(fightState.bossHp)} / {hollowfangBoss.hp}
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 transition-[width] duration-200"
                    style={{ width: `${pct(fightState.bossHp, hollowfangBoss.hp)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/60">
                  <span>Operative Condition</span>
                  <span>{Math.round(fightState.playerCondition)}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-[width] duration-200"
                    style={{ width: `${pct(fightState.playerCondition, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                <div>
                  Howl:{" "}
                  {nowMs <= fightState.fearDebuffUntil
                    ? "Fear debuff active (-damage)"
                    : "Dormant"}
                </div>
                <div className="mt-1">
                  Trigger count: {fightState.howlTriggers} · Auto-attack:{" "}
                  {autoAttack ? "ON" : "OFF"}
                </div>
              </div>
            </div>
          </div>

          {phase === "intro" ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStart}
                className="rounded-xl border border-red-300/35 bg-red-500/14 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-red-50 hover:border-red-200/55 hover:bg-red-500/22"
              >
                Engage Hollowfang
              </button>
              <button
                type="button"
                onClick={() => router.push(returnHref)}
                className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 hover:border-white/25 hover:bg-white/10"
              >
                Pull Back
              </button>
            </div>
          ) : null}

          {phase === "fighting" ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAutoAttack((v) => !v)}
                className="rounded-xl border border-cyan-300/30 bg-cyan-500/12 px-4 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-200/45"
              >
                Auto Attack: {autoAttack ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={handleDodge}
                disabled={nowMs < dodgeLockedUntil}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold",
                  nowMs < dodgeLockedUntil
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                    : "border-amber-300/30 bg-amber-500/12 text-amber-100 hover:border-amber-200/45",
                ].join(" ")}
              >
                {nowMs < dodgeLockedUntil ? "Dodge Recharging" : "Dodge Window"}
              </button>
            </div>
          ) : null}
        </section>

        {fightState.isResolved && result ? (
          <BossResult result={result} returnHref={returnHref} />
        ) : null}
      </div>
    </main>
  );
}

