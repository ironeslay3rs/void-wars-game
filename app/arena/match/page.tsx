"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DamagePopup from "@/components/combat/DamagePopup";
import { useGame } from "@/features/game/gameContext";
import { formatAffiliationLabel } from "@/lib/format";

type CombatPhase = "ready" | "victory" | "defeat";

type CombatLogEntry = {
  id: number;
  text: string;
};

type MatchRewards = {
  credits: number;
  rankXp: number;
  influence: number;
  scrapAlloy: number;
  runeDust: number;
  bioSamples: number;
  emberCore: number;
};

type HitTarget = "player" | "enemy" | null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getFactionAccent(faction: string) {
  if (faction === "bio") {
    return {
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      playerBar: "from-emerald-300 to-emerald-700",
      enemyBar: "from-red-300 to-red-700",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.14)]",
    };
  }

  if (faction === "mecha") {
    return {
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      playerBar: "from-cyan-300 to-cyan-700",
      enemyBar: "from-red-300 to-red-700",
      glow: "shadow-[0_0_30px_rgba(34,211,238,0.14)]",
    };
  }

  if (faction === "spirit") {
    return {
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      playerBar: "from-violet-300 to-violet-700",
      enemyBar: "from-red-300 to-red-700",
      glow: "shadow-[0_0_30px_rgba(168,85,247,0.14)]",
    };
  }

  return {
    chip: "border-white/15 bg-white/5 text-white/90",
    playerBar: "from-white/80 to-white/30",
    enemyBar: "from-red-300 to-red-700",
    glow: "shadow-[0_0_24px_rgba(255,255,255,0.06)]",
  };
}

