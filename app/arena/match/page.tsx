"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DamagePopup from "@/components/combat/DamagePopup";
import { useGame } from "@/features/game/gameContext";
import { getPlayerLoadoutCombatModifiers } from "@/features/combat/loadoutCombatStats";
import {
  ARENA_ENEMY_TELEGRAPH_DAMAGE_MULT,
  ARENA_ENEMY_TELEGRAPH_INTERVAL,
  getArenaArchetypePayoutMult,
  getArenaDefeatSrDelta,
  getArenaEnemyProfile,
  getArenaVictorySrDelta,
  rollArenaEnemyArchetype,
  type ArenaEnemyArchetypeId,
} from "@/features/arena/arenaEncounterProfiles";
import {
  ARENA_PRACTICE_REWARD_MULT,
  arenaModeAppliesRankedStakes,
  parseArenaMatchModeParam,
  scaleArenaRewardsForMode,
  type ArenaMatchModeId,
} from "@/features/arena/arenaMatchModes";

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

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "pure") return "Pure";
  return faction;
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

  if (faction === "pure") {
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
  attackMultiplier: number,
  armorMitigationPct: number,
) {
  const levelBonus = rankLevel * 14;
  const conditionScale = 0.75 + condition / 400;
  const hpScale = 1 + armorMitigationPct / 250;

  if (faction === "bio") {
    return {
      maxHp: Math.round((340 + levelBonus * 2.2) * conditionScale * hpScale),
      minDamage: Math.max(
        1,
        Math.round((28 + rankLevel * 4) * conditionScale * attackMultiplier),
      ),
      maxDamage: Math.max(
        1,
        Math.round((42 + rankLevel * 5) * conditionScale * attackMultiplier),
      ),
      critChance: 0.16,
      critMultiplier: 1.45,
      title: "Adaptive Hunter",
    };
  }

  if (faction === "mecha") {
    return {
      maxHp: Math.round((360 + levelBonus * 2.4) * conditionScale * hpScale),
      minDamage: Math.max(
        1,
        Math.round((24 + rankLevel * 4) * conditionScale * attackMultiplier),
      ),
      maxDamage: Math.max(
        1,
        Math.round((46 + rankLevel * 5) * conditionScale * attackMultiplier),
      ),
      critChance: 0.14,
      critMultiplier: 1.5,
      title: "Synod Duelist",
    };
  }

  if (faction === "pure") {
    return {
      maxHp: Math.round((320 + levelBonus * 2.1) * conditionScale * hpScale),
      minDamage: Math.max(
        1,
        Math.round((30 + rankLevel * 4) * conditionScale * attackMultiplier),
      ),
      maxDamage: Math.max(
        1,
        Math.round((48 + rankLevel * 5) * conditionScale * attackMultiplier),
      ),
      critChance: 0.18,
      critMultiplier: 1.4,
      title: "Ember Channeler",
    };
  }

  return {
    maxHp: Math.round((330 + levelBonus * 2.1) * conditionScale * hpScale),
    minDamage: Math.max(
      1,
      Math.round((22 + rankLevel * 3) * conditionScale * attackMultiplier),
    ),
    maxDamage: Math.max(
      1,
      Math.round((36 + rankLevel * 4) * conditionScale * attackMultiplier),
    ),
    critChance: 0.1,
    critMultiplier: 1.35,
    title: "Unbound Drifter",
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

  if (faction === "pure") {
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

function arenaModeLabel(mode: ArenaMatchModeId): string {
  if (mode === "ranked") return "Ranked";
  if (mode === "tournament") return "Tournament";
  return "Practice";
}

function getArenaArchetypeRigRecommendation(
  archetype: ArenaEnemyArchetypeId,
  profile: ReturnType<typeof getPlayerLoadoutCombatModifiers>,
) {
  const make = (
    tone: "good" | "caution" | "warning",
    text: string,
  ): { tone: "good" | "caution" | "warning"; text: string } => ({ tone, text });

  if (archetype === "bulwark") {
    return profile.weaponFamily === "ranged"
      ? make(
          "good",
          "Bulwark read: keep range, chip steadily, avoid long counter trades.",
        )
      : make(
          "caution",
          "Bulwark read: consider ranged pressure or armor-heavy pacing before commit.",
        );
  }
  if (archetype === "skirmisher") {
    return profile.armorMitigationPct >= 12
      ? make(
          "good",
          "Skirmisher read: your armor can absorb spikes; punish during telegraph windows.",
        )
      : make(
          "warning",
          "Skirmisher read: equip more mitigation if possible; skirmisher punishes low armor.",
        );
  }
  return profile.damageBonusPct >= 12
    ? make(
        "good",
        "Warden read: your current rig can race this duel; press clean burst windows.",
      )
    : make("caution", "Warden read: add strike damage in Loadout for faster closes.");
}

function arenaRecommendationToneClasses(tone: "good" | "caution" | "warning") {
  if (tone === "good") {
    return "border-emerald-300/25 bg-emerald-500/10 text-emerald-100/90";
  }
  if (tone === "warning") {
    return "border-rose-300/30 bg-rose-500/15 text-rose-100/90";
  }
  return "border-amber-300/25 bg-amber-500/10 text-amber-100/90";
}

const TOURNAMENT_ROUNDS_M1 = 3;

export default function ArenaMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useGame();
  const { player } = state;

  const modeParam = searchParams.get("mode");
  const arenaMode = useMemo(
    () => parseArenaMatchModeParam(modeParam),
    [modeParam],
  );
  const rankedStakes = arenaModeAppliesRankedStakes(arenaMode);

  const [tournamentRound, setTournamentRound] = useState(1);

  const [enemyArchetype, setEnemyArchetype] = useState<ArenaEnemyArchetypeId>(
    () => rollArenaEnemyArchetype(),
  );
  const [edgeSigilActive, setEdgeSigilActive] = useState(false);

  useEffect(() => {
    setTournamentRound(1);
  }, [arenaMode]);

  const accent = getFactionAccent(player.factionAlignment);

  /* eslint-disable react-hooks/exhaustive-deps -- granular loadout deps only */
  const loadoutMods = useMemo(
    () => getPlayerLoadoutCombatModifiers(player),
    [player.loadoutSlots, player.craftedInventory, player.factionAlignment],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const playerProfile = useMemo(
    () =>
      getPlayerCombatProfile(
        player.factionAlignment,
        player.rankLevel,
        player.condition,
        loadoutMods.attackMultiplier * (edgeSigilActive ? 1.1 : 1),
        loadoutMods.armorMitigationPct + (edgeSigilActive ? 10 : 0),
      ),
    [
      player.factionAlignment,
      player.rankLevel,
      player.condition,
      loadoutMods.attackMultiplier,
      loadoutMods.armorMitigationPct,
      edgeSigilActive,
    ],
  );

  const enemyProfile = useMemo(
    () => getArenaEnemyProfile(player.rankLevel, enemyArchetype),
    [player.rankLevel, enemyArchetype],
  );
  const rigRecommendation = useMemo(
    () => getArenaArchetypeRigRecommendation(enemyArchetype, loadoutMods),
    [enemyArchetype, loadoutMods],
  );

  const rewards = useMemo(() => {
    const base = getMatchRewards(
      player.factionAlignment,
      player.rankLevel,
      player.condition,
    );
    const scaled = scaleArenaRewardsForMode(base, arenaMode);
    const m = getArenaArchetypePayoutMult(enemyArchetype);
    return {
      credits: Math.floor(scaled.credits * m),
      rankXp: Math.floor(scaled.rankXp * m),
      influence: Math.max(0, Math.floor(scaled.influence * m)),
      scrapAlloy: Math.floor(scaled.scrapAlloy * m),
      runeDust: Math.floor(scaled.runeDust * m),
      bioSamples: Math.floor(scaled.bioSamples * m),
      emberCore: Math.floor(scaled.emberCore * m),
    };
  }, [
    player.factionAlignment,
    player.rankLevel,
    player.condition,
    arenaMode,
    enemyArchetype,
  ]);

  const logIdRef = useRef(2);
  const matchResolutionAppliedRef = useRef(false);
  const enemyExchangeCountRef = useRef(0);

  const [playerHp, setPlayerHp] = useState(playerProfile.maxHp);
  const [enemyHp, setEnemyHp] = useState(enemyProfile.maxHp);
  const [phase, setPhase] = useState<CombatPhase>("ready");
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);

  const [lastHitTarget, setLastHitTarget] = useState<HitTarget>(null);
  const [lastHitValue, setLastHitValue] = useState(0);
  const [lastHitCrit, setLastHitCrit] = useState(false);

  const playerHpPercent = clamp((playerHp / playerProfile.maxHp) * 100, 0, 100);
  const enemyHpPercent = clamp((enemyHp / enemyProfile.maxHp) * 100, 0, 100);

  useEffect(() => {
    setCombatLog([
      {
        id: 1,
        text: `Combat link established. ${player.playerName} enters against ${enemyProfile.name}. ${enemyProfile.tagline}`,
      },
    ]);
    if (rankedStakes && player.mythicAscension.arenaEdgeSigils > 0) {
      dispatch({ type: "CONSUME_ARENA_EDGE_SIGIL" });
      setEdgeSigilActive(true);
      setCombatLog((current) => [
        {
          id: getNextLogId(),
          text: "Arena Edge Sigil burns on entry — offense +10%, mitigation +10% this match.",
        },
        ...current,
      ]);
    } else {
      setEdgeSigilActive(false);
    }
    // Opening line only; further entries come from combat + resetCombat.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match seed on mode/entry changes only
  }, [arenaMode]);

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
    const nextArchetype = rollArenaEnemyArchetype();
    const nextEnemy = getArenaEnemyProfile(player.rankLevel, nextArchetype);
    setEnemyArchetype(nextArchetype);
    let sigilApplied = false;
    if (rankedStakes && player.mythicAscension.arenaEdgeSigils > 0) {
      dispatch({ type: "CONSUME_ARENA_EDGE_SIGIL" });
      sigilApplied = true;
    }
    setEdgeSigilActive(sigilApplied);
    setPlayerHp(playerProfile.maxHp);
    setEnemyHp(nextEnemy.maxHp);
    setPhase("ready");
    setRewardsClaimed(false);
    matchResolutionAppliedRef.current = false;
    enemyExchangeCountRef.current = 0;
    if (arenaMode === "tournament") {
      setTournamentRound(1);
    }
    setLastHitTarget(null);
    setLastHitValue(0);
    setLastHitCrit(false);
    setCombatLog([
      {
        id: getNextLogId(),
        text: sigilApplied
          ? `Arena reset complete. Edge Sigil burns — ${nextEnemy.name} steps in (${nextEnemy.tagline}).`
          : `Arena reset complete. ${nextEnemy.name} steps in — ${nextEnemy.tagline}`,
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
        if (arenaMode !== "practice") {
          dispatch({ type: "ADJUST_CONDITION", payload: -6 });
          pushLog("Condition -6 (combat strain)");
        } else {
          pushLog("Practice — condition unchanged.");
        }
        if (rankedStakes) {
          const srWin = getArenaVictorySrDelta(enemyArchetype);
          dispatch({ type: "APPLY_ARENA_RANKED_SR_DELTA", payload: srWin });
          pushLog(`Season SR +${srWin} (${enemyProfile.id} opponent).`);
        }
        if (arenaMode === "tournament") {
          setTournamentRound((r) => Math.min(TOURNAMENT_ROUNDS_M1, r + 1));
          pushLog(
            `Tournament bracket — win banked toward round cap (${TOURNAMENT_ROUNDS_M1} max, M1 shell).`,
          );
        }
        matchResolutionAppliedRef.current = true;
      }

      setPhase("victory");
      pushLog(`${enemyProfile.name} collapses. Arena victory confirmed.`);
      return;
    }

    enemyExchangeCountRef.current += 1;
    const telegraphedCounter =
      enemyExchangeCountRef.current % ARENA_ENEMY_TELEGRAPH_INTERVAL === 0;

    const enemyHit = rollDamage(
      enemyProfile.minDamage,
      enemyProfile.maxDamage,
      enemyProfile.critChance,
      enemyProfile.critMultiplier,
    );

    if (telegraphedCounter) {
      pushLog(
        `${enemyProfile.name} telegraphs a heavy counter — +${Math.round((ARENA_ENEMY_TELEGRAPH_DAMAGE_MULT - 1) * 100)}% impact incoming.`,
      );
    }

    let rawEnemyDamage = enemyHit.damage;
    if (telegraphedCounter) {
      rawEnemyDamage = Math.round(rawEnemyDamage * ARENA_ENEMY_TELEGRAPH_DAMAGE_MULT);
    }
    const damageTaken = Math.max(
      1,
      Math.round(rawEnemyDamage * loadoutMods.incomingDamageMultiplier),
    );
    const mitigated = Math.max(0, rawEnemyDamage - damageTaken);

    const nextPlayerHp = clamp(
      playerHp - damageTaken,
      0,
      playerProfile.maxHp,
    );

    if (enemyHit.isCrit) {
      pushLog(
        mitigated > 0
          ? `${enemyProfile.name} critical counter — ${damageTaken} damage through armor (${mitigated} mitigated).`
          : `${enemyProfile.name} lands a critical counter for ${damageTaken} damage.`,
      );
    } else {
      pushLog(
        mitigated > 0
          ? `${enemyProfile.name} counters for ${damageTaken} damage (${mitigated} mitigated).`
          : `${enemyProfile.name} counters for ${damageTaken} damage.`,
      );
    }

    setPlayerHp(nextPlayerHp);
    showHit("player", damageTaken, enemyHit.isCrit);

    if (nextPlayerHp <= 0) {
      if (!matchResolutionAppliedRef.current) {
        if (arenaMode !== "practice") {
          dispatch({ type: "ADJUST_CONDITION", payload: -10 });
          pushLog("Condition -10 (combat strain)");
        } else {
          pushLog("Practice — condition unchanged.");
        }
        if (rankedStakes) {
          const srLoss = getArenaDefeatSrDelta(enemyArchetype);
          dispatch({ type: "APPLY_ARENA_RANKED_SR_DELTA", payload: srLoss });
          pushLog(`Season SR ${srLoss} (${enemyProfile.id} opponent).`);
        }
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
              Phase 5 · Arena encounter (M1 slice)
            </div>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-white">
              Match Instance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Preparation matters: loadout weapon and armor modify your strike
              band and how much counter damage you actually take. Each reset rolls
              a different opponent archetype. Equip on the{" "}
              <Link
                href="/loadout"
                className="font-semibold text-cyan-200/90 underline-offset-4 hover:text-cyan-100 hover:underline"
              >
                Loadout
              </Link>{" "}
              screen before ranked stakes.
            </p>
            <p
              className={[
                "mt-2 max-w-2xl rounded-lg border px-3 py-2 text-xs",
                arenaRecommendationToneClasses(rigRecommendation.tone),
              ].join(" ")}
            >
              Tactical read: {rigRecommendation.text}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {rankedStakes ? (
              <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-right text-xs text-amber-100/90">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/75">
                  Season 1 SR
                </div>
                <div className="mt-1 font-black text-lg text-white">
                  {player.mythicAscension.arenaRankedSeason1Rating}
                </div>
                <div className="mt-1 text-[11px] text-amber-100/80">
                  Edge sigils: {player.mythicAscension.arenaEdgeSigils}
                </div>
                {edgeSigilActive ? (
                  <div className="mt-1 rounded-md border border-violet-300/35 bg-violet-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
                    Edge active
                  </div>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => router.push("/arena")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
            >
              Return to Arena
            </button>
          </div>
        </div>

        <div
          className={[
            "rounded-[20px] border px-5 py-4 text-sm",
            arenaMode === "practice"
              ? "border-sky-400/25 bg-sky-950/25 text-sky-100/90"
              : arenaMode === "tournament"
                ? "border-violet-400/25 bg-violet-950/20 text-violet-100/88"
                : "border-rose-400/25 bg-rose-950/20 text-rose-100/88",
          ].join(" ")}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Active stakes · {arenaModeLabel(arenaMode)}
          </div>
          <p className="mt-2 leading-relaxed">
            {arenaMode === "practice" ? (
              <>
                <span className="font-semibold text-white/95">Practice lane.</span> Rewards
                run at ~{Math.round(ARENA_PRACTICE_REWARD_MULT * 100)}% of ranked values, then an
                archetype payout tweak. No condition loss and no SR change on win or loss.
                Telegraph counters still apply for training muscle memory.
              </>
            ) : arenaMode === "tournament" ? (
              <>
                <span className="font-semibold text-white/95">Tournament shell (M1).</span>{" "}
                Same stakes as ranked: −6 / −10 condition; SR +12–+18 on wins and −14–−10 on
                losses by opponent archetype; every 3rd enemy counter is a{" "}
                <span className="italic text-white/85">telegraphed</span> surge (+22% raw
                before armor).
              </>
            ) : (
              <>
                <span className="font-semibold text-white/95">Ranked lane.</span> Victory
                imposes light strain (−6 condition); SR +12 (skirmisher) → +18 (bulwark).
                Defeat: −10 condition; SR −14 (skirmisher) → −10 (bulwark). Telegraph
                rhythm: every 3rd counter hits harder (+22% raw). Payouts include a light
                archetype multiplier (bulwark slightly richer).
              </>
            )}
          </p>
          {arenaMode === "tournament" ? (
            <div className="mt-3 rounded-xl border border-violet-400/25 bg-black/30 px-4 py-3 text-xs text-violet-100/88">
              <span className="font-bold uppercase tracking-[0.14em] text-violet-200/80">
                Bracket (M1)
              </span>
              <div className="mt-1.5">
                Display round <span className="font-black text-white">{tournamentRound}</span> of{" "}
                <span className="font-black text-white">{TOURNAMENT_ROUNDS_M1}</span> — wins
                advance the counter; reset combat clears the shell.
              </div>
              {tournamentRound >= TOURNAMENT_ROUNDS_M1 && phase === "victory" ? (
                <div className="mt-2 font-semibold text-emerald-200/90">
                  Round cap reached for this session (display-only progression).
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-950/20 px-5 py-4 text-sm text-cyan-100/85">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/70">
            Loadout snapshot
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <span>
              Weapon doctrine:{" "}
              <span className="font-bold text-white/90">
                {loadoutMods.weaponFamily === "ranged" ? "Ranged" : "Melee"}
              </span>
            </span>
            <span>
              Strike scaling:{" "}
              <span className="font-bold text-emerald-200/90">
                ×{loadoutMods.attackMultiplier.toFixed(2)}
              </span>
            </span>
            <span>
              Armor mitigation:{" "}
              <span className="font-bold text-sky-200/90">
                {loadoutMods.armorMitigationPct}%
              </span>
            </span>
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
                    {formatFactionLabel(player.factionAlignment)}
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
                      {enemyProfile.tagline}
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-amber-200/78">
                      Telegraph cadence: every {ARENA_ENEMY_TELEGRAPH_INTERVAL}rd enemy counter
                      is flagged in the log and hits +{Math.round((ARENA_ENEMY_TELEGRAPH_DAMAGE_MULT - 1) * 100)}% raw before
                      armor.
                    </p>
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

                  {arenaMode === "practice" ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-emerald-200/75">
                      Practice tier — values are ~{Math.round(ARENA_PRACTICE_REWARD_MULT * 100)}% of
                      ranked payouts (see stakes banner).
                    </p>
                  ) : null}

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
