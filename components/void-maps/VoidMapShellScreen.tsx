"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import {
  buildSpawnEncounter,
  type SpawnEncounter,
} from "@/features/void-maps/spawnSim";
import {
  DEFAULT_HOME_DEPLOY_ZONE_ID,
  voidZones,
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { useVoidRealtimeSession } from "@/components/void-maps/useVoidRealtimeSession";
import {
  getContributionProfessionHint,
  getContributionRole,
} from "@/features/void-maps/realtime/contributionScoring";
import {
  hasStabilizationSigil,
  RUNE_CRAFTER_STABILIZATION_SIGIL_COST,
} from "@/features/status/statusRecovery";
import { MOSS_RATION_RECIPE_COST } from "@/features/status/survival";
import type {
  MobEntity,
  PlayerPresence,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";

const SPAWN_HISTORY_LIMIT = 7;
/** Same AFK hunting-ground contract as the home deploy button. */
const DEFAULT_DEPLOY_HG_MISSION_ID = "hg-rustfang-prowl";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

function hashStringToInt(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function ZoneActivity({
  zoneId,
  huntStatus,
  threatBand,
  zoneLabel,
  isViewingAllocated,
  multiplayerEnabled,
  connected,
  realtimeMobs,
  realtimePlayers,
  recentCombatEvents,
  selfClientId,
  sendMove,
  sendAttack,
}: {
  zoneId: VoidZoneId;
  huntStatus: "running" | "complete" | null;
  threatBand: "low" | "medium" | "high";
  zoneLabel: string;
  isViewingAllocated: boolean;
  multiplayerEnabled: boolean;
  connected: boolean;
  realtimeMobs: MobEntity[];
  realtimePlayers: PlayerPresence[];
  recentCombatEvents: Array<{
    mobEntityId: string;
    attackerClientId: string;
    damage: number;
    isCrit: boolean;
    ts: number;
  }>;
  selfClientId: string;
  sendMove: (x: number, y: number) => void;
  sendAttack: (mobEntityId: string) => void;
}) {
  const isRunning = huntStatus === "running";
  const spawnIntervalMs =
    threatBand === "high" ? 2800 : threatBand === "medium" ? 4000 : 5500;
  const [spawnHistory, setSpawnHistory] = useState<SpawnEncounter[]>(() => [
    buildSpawnEncounter(zoneId, Date.now()),
  ]);

  const lastWave = spawnHistory[0];

  useEffect(() => {
    if (multiplayerEnabled) return;
    if (huntStatus !== "running") {
      return;
    }

    const interval = window.setInterval(() => {
      setSpawnHistory((prev) => {
        const next = buildSpawnEncounter(zoneId, Date.now());
        return [next, ...prev].slice(0, SPAWN_HISTORY_LIMIT);
      });
    }, spawnIntervalMs);

    return () => window.clearInterval(interval);
  }, [multiplayerEnabled, huntStatus, zoneId, spawnIntervalMs]);

  const markerClasses =
    threatBand === "high"
      ? "border-red-400/45 bg-red-500/15 text-red-100"
      : threatBand === "medium"
        ? "border-amber-400/45 bg-amber-500/14 text-amber-50"
        : "border-emerald-400/35 bg-emerald-500/10 text-emerald-100";

  const realtimeSelf = multiplayerEnabled
    ? (realtimePlayers.find((p) => p.clientId === selfClientId) ?? null)
    : null;

  const realtimeLastWave = multiplayerEnabled ? realtimeMobs[0] : null;
  const playerNameById = useMemo(() => {
    return new Map(realtimePlayers.map((p) => [p.clientId, p.playerName]));
  }, [realtimePlayers]);

  const mobLabelById = useMemo(() => {
    return new Map(realtimeMobs.map((m) => [m.mobEntityId, m.mobLabel]));
  }, [realtimeMobs]);

  const factionMarkerClasses = useCallback(
    (faction: PlayerPresence["factionAlignment"]) => {
      switch (faction) {
        case "bio":
          return {
            border: "border-emerald-300/30",
            bg: "bg-emerald-500/10",
            text: "text-emerald-100",
          };
        case "mecha":
          return {
            border: "border-cyan-300/30",
            bg: "bg-cyan-500/10",
            text: "text-cyan-100",
          };
        case "pure":
          return {
            border: "border-fuchsia-300/30",
            bg: "bg-fuchsia-500/10",
            text: "text-fuchsia-100",
          };
        default:
          return {
            border: "border-white/12",
            bg: "bg-white/[0.06]",
            text: "text-white/70",
          };
      }
    },
    [],
  );

  const pressedKeysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const selfPosRef = useRef<{ x: number; y: number }>({
    x: realtimeSelf?.x ?? 50,
    y: realtimeSelf?.y ?? 50,
  });
  const mobsRef = useRef<MobEntity[]>(realtimeMobs);
  const canAttackRef = useRef(isRunning);
  const attackCooldownUntilRef = useRef(0);

  useEffect(() => {
    if (!multiplayerEnabled) return;
    mobsRef.current = realtimeMobs;
  }, [multiplayerEnabled, realtimeMobs]);

  useEffect(() => {
    if (!multiplayerEnabled) return;
    canAttackRef.current = isRunning;
  }, [multiplayerEnabled, isRunning]);

  useEffect(() => {
    if (!multiplayerEnabled) return;
    selfPosRef.current = {
      x: realtimeSelf?.x ?? 50,
      y: realtimeSelf?.y ?? 50,
    };
  }, [multiplayerEnabled, realtimeSelf?.x, realtimeSelf?.y]);

  useEffect(() => {
    if (!multiplayerEnabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w")
        pressedKeysRef.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s")
        pressedKeysRef.current.down = true;
      if (e.key === "ArrowLeft" || e.key === "a")
        pressedKeysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d")
        pressedKeysRef.current.right = true;

      if (e.code === "Space") {
        e.preventDefault();
        if (!canAttackRef.current) return;
        if (!connected) return;
        if (Date.now() < attackCooldownUntilRef.current) return;

        const mobs = mobsRef.current;
        const selfPos = selfPosRef.current;
        const radiusPct = 8;
        const radiusSq = radiusPct * radiusPct;

        let best: MobEntity | null = null;
        let bestDistSq = Number.POSITIVE_INFINITY;

        for (const mob of mobs) {
          if (mob.hp <= 0) continue;
          const dx = mob.x - selfPos.x;
          const dy = mob.y - selfPos.y;
          const distSq = dx * dx + dy * dy;
          if (distSq <= radiusSq && distSq < bestDistSq) {
            best = mob;
            bestDistSq = distSq;
          }
        }

        if (best) {
          sendAttack(best.mobEntityId);
          attackCooldownUntilRef.current = Date.now() + 600;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w")
        pressedKeysRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s")
        pressedKeysRef.current.down = false;
      if (e.key === "ArrowLeft" || e.key === "a")
        pressedKeysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d")
        pressedKeysRef.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown as EventListener);
      window.removeEventListener("keyup", onKeyUp as EventListener);
    };
  }, [multiplayerEnabled, connected, sendAttack]);

  useEffect(() => {
    if (!multiplayerEnabled) return;

    const intervalMs = 80;
    const speedPctPerSecond = 26;

    const interval = window.setInterval(() => {
      const keys = pressedKeysRef.current;
      const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      const dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);

      if (dx === 0 && dy === 0) return;

      const len = Math.hypot(dx, dy) || 1;
      const ndx = dx / len;
      const ndy = dy / len;

      const dt = intervalMs / 1000;
      const selfPos = selfPosRef.current;
      const nextX = clamp(selfPos.x + ndx * speedPctPerSecond * dt, 2, 98);
      const nextY = clamp(selfPos.y + ndy * speedPctPerSecond * dt, 2, 98);

      selfPosRef.current = { x: nextX, y: nextY };
      sendMove(nextX, nextY);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [multiplayerEnabled, sendMove]);

  const showMultiplayerUI = multiplayerEnabled;
  const showMapAndList = showMultiplayerUI || isRunning;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">
        Zone: {zoneLabel}
        {isViewingAllocated ? " (allocated)" : ""}
      </div>
      <div className="text-sm font-semibold text-white">
        Threat: {threatBand.toUpperCase()} · Cadence:{" "}
        {Math.round(spawnIntervalMs / 100) / 10}s
      </div>
      {threatBand === "high" ? (
        <div className="text-xs font-semibold text-red-100/80">
          Special zone: boss encounters possible later
        </div>
      ) : null}
      {isRunning && (showMultiplayerUI ? realtimeLastWave : lastWave) ? (
        <div className="text-sm font-semibold text-cyan-100/90">
          Last wave:{" "}
          {showMultiplayerUI && realtimeLastWave
            ? `${realtimeLastWave.mobLabel} · x${realtimeLastWave.packSize}`
            : lastWave
              ? `${lastWave.mobLabel} · x${lastWave.packSize}`
              : ""}
        </div>
      ) : null}

      {showMultiplayerUI && isRunning && realtimeMobs.length > 0
        ? (() => {
            const visible = realtimeMobs.slice(0, 6);
            const allDown = visible.every((m) => m.hp <= 0);
            if (!allDown) return null;
            return (
              <div className="text-sm font-semibold text-emerald-100/85">
                Visible wave cleared. Awaiting next spawn.
              </div>
            );
          })()
        : null}

      {!isRunning ? (
        <div className="rounded-xl border border-white/12 bg-black/20 px-4 py-5 text-sm text-white/65">
          {showMultiplayerUI
            ? huntStatus === "complete"
              ? "Payout resolving—spawn waves paused."
              : "Spawn waves are locked until the hunt timer is running."
            : huntStatus === "complete"
              ? "Payout resolving—spawn waves paused."
              : "Spawn waves are locked until the hunt timer is running."}
        </div>
      ) : null}

      {showMapAndList ? (
        <>
          <div className="relative h-[300px] overflow-hidden rounded-xl border border-white/12 bg-black/25">
            {/* lightweight arena grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />

            {showMultiplayerUI ? (
              <>
                {/* players */}
                {realtimePlayers.map((p) => {
                  const isSelf = p.clientId === selfClientId;
                  const tone = factionMarkerClasses(p.factionAlignment);
                  return (
                    <div
                      key={p.clientId}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${tone.border} ${tone.bg} ${tone.text}`}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        zIndex: isSelf ? 20 : 10,
                      }}
                      title={p.playerName}
                    >
                      <div className="flex h-10 w-10 items-center justify-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.06em]">
                          {isSelf ? "You" : p.playerName.slice(0, 4)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* mobs */}
                {realtimeMobs.slice(0, 6).map((mob) => {
                  const hpPct = mob.maxHp > 0 ? (mob.hp / mob.maxHp) * 100 : 0;
                  const isBoss = mob.mobLabel === "Void Boss";
                  return (
                    <div
                      key={mob.mobEntityId}
                      role="button"
                      tabIndex={0}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                        isBoss
                          ? "border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-100"
                          : markerClasses
                      } ${mob.hp > 0 ? "opacity-100" : "opacity-40"}`}
                      style={{ left: `${mob.x}%`, top: `${mob.y}%` }}
                      title={`${mob.mobLabel} (x${mob.packSize}) HP ${Math.round(hpPct)}%`}
                      onClick={() => {
                        if (!isRunning) return;
                        sendAttack(mob.mobEntityId);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center px-2 pb-1 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.06em]">
                          {mob.hp <= 0 ? "DOWN" : `x${mob.packSize}`}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.08em] text-white/55">
                          {mob.hp <= 0 ? "" : `${Math.round(hpPct)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {/* player marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22),rgba(56,189,248,0)_60%)] blur-[1px]" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold uppercase tracking-[0.08em]">
                      You
                    </div>
                  </div>
                </div>

                {/* mob markers for recent spawn entries */}
                {spawnHistory.slice(0, 6).map((entry, idx) => {
                  const seed = `${entry.mobId}-${entry.spawnedAt}-${idx}`;
                  const h1 = hashStringToInt(seed);
                  const h2 = hashStringToInt(`${seed}-b`);
                  const x = 10 + (h1 % 81); // 10..90
                  const y = 12 + (h2 % 76); // 12..88

                  return (
                    <div
                      key={`${entry.spawnedAt}-${entry.mobId}-${idx}-marker`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${markerClasses}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${entry.mobLabel} (x${entry.packSize})`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.06em]">
                          x{entry.packSize}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {showMultiplayerUI ? (
            <div className="space-y-2">
              {realtimeMobs.map((mob) => {
                const hpPct = mob.maxHp > 0 ? (mob.hp / mob.maxHp) * 100 : 0;
                const isBoss = mob.mobLabel === "Void Boss";
                return (
                  <div
                    key={mob.mobEntityId}
                    className="flex items-center justify-between rounded-xl border border-white/12 bg-black/30 px-4 py-3"
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                        Wave {mob.waveIndex}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        {mob.mobLabel}
                        {isBoss ? (
                          <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
                            Boss
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                        Spawned {formatTime(mob.spawnedAt)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="text-sm font-black text-cyan-100">
                        x{mob.packSize}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                        {mob.hp <= 0 ? "DOWN" : `HP ${Math.round(hpPct)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {spawnHistory.map((entry, idx) => (
                <div
                  key={`${entry.spawnedAt}-${entry.mobId}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-white/12 bg-black/30 px-4 py-3"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                      Wave {idx + 1}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {entry.mobLabel}
                    </div>
                    <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                      Spawned {formatTime(entry.spawnedAt)}
                    </div>
                  </div>
                  <div className="text-sm font-black text-cyan-100">
                    x{entry.packSize}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showMultiplayerUI && isRunning && recentCombatEvents.length > 0 ? (
            <div className="rounded-xl border border-white/12 bg-black/30 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                Recent impacts
              </div>
              <div className="mt-3 space-y-2">
                {recentCombatEvents.slice(0, 4).map((ev) => {
                  const attackerName =
                    ev.attackerClientId === selfClientId
                      ? "You"
                      : (playerNameById.get(ev.attackerClientId) ??
                        "Operative");
                  const mobLabel =
                    mobLabelById.get(ev.mobEntityId) ?? ev.mobEntityId;
                  return (
                    <div
                      key={`${ev.attackerClientId}-${ev.mobEntityId}-${ev.ts}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="text-xs text-white/75">
                        {attackerName} hit {mobLabel}
                      </div>
                      <div className="text-xs font-semibold text-cyan-100/90">
                        {ev.damage}
                        {ev.isCrit ? "!" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showMultiplayerUI && !connected ? (
            <div className="text-xs text-white/55">
              Realtime signal: connecting...
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default function VoidMapShellScreen() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const zoneQuery = searchParams.get("zone");
  const bucketQuery = searchParams.get("bucket");
  const deployIntroFlag = searchParams.get("deployIntro");
  const initialZoneId: VoidZoneId =
    zoneQuery && Object.prototype.hasOwnProperty.call(voidZoneById, zoneQuery)
      ? (zoneQuery as VoidZoneId)
      : DEFAULT_HOME_DEPLOY_ZONE_ID;
  const sessionBucketId =
    bucketQuery && Number.isFinite(Number(bucketQuery))
      ? Number(bucketQuery)
      : 0;

  const [showDeployIntro, setShowDeployIntro] = useState(
    deployIntroFlag === "1",
  );

  useEffect(() => {
    if (deployIntroFlag !== "1") return;

    const t = window.setTimeout(() => {
      setShowDeployIntro(false);
    }, 5200);

    return () => window.clearTimeout(t);
  }, [deployIntroFlag]);

  const [activeZoneId, setActiveZoneId] = useState<VoidZoneId>(initialZoneId);
  const allocatedZone = voidZoneById[initialZoneId];

  // Keep the preview selection in sync with the URL when we redeploy.
  useEffect(() => {
    setActiveZoneId(initialZoneId);
  }, [initialZoneId]);

  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const isQueueFull = missionQueue.length >= state.player.maxMissionQueueSlots;
  const activeHuntProcess =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;

  const isHuntRunning = activeHuntProcess?.status === "running";
  const huntStatus: "running" | "complete" | null = activeHuntProcess
    ? (activeHuntProcess.status as "running" | "complete")
    : null;
  const huntEndsAt = activeHuntProcess?.endsAt ?? null;
  const effectiveZoneId: VoidZoneId = isHuntRunning
    ? allocatedZone.id
    : activeZoneId;
  const zone = voidZoneById[effectiveZoneId];
  const multiplayerEnabled = effectiveZoneId === allocatedZone.id;
  const playerCondition = state.player.condition;
  const isRecommended = playerCondition >= zone.recommendedCondition;
  const activePreviewZone = voidZoneById[activeZoneId];
  const isSelectedZoneUnlocked =
    state.player.rankLevel >= activePreviewZone.threatLevel;
  const nextLockedZone = voidZones
    .filter((z) => state.player.rankLevel < z.threatLevel)
    .sort((a, b) => a.threatLevel - b.threatLevel)[0];

  const realtime = useVoidRealtimeSession({
    enabled: multiplayerEnabled,
    zoneId: allocatedZone.id,
    sessionBucketId,
    playerProfile: {
      playerName: state.player.playerName,
      factionAlignment: state.player.factionAlignment,
      rankLevel: state.player.rankLevel,
      condition: state.player.condition,
      zoneMasteryForZone: state.player.zoneMastery[allocatedZone.id] ?? 0,
    },
    huntStatus,
    huntEndsAt,
  });

  const lastHuntResult = state.player.lastHuntResult;
  const realtimeBonusAppliedForLastResolvedAt =
    lastHuntResult !== null &&
    lastHuntResult.realtimeContributionAppliedForResolvedAt ===
      lastHuntResult.resolvedAt &&
    lastHuntResult.realtimeContributionBonusMultiplier !== null;

  const canCraftMossRation =
    state.player.resources.bioSamples >= MOSS_RATION_RECIPE_COST.bioSamples &&
    state.player.resources.runeDust >= MOSS_RATION_RECIPE_COST.runeDust;

  const stabilizationSigilCrafted = hasStabilizationSigil(
    state.player.knownRecipes,
  );
  const canCraftStabilizationSigil =
    !stabilizationSigilCrafted &&
    state.player.resources.credits >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits &&
    state.player.resources.runeDust >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust &&
    state.player.resources.emberCore >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore;

  const canRedeployToSelectedZone =
    !isHuntRunning &&
    isSelectedZoneUnlocked &&
    (lastHuntResult === null || realtimeBonusAppliedForLastResolvedAt);

  function handleRedeployIntoSelectedZone() {
    // Safety: only allow redeploy when we are not currently running a realtime hunt
    // and the previous hunt's realtime bonus has been fully applied.
    if (!canRedeployToSelectedZone) return;

    const targetZoneId = activeZoneId;

    dispatch({
      type: "QUEUE_MISSION",
      payload: { missionId: DEFAULT_DEPLOY_HG_MISSION_ID },
    });

    const SESSION_BUCKET_MS = 2 * 60 * 1000;
    const nextBucketId = Math.floor(Date.now() / SESSION_BUCKET_MS);

    router.push(
      `/bazaar/void-map?zone=${targetZoneId}&bucket=${nextBucketId}&deployIntro=1`,
    );
  }

  const selfHuntContribution = useMemo(() => {
    if (!realtime.huntContributionResult) return null;
    const { perPlayer, resolvedAt } = realtime.huntContributionResult;
    if (resolvedAt === null) return null;
    const self = perPlayer.find((p) => p.clientId === realtime.selfClientId);
    if (!self) return null;
    return {
      resolvedAt,
      bonusMultiplier: self.bonusMultiplier,
      totalDamageDealt: self.totalDamage,
      totalHitsLanded: self.totalHits,
      mobsContributedTo: self.mobsContributedTo,
      mobsKilled: self.mobsKilled,
      bossDefeated: self.bossDefeated,
      bossDropResourcesBase: self.bossDropResourcesBase,
    };
  }, [realtime.huntContributionResult, realtime.selfClientId]);

  useEffect(() => {
    if (!selfHuntContribution) return;
    if (!state.player.lastHuntResult) return;
    if (
      state.player.lastHuntResult.resolvedAt !== selfHuntContribution.resolvedAt
    ) {
      return;
    }

    dispatch({
      type: "APPLY_REALTIME_HUNT_BONUS",
      payload: {
        resolvedAt: selfHuntContribution.resolvedAt,
        bonusMultiplier: selfHuntContribution.bonusMultiplier,
        zoneId: allocatedZone.id,
        totalDamageDealt: selfHuntContribution.totalDamageDealt,
        totalHitsLanded: selfHuntContribution.totalHitsLanded,
        mobsContributedTo: selfHuntContribution.mobsContributedTo,
        mobsKilled: selfHuntContribution.mobsKilled,
        bossDefeated: selfHuntContribution.bossDefeated,
        bossDropResourcesBase: selfHuntContribution.bossDropResourcesBase,
        zoneThreatLevel: allocatedZone.threatLevel,
      },
    });
  }, [
    dispatch,
    selfHuntContribution,
    state.player.lastHuntResult,
    allocatedZone.threatLevel,
    allocatedZone.id,
  ]);

  const stateLine = useMemo(() => {
    if (activeHuntProcess?.status === "running") {
      return "Hunt simulation active";
    }
    if (activeHuntProcess?.status === "complete") {
      return "Hunt payout resolving";
    }
    return "No active hunt in timer queue";
  }, [activeHuntProcess]);

  const spawnWavesLine =
    activeHuntProcess?.status === "running" ? "RUNNING" : "PAUSED";

  return (
    <main
      className={`relative min-h-screen px-6 py-10 text-white md:px-10 ${zone.backdropClassName}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {showDeployIntro ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50 px-6 pt-6">
            <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-xl border border-cyan-300/25 bg-black/55 p-4 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-2xl">
                    !
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">
                      Void Entry
                    </div>
                    <div className="mt-1 text-lg font-black text-white">
                      Deploy into the shared hunt
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Farm mobs in realtime with others. Your reward is still
                      the AFK baseline, then improved by your shared combat
                      contribution.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-sm text-white/75">
                <div>
                  Control tip: press{" "}
                  <span className="font-semibold text-white">Space</span> to
                  attack the nearest mob in range.
                </div>
                <div>
                  Strategy: after this contract resolves, redeploy into a
                  different zone shell to pursue new drops.
                </div>
                <div>
                  Boss planning: higher-threat zones are where special
                  encounters will land later. Keep an eye on the threat bands.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <ScreenHeader
          eyebrow="Void Deployment / Map Shell"
          title={zone.label}
          subtitle="Home deploy now allocates you into a live zone shell. Spawn waves are simulated by zone profile while the hunt queue runs."
        />

        <div className="rounded-2xl border border-white/12 bg-black/25 px-5 py-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Allocated zone
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {allocatedZone.label} · {allocatedZone.threatBand.toUpperCase()}{" "}
            threat
          </div>
          <div className="mt-2 text-xs text-white/60">
            Threat Level: {zone.threatLevel}
          </div>
          <div className="mt-1 text-xs">
            {isRecommended ? (
              <span className="text-green-400">Recommended</span>
            ) : (
              <span className="text-red-400">High Risk</span>
            )}
          </div>
          {zone.category === "special" ? (
            <div className="mt-1 text-xs text-fuchsia-400">Boss Zone</div>
          ) : null}
          <div className="mt-1 text-xs text-white/50">
            Mastery: {state.player.zoneMastery[zone.id] ?? 0}
          </div>
          <div className="mt-1 text-xs text-white/50">
            Current Streak: {state.player.zoneRunStreak}
          </div>
          {state.player.lastCompletedZoneId !== null ? (
            state.player.lastCompletedZoneId === activeZoneId ? (
              <div className="mt-1 text-xs text-green-400">
                Stay here to build streak
              </div>
            ) : (
              <div className="mt-1 text-xs text-red-400">
                Switching zones resets streak
              </div>
            )
          ) : null}
          {(() => {
            const mastery = state.player.zoneMastery[zone.id] ?? 0;
            const masteryExtraBossChance = clamp(mastery * 0.01, 0, 0.2);
            const tierStep = 5;
            const nextTierTarget =
              (Math.floor(mastery / tierStep) + 1) * tierStep;
            const remainingToNextTier = Math.max(0, nextTierTarget - mastery);
            return (
              <div className="mt-1 text-xs text-white/45">
                Boss Nudge (estimate):{" "}
                {Math.round(masteryExtraBossChance * 100)}%
                <div className="mt-1 text-white/40">
                  Next Mastery Goal: {nextTierTarget} (+{remainingToNextTier})
                </div>
              </div>
            );
          })()}
          {nextLockedZone ? (
            <div className="mt-1 text-xs text-white/55">
              Next unlock: {nextLockedZone.label} at Rank{" "}
              {nextLockedZone.threatLevel}
            </div>
          ) : (
            <div className="mt-1 text-xs text-white/55">All zones unlocked</div>
          )}
          <div className="mt-2 text-sm text-white/60">
            {effectiveZoneId === allocatedZone.id
              ? "You are viewing the allocated zone."
              : `Previewing: ${zone.label}. Zone switching only changes the spawn feed simulation.`}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {voidZones.map((z) => {
            const isActive = z.id === effectiveZoneId;
            const isAllocated = z.id === allocatedZone.id;
            const isUnlockedByRank = state.player.rankLevel >= z.threatLevel;
            const isLocked = !isUnlockedByRank && !isAllocated;
            const zoneMasteryVal = state.player.zoneMastery[z.id] ?? 0;
            const canSwitch =
              (!isHuntRunning || isAllocated) &&
              (isAllocated || isUnlockedByRank);

            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setActiveZoneId(z.id)}
                disabled={!canSwitch}
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-50"
                    : isAllocated
                      ? "border-amber-300/40 bg-amber-300/10 text-amber-50"
                      : isUnlockedByRank
                        ? "border-white/12 bg-black/25 text-white/75 hover:border-white/20 hover:text-white"
                        : "border-white/10 bg-black/25 text-white/45 hover:text-white/55",
                  !canSwitch ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <span>
                  {z.label} · {z.threatBand.toUpperCase()}
                </span>
                {isAllocated ? (
                  <span className="ml-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-50">
                    Allocated
                  </span>
                ) : null}
                {isLocked ? (
                  <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                    Locked
                  </span>
                ) : null}
                {zoneMasteryVal > 0 ? (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                    Mastery {zoneMasteryVal}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {isHuntRunning ? (
          <div className="mt-2 text-xs text-white/55">
            Zone preview is locked while the hunt runs; only the allocated zone
            stays live.
          </div>
        ) : null}

        {!isHuntRunning ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleRedeployIntoSelectedZone}
              disabled={!canRedeployToSelectedZone}
              className={[
                "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                canRedeployToSelectedZone
                  ? "border-fuchsia-400/35 bg-fuchsia-400/10 text-fuchsia-100 hover:border-fuchsia-300/45 hover:bg-fuchsia-400/16"
                  : "cursor-not-allowed border-white/12 bg-black/25 text-white/55",
              ].join(" ")}
            >
              Redeploy
            </button>

            <button
              type="button"
              onClick={() => router.push("/home")}
              className="rounded-xl border border-white/12 bg-black/25 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-white"
            >
              Return to Hub
            </button>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/12 bg-black/35 px-5 py-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Deployment state
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {stateLine}
          </div>
          <div className="mt-2 text-sm text-white/65">
            Threat: {zone.threatBand.toUpperCase()} · Queue:{" "}
            {missionQueue.length}/{state.player.maxMissionQueueSlots}
          </div>
          <div className="mt-2 text-sm text-white/65">
            Spawn waves: {spawnWavesLine}
          </div>
          {state.player.lastHuntResult &&
          state.player.lastHuntResult
            .realtimeContributionAppliedForResolvedAt ===
            state.player.lastHuntResult.resolvedAt &&
          state.player.lastHuntResult.realtimeContributionBonusMultiplier !==
            null
            ? (() => {
                const latest = state.player.lastHuntResult!;
                const baseRank = latest.baseRankXpGained ?? latest.rankXpGained;
                const baseCredits = latest.baseResourcesGained?.credits ?? 0;
                const bonusMultiplier =
                  latest.realtimeContributionBonusMultiplier ?? 0;
                const bonusRank = latest.realtimeRankXpBonusGained ?? 0;
                const bonusCredits =
                  latest.realtimeResourcesBonusGained?.credits ?? 0;
                const finalRank = latest.rankXpGained ?? baseRank;
                const finalCredits =
                  latest.resourcesGained?.credits ?? baseCredits;
                const realtimeTotalDamageDealt =
                  latest.realtimeTotalDamageDealt ?? 0;
                const realtimeTotalHitsLanded =
                  latest.realtimeTotalHitsLanded ?? 0;
                const realtimeMobsContributedTo =
                  latest.realtimeMobsContributedTo ?? 0;
                const realtimeMobsKilled = latest.realtimeMobsKilled ?? 0;

                const contributionRole = getContributionRole({
                  totalDamage: realtimeTotalDamageDealt,
                  totalHits: realtimeTotalHitsLanded,
                  mobsContributedTo: realtimeMobsContributedTo,
                  mobsKilled: realtimeMobsKilled,
                });

                const contributionProfessionHint =
                  getContributionProfessionHint({
                    totalDamage: realtimeTotalDamageDealt,
                    totalHits: realtimeTotalHitsLanded,
                    mobsContributedTo: realtimeMobsContributedTo,
                    mobsKilled: realtimeMobsKilled,
                  });

                return (
                  <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">
                      Realtime contribution bonus
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-white/75">
                      <div>
                        Rank XP: Base +{baseRank} · Bonus +{bonusRank} · Final +
                        {finalRank}
                      </div>
                      <div>
                        Credits: Base +{baseCredits} · Bonus +{bonusCredits} ·
                        Final +{finalCredits}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/55">
                      Multiplier: +{Math.round(bonusMultiplier * 100)}%
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-white/75">
                      <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/60">
                        Field Role (Realtime)
                      </div>
                      <div className="text-sm font-semibold text-white/85">
                        {contributionRole}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        Specialization Hint: {contributionProfessionHint}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        Damage +{realtimeTotalDamageDealt} · Hits{" "}
                        {realtimeTotalHitsLanded} · Contrib{" "}
                        {realtimeMobsContributedTo} · Kills {realtimeMobsKilled}
                      </div>
                    </div>
                  </div>
                );
              })()
            : null}

          {state.player.lastHuntResult &&
          state.player.lastHuntResult
            .realtimeContributionAppliedForResolvedAt ===
            state.player.lastHuntResult.resolvedAt &&
          state.player.lastHuntResult.realtimeContributionBonusMultiplier !==
            null
            ? (() => {
                const latest = state.player.lastHuntResult!;
                const lastHuntResult = latest;
                const kills = lastHuntResult.kills ?? 0;
                const damage = lastHuntResult.damage ?? 0;
                const bossDefeated = lastHuntResult.bossDefeated ?? false;

                const bio = lastHuntResult.resourcesGained?.bioSamples ?? 0;
                const mecha = lastHuntResult.resourcesGained?.scrapAlloy ?? 0;
                const spirit = lastHuntResult.resourcesGained?.runeDust ?? 0;

                // Readable, non-linear run rating: encourages pushing damage while valuing boss presence.
                const score =
                  kills * 120 +
                  Math.round(damage / 10) +
                  (bossDefeated ? 600 : 0);

                const rating =
                  score >= 2400
                    ? "S"
                    : score >= 1600
                      ? "A"
                      : score >= 900
                        ? "B"
                        : "C";

                const ratingTone =
                  rating === "S"
                    ? "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100"
                    : rating === "A"
                      ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                      : rating === "B"
                        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-white/70";

                const bossImpactLine = bossDefeated
                  ? "Void Boss impact: special-zone drop secured."
                  : "No boss impact this run: focus on damage + contribution.";

                return (
                  <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-4">
                    <div className="text-sm font-semibold text-white mb-2">
                      Run Complete
                    </div>

                    <div
                      className={[
                        "mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]",
                        ratingTone,
                      ].join(" ")}
                    >
                      Run Rating: {rating}
                    </div>

                    <div className="text-xs text-white/60 mb-2">
                      {bossImpactLine}
                    </div>

                    <div className="text-xs text-white/70 space-y-1">
                      <div>
                        Kills:{" "}
                        <span className="text-white/85 font-semibold">
                          {kills}
                        </span>
                      </div>
                      <div>
                        Damage:{" "}
                        <span className="text-white/85 font-semibold">
                          {Math.round(damage)}
                        </span>
                      </div>
                      <div>
                        Boss:{" "}
                        <span className="text-white/85 font-semibold">
                          {bossDefeated ? "Defeated" : "None"}
                        </span>
                      </div>

                      <div className="mt-2 text-white/60">Resources:</div>
                      <div>
                        Bio:{" "}
                        <span
                          className={
                            bio > 0
                              ? "text-emerald-200 font-semibold"
                              : "text-white/50"
                          }
                        >
                          +{bio}
                        </span>
                      </div>
                      <div>
                        Mecha:{" "}
                        <span
                          className={
                            mecha > 0
                              ? "text-cyan-200 font-semibold"
                              : "text-white/50"
                          }
                        >
                          +{mecha}
                        </span>
                      </div>
                      <div>
                        Spirit:{" "}
                        <span
                          className={
                            spirit > 0
                              ? "text-fuchsia-200 font-semibold"
                              : "text-white/50"
                          }
                        >
                          +{spirit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/50">
                      Zone Mastery (this zone):{" "}
                      {state.player.zoneMastery[allocatedZone.id] ?? 0}
                    </div>

                    <div className="mt-1 text-xs text-white/50">
                      Zone Streak: {state.player.zoneRunStreak}
                    </div>
                    {(() => {
                      const streak = state.player.zoneRunStreak ?? 0;
                      const streakBonusPct =
                        streak >= 5 ? 0.1 : streak >= 3 ? 0.05 : 0;
                      if (streakBonusPct <= 0) return null;
                      return (
                        <div className="mt-1 text-xs text-white/45">
                          Streak Bonus: +{Math.round(streakBonusPct * 100)}%
                          yield
                        </div>
                      );
                    })()}

                    <div className="mt-3 space-y-1">
                      {canCraftMossRation ? (
                        <Link
                          href="/bazaar/crafting-district"
                          className="inline-flex rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/16"
                        >
                          Craft Moss Ration available
                        </Link>
                      ) : null}

                      {canCraftStabilizationSigil ? (
                        <Link
                          href="/bazaar/crafting-district"
                          className="inline-flex rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/16"
                        >
                          Bind Rune Crafter Sigil available
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <Link
                        href="/inventory"
                        className="inline-flex rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Open Inventory
                      </Link>
                    </div>
                  </div>
                );
              })()
            : null}

          {isQueueFull && !isHuntRunning ? (
            <div className="mt-2 text-sm text-white/55">
              Queue full: deploy may not enqueue a new hunt yet.
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Zone activity"
            description="Randomized mob spawns for this map shell, driven by the zone spawn table."
          >
            <ZoneActivity
              key={effectiveZoneId}
              zoneId={effectiveZoneId}
              huntStatus={activeHuntProcess?.status ?? null}
              threatBand={zone.threatBand}
              zoneLabel={zone.label}
              isViewingAllocated={effectiveZoneId === allocatedZone.id}
              multiplayerEnabled={multiplayerEnabled}
              connected={realtime.connected}
              realtimeMobs={realtime.mobs}
              realtimePlayers={realtime.players}
              recentCombatEvents={realtime.recentCombatEvents}
              selfClientId={realtime.selfClientId}
              sendMove={realtime.sendMove}
              sendAttack={realtime.sendAttack}
            />
          </SectionCard>

          <SectionCard
            title="Hunt loop links"
            description="Use existing AFK loop endpoints while this map-shell layer is online."
          >
            <div className="flex flex-col gap-3">
              <Link
                href="/bazaar/mercenary-guild"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
              >
                Open Hunting Ground Board
              </Link>
              <Link
                href="/bazaar/biotech-labs/result"
                className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-500/16"
              >
                Open Hunt Result
              </Link>
              <Link
                href="/home"
                className="rounded-xl border border-white/12 bg-black/25 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-white"
              >
                Return to Home Command
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