function getPlayerCombatProfile(
  faction: string,
  rankLevel: number,
  condition: number,
) {
  const levelBonus = rankLevel * 14;
  const conditionScale = 0.75 + condition / 400;

  if (faction === "bio") {
    return {
      maxHp: Math.round((340 + levelBonus * 2.2) * conditionScale),
      minDamage: Math.round((28 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((42 + rankLevel * 5) * conditionScale),
      critChance: 0.16,
      critMultiplier: 1.45,
      title: "Adaptive Hunter",
    };
  }

  if (faction === "mecha") {
    return {
      maxHp: Math.round((360 + levelBonus * 2.4) * conditionScale),
      minDamage: Math.round((24 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((46 + rankLevel * 5) * conditionScale),
      critChance: 0.14,
      critMultiplier: 1.5,
      title: "Synod Duelist",
    };
  }

  if (faction === "spirit") {
    return {
      maxHp: Math.round((320 + levelBonus * 2.1) * conditionScale),
      minDamage: Math.round((30 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((48 + rankLevel * 5) * conditionScale),
      critChance: 0.18,
      critMultiplier: 1.4,
      title: "Ember Channeler",
    };
  }

  return {
    maxHp: Math.round((330 + levelBonus * 2.1) * conditionScale),
    minDamage: Math.round((22 + rankLevel * 3) * conditionScale),
    maxDamage: Math.round((36 + rankLevel * 4) * conditionScale),
    critChance: 0.1,
    critMultiplier: 1.35,
    title: "Unbound Drifter",
  };
}

function getEnemyCombatProfile(rankLevel: number) {
  return {
    name: "Arena Warden",
    maxHp: 360 + rankLevel * 34,
    minDamage: 20 + rankLevel * 4,
    maxDamage: 34 + rankLevel * 5,
    critChance: 0.08,
    critMultiplier: 1.35,
  };
}

function getRandomInt(min: number, max: number) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function rollDamage(
  minDamage: number,
  maxDamage: number,
  critChance: number,
  critMultiplier: number,
) {
  const baseDamage = getRandomInt(minDamage, maxDamage);
  const isCrit = Math.random() < critChance;
  const finalDamage = isCrit
    ? Math.round(baseDamage * critMultiplier)
    : baseDamage;

  return {
    damage: finalDamage,
    isCrit,
  };
}

function getMatchRewards(
  faction: string,
  rankLevel: number,
  condition: number,
): MatchRewards {
  const baseCredits = 70 + rankLevel * 18 + Math.floor(condition / 6);
  const baseXp = 35 + rankLevel * 9;
  const baseInfluence = 2 + Math.floor(rankLevel / 3);

  if (faction === "bio") {
    return {
      credits: baseCredits,
      rankXp: baseXp,
      influence: baseInfluence,
      scrapAlloy: 2,
      runeDust: 1,
      bioSamples: 4 + Math.floor(rankLevel / 2),
      emberCore: 0,
    };
  }

  if (faction === "mecha") {
    return {
      credits: baseCredits + 10,
      rankXp: baseXp,
      influence: baseInfluence,
      scrapAlloy: 5 + Math.floor(rankLevel / 2),
      runeDust: 0,
      bioSamples: 1,
      emberCore: 1,
    };
  }

  if (faction === "spirit") {
    return {
      credits: baseCredits - 5,
      rankXp: baseXp + 5,
      influence: baseInfluence,
      scrapAlloy: 1,
      runeDust: 5 + Math.floor(rankLevel / 2),
      bioSamples: 0,
      emberCore: 1,
    };
  }

  return {
    credits: baseCredits,
    rankXp: baseXp - 4,
    influence: baseInfluence,
    scrapAlloy: 2,
    runeDust: 2,
    bioSamples: 1,
    emberCore: 0,
  };
}

export default function ArenaMatchPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const { player } = state;

  const accent = getFactionAccent(player.factionAlignment);

  const playerProfile = useMemo(
    () =>
      getPlayerCombatProfile(
        player.factionAlignment,
        player.rankLevel,
        player.condition,
      ),
    [player.factionAlignment, player.rankLevel, player.condition],
  );

  const enemyProfile = useMemo(
    () => getEnemyCombatProfile(player.rankLevel),
    [player.rankLevel],
  );

  const rewards = useMemo(
    () =>
      getMatchRewards(
        player.factionAlignment,
        player.rankLevel,
        player.condition,
      ),
    [player.factionAlignment, player.rankLevel, player.condition],
  );

  const logIdRef = useRef(2);
  const matchResolutionAppliedRef = useRef(false);

  const [playerHp, setPlayerHp] = useState(playerProfile.maxHp);
  const [enemyHp, setEnemyHp] = useState(enemyProfile.maxHp);
  const [phase, setPhase] = useState<CombatPhase>("ready");
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([
    {
      id: 1,
      text: `Combat link established. ${player.playerName} enters the arena against ${enemyProfile.name}.`,
    },
  ]);

  const [lastHitTarget, setLastHitTarget] = useState<HitTarget>(null);
  const [lastHitValue, setLastHitValue] = useState(0);
  const [lastHitCrit, setLastHitCrit] = useState(false);

  const playerHpPercent = clamp((playerHp / playerProfile.maxHp) * 100, 0, 100);
  const enemyHpPercent = clamp((enemyHp / enemyProfile.maxHp) * 100, 0, 100);

  useEffect(() => {
    if (!lastHitTarget) return;

    const timeout = window.setTimeout(() => {
      setLastHitTarget(null);
      setLastHitValue(0);
      setLastHitCrit(false);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [lastHitTarget]);

  function getNextLogId() {
    const nextId = logIdRef.current;
    logIdRef.current += 1;
    return nextId;
  }

  function pushLog(text: string) {
    setCombatLog((current) =>
      [{ id: getNextLogId(), text }, ...current].slice(0, 8),
    );
  }

  function showHit(target: HitTarget, value: number, crit: boolean) {
    setLastHitTarget(target);
    setLastHitValue(value);
    setLastHitCrit(crit);
  }

  function resetCombat() {
    setPlayerHp(playerProfile.maxHp);
    setEnemyHp(enemyProfile.maxHp);
    setPhase("ready");
    setRewardsClaimed(false);
    matchResolutionAppliedRef.current = false;
    setLastHitTarget(null);
    setLastHitValue(0);
    setLastHitCrit(false);
    setCombatLog([
      {
        id: getNextLogId(),
        text: `Arena reset complete. ${enemyProfile.name} re-enters the combat shard.`,
      },
    ]);
  }

  function handleAttack() {
    if (phase !== "ready") return;

    const playerHit = rollDamage(
      playerProfile.minDamage,
      playerProfile.maxDamage,
      playerProfile.critChance,
      playerProfile.critMultiplier,
    );

    const nextEnemyHp = clamp(
      enemyHp - playerHit.damage,
      0,
      enemyProfile.maxHp,
    );

    pushLog(
      playerHit.isCrit
        ? `${player.playerName} lands a critical strike for ${playerHit.damage} damage on ${enemyProfile.name}.`
        : `${player.playerName} deals ${playerHit.damage} damage to ${enemyProfile.name}.`,
    );

    setEnemyHp(nextEnemyHp);
    showHit("enemy", playerHit.damage, playerHit.isCrit);

    if (nextEnemyHp <= 0) {
      if (!matchResolutionAppliedRef.current) {
        dispatch({ type: "ADJUST_CONDITION", payload: -6 });
        pushLog("Condition -6 (combat strain)");
        matchResolutionAppliedRef.current = true;
      }

      setPhase("victory");
      pushLog(`${enemyProfile.name} collapses. Arena victory confirmed.`);
      return;
    }

    const enemyHit = rollDamage(
      enemyProfile.minDamage,
      enemyProfile.maxDamage,
      enemyProfile.critChance,
      enemyProfile.critMultiplier,
    );

    const nextPlayerHp = clamp(
      playerHp - enemyHit.damage,
      0,
      playerProfile.maxHp,
    );

    pushLog(
      enemyHit.isCrit
        ? `${enemyProfile.name} lands a critical counter for ${enemyHit.damage} damage.`
        : `${enemyProfile.name} counters for ${enemyHit.damage} damage.`,
    );

    setPlayerHp(nextPlayerHp);
    showHit("player", enemyHit.damage, enemyHit.isCrit);

    if (nextPlayerHp <= 0) {
      if (!matchResolutionAppliedRef.current) {
        dispatch({ type: "ADJUST_CONDITION", payload: -10 });
        pushLog("Condition -10 (combat strain)");
        matchResolutionAppliedRef.current = true;
      }

      setPhase("defeat");
      pushLog(`${player.playerName} has been overwhelmed. Combat link lost.`);
    }
  }

  function handleClaimRewards() {
    if (phase !== "victory" || rewardsClaimed) return;

    dispatch({ type: "GAIN_RANK_XP", payload: rewards.rankXp });
    dispatch({ type: "ADD_INFLUENCE", payload: rewards.influence });
    dispatch({
      type: "ADD_RESOURCE",
      payload: { key: "credits", amount: rewards.credits },
    });

    if (rewards.scrapAlloy > 0) {
      dispatch({
        type: "ADD_RESOURCE",
        payload: { key: "scrapAlloy", amount: rewards.scrapAlloy },
      });
    }

    if (rewards.runeDust > 0) {
      dispatch({
        type: "ADD_RESOURCE",
        payload: { key: "runeDust", amount: rewards.runeDust },
      });
    }

    if (rewards.bioSamples > 0) {
      dispatch({
        type: "ADD_RESOURCE",
        payload: { key: "bioSamples", amount: rewards.bioSamples },
      });
    }

    if (rewards.emberCore > 0) {
      dispatch({
        type: "ADD_RESOURCE",
        payload: { key: "emberCore", amount: rewards.emberCore },
      });
    }

    setRewardsClaimed(true);
    pushLog(
      `Rewards secured: +${rewards.credits} credits, +${rewards.rankXp} XP, +${rewards.influence} influence.`,
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(110,50,70,0.22),_rgba(5,8,20,1)_60%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.78))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Arena Combat Prototype
            </div>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-white">
              Match Instance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              First playable combat loop for Void Wars: Oblivion. This scene now
              includes arena victory rewards and a return-to-arena payout flow.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/arena")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
            >
              Return to Arena
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <section
                className={[
                  "relative rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.97))] p-6",
                  accent.glow,
                ].join(" ")}
              >
                {lastHitTarget === "player" && (
                  <DamagePopup
                    value={lastHitValue}
                    crit={lastHitCrit}
                    variant="player"
                  />
                )}

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                      Player Operative
                    </div>
                    <div className="mt-3 text-2xl font-black uppercase tracking-[0.05em] text-white">
                      {player.playerName}
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      {playerProfile.title}
                    </div>
                  </div>

                  <div
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                      accent.chip,
                    ].join(" ")}
                  >
                    {formatAffiliationLabel(player.factionAlignment)}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Rank
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      Lv. {player.rankLevel}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Condition
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      {player.condition}%
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Power Band
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      {playerProfile.maxDamage}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      Integrity
                    </div>
                    <div className="text-sm font-bold text-white/85">
                      {playerHp} / {playerProfile.maxHp}
                    </div>
                  </div>

                  <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    <div
                      className={[
                        "h-full rounded-full bg-gradient-to-r transition-all duration-300",
                        accent.playerBar,
                      ].join(" ")}
                      style={{ width: `${playerHpPercent}%` }}
                    />
                  </div>
                </div>
              </section>

              <section className="relative rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.97))] p-6 shadow-[0_0_30px_rgba(255,255,255,0.04)]">
                {lastHitTarget === "enemy" && (
                  <DamagePopup
                    value={lastHitValue}
                    crit={lastHitCrit}
                    variant="enemy"
                  />
                )}

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                      Enemy Combatant
                    </div>
                    <div className="mt-3 text-2xl font-black uppercase tracking-[0.05em] text-white">
                      {enemyProfile.name}
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Arena enforcement construct
                    </div>
                  </div>

                  <div className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-100">
                    Hostile
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Threat
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      T-{player.rankLevel}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Min
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      {enemyProfile.minDamage}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Max
                    </div>
                    <div className="mt-2 text-lg font-black text-white">
                      {enemyProfile.maxDamage}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      Integrity
                    </div>
                    <div className="text-sm font-bold text-white/85">
                      {enemyHp} / {enemyProfile.maxHp}
                    </div>
                  </div>

                  <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    <div
                      className={[
                        "h-full rounded-full bg-gradient-to-r transition-all duration-300",
                        accent.enemyBar,
                      ].join(" ")}
                      style={{ width: `${enemyHpPercent}%` }}
                    />
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.97))] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                    Combat Control
                  </div>
                  <div className="mt-3 text-2xl font-black uppercase tracking-[0.05em] text-white">
                    {phase === "ready" && "Engagement Active"}
                    {phase === "victory" && "Victory Confirmed"}
                    {phase === "defeat" && "Defeat Registered"}
                  </div>
                </div>

                <div
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                    phase === "victory"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : phase === "defeat"
                        ? "border-red-500/30 bg-red-500/10 text-red-100"
                        : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
                  ].join(" ")}
                >
                  {phase}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAttack}
                  disabled={phase !== "ready"}
                  className={[
                    "rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] transition",
                    phase === "ready"
                      ? "bg-white text-black hover:brightness-110"
                      : "cursor-not-allowed bg-white/10 text-white/30",
                  ].join(" ")}
                >
                  Attack
                </button>

                <button
                  type="button"
                  onClick={resetCombat}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
                >
                  Reset Combat
                </button>
              </div>

              {phase === "victory" && (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/80">
                    Victory Rewards
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                      +{rewards.credits} Credits
                    </div>
                    <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                      +{rewards.rankXp} Rank XP
                    </div>
                    <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                      +{rewards.influence} Influence
                    </div>

                    {rewards.scrapAlloy > 0 && (
                      <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                        +{rewards.scrapAlloy} Scrap Alloy
                      </div>
                    )}

                    {rewards.runeDust > 0 && (
                      <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                        +{rewards.runeDust} Rune Dust
                      </div>
                    )}

                    {rewards.bioSamples > 0 && (
                      <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                        +{rewards.bioSamples} Bio Samples
                      </div>
                    )}

                    {rewards.emberCore > 0 && (
                      <div className="rounded-xl border border-emerald-500/15 bg-black/15 px-4 py-3 text-sm text-emerald-100">
                        +{rewards.emberCore} Ember Core
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleClaimRewards}
                      disabled={rewardsClaimed}
                      className={[
                        "rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] transition",
                        rewardsClaimed
                          ? "cursor-not-allowed bg-white/10 text-white/30"
                          : "bg-emerald-300 text-black hover:brightness-110",
                      ].join(" ")}
                    >
                      {rewardsClaimed ? "Rewards Claimed" : "Claim Rewards"}
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/arena")}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
                    >
                      Return to Arena
                    </button>
                  </div>
                </div>
              )}

              {phase === "defeat" && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                  Defeat registered. No reward payout is available for this match
                  instance. Reset combat or return to the arena.
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/55">
                Each attack triggers a direct enemy counterattack unless the enemy is
                defeated first. Rewards can only be claimed once per victory.
              </div>
            </section>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.97))] p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
              Combat Log
            </div>

            <div className="mt-4 space-y-3">
              {combatLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/75"
                >
                  {entry.text}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
