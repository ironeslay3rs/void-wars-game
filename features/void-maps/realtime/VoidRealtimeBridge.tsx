"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { getMissionById } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import type {
  AttackMobMessage,
  ClientToServerMessage,
  CombatEventMessage,
  HuntContributionResultMessage,
  JoinSessionMessage,
  MobEntity,
  MoveInputMessage,
  HuntStatusMessage,
  PlayerPresence,
  ServerToClientMessage,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { isVoidFieldShellBossMobId } from "@/features/void-maps/voidFieldShellMobs";
import { getVoidFieldLootProfileIdFromMobId } from "@/features/void-maps/voidFieldLootTables";

export type VoidRealtimeSessionApi = {
  connected: boolean;
  error: string | null;
  selfClientId: string;
  players: PlayerPresence[];
  mobs: MobEntity[];
  recentCombatEvents: CombatEventMessage[];
  huntContributionResult: HuntContributionResultMessage | null;
  sendMove: (x: number, y: number) => void;
  sendAttack: (mobEntityId: string) => void;
};

const VoidRealtimeContext = createContext<VoidRealtimeSessionApi | null>(null);

function getZoneThreatLevel(zoneId: string): number {
  if (Object.prototype.hasOwnProperty.call(voidZoneById, zoneId)) {
    return voidZoneById[zoneId as VoidZoneId].threatLevel;
  }
  return 1;
}

function huntingGroundNeedsRealtimeContribution(state: GameState): boolean {
  const latest = state.player.lastHuntResult;
  if (!latest) return false;
  const mission = getMissionById(state.missions, latest.missionId);
  if (!mission || mission.category !== "hunting-ground") return false;
  return latest.realtimeContributionAppliedForResolvedAt !== latest.resolvedAt;
}

export function VoidRealtimeBridge({
  state,
  dispatch,
  children,
}: {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  children: ReactNode;
}) {
  const binding = state.player.voidRealtimeBinding;
  const activeHunt =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;
  const [nowTickMs, setNowTickMs] = useState(() => Date.now());
  useEffect(() => {
    if (!binding) return;
    const interval = window.setInterval(() => setNowTickMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [binding]);

  // Realtime hunt spawning/attack gating is driven by hunt_status on the server.
  // If `activeProcess` lags behind the mission queue, attacks can be rejected and
  // the field appears "quiet". Use the mission queue timing as the source of truth.
  const huntFromQueue = (() => {
    const missionQueue = Array.isArray(state.player.missionQueue)
      ? state.player.missionQueue
      : [];
    if (!binding) return null;

    const matchingEntry = missionQueue.find((entry) => {
      const mission = getMissionById(state.missions, entry.missionId);
      if (!mission) return false;
      if (mission.category !== "hunting-ground") return false;
      if (mission.deployZoneId && mission.deployZoneId !== binding.zoneId)
        return false;
      return true;
    });

    if (!matchingEntry) return null;
    return {
      startsAt: matchingEntry.startsAt,
      endsAt: matchingEntry.endsAt,
      status:
        nowTickMs >= matchingEntry.endsAt
          ? ("complete" as const)
          : nowTickMs >= matchingEntry.startsAt
            ? ("running" as const)
            : ("paused" as const),
    };
  })();

  const huntStatus: "running" | "complete" | null =
    activeHunt?.status === "running" || activeHunt?.status === "complete"
      ? (activeHunt.status as "running" | "complete")
      : huntFromQueue?.status === "running"
        ? "running"
        : huntFromQueue?.status === "complete"
          ? "complete"
          : null;

  const huntEndsAt =
    activeHunt?.endsAt ?? huntFromQueue?.endsAt ?? null;

  const pendingContribution = huntingGroundNeedsRealtimeContribution(state);
  const shouldConnect =
    binding !== null &&
    (activeHunt !== null || pendingContribution || huntFromQueue !== null);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [mobs, setMobs] = useState<MobEntity[]>([]);
  const [recentCombatEvents, setRecentCombatEvents] = useState<
    CombatEventMessage[]
  >([]);
  const [huntContributionResult, setHuntContributionResult] =
    useState<HuntContributionResultMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const moveSeqRef = useRef(0);
  const attackSeqRef = useRef(0);
  const joinContextRef = useRef<{
    binding: GameState["player"]["voidRealtimeBinding"];
    playerName: string;
    factionAlignment: GameState["player"]["factionAlignment"];
    rankLevel: number;
    condition: number;
    zoneMasteryForZone: number;
    fieldLoadoutProfile: GameState["player"]["fieldLoadoutProfile"];
    runeDepthBySchool: GameState["player"]["runeMastery"]["depthBySchool"];
    runeMinorsBySchool: GameState["player"]["runeMastery"]["minorCountBySchool"];
  }>({
    binding: null,
    playerName: "",
    factionAlignment: "unbound",
    rankLevel: 1,
    condition: 100,
    zoneMasteryForZone: 0,
    fieldLoadoutProfile: "assault",
    runeDepthBySchool: {} as GameState["player"]["runeMastery"]["depthBySchool"],
    runeMinorsBySchool: {} as GameState["player"]["runeMastery"]["minorCountBySchool"],
  });

  const huntSignalRef = useRef({
    clientId: "",
    huntStatus: null as "running" | "complete" | null,
    huntEndsAt: null as number | null,
  });

  useLayoutEffect(() => {
    joinContextRef.current = {
      binding,
      playerName: state.player.playerName,
      factionAlignment: state.player.factionAlignment,
      rankLevel: state.player.rankLevel,
      condition: state.player.condition,
      zoneMasteryForZone:
        binding &&
        Object.prototype.hasOwnProperty.call(voidZoneById, binding.zoneId)
          ? state.player.zoneMastery[binding.zoneId] ?? 0
          : 0,
      fieldLoadoutProfile: state.player.fieldLoadoutProfile,
      runeDepthBySchool: state.player.runeMastery.depthBySchool,
      runeMinorsBySchool: state.player.runeMastery.minorCountBySchool,
    };
    huntSignalRef.current = {
      clientId: binding?.clientId ?? "",
      huntStatus,
      huntEndsAt,
    };
  }, [
    binding,
    huntEndsAt,
    huntStatus,
    state.player.condition,
    state.player.factionAlignment,
    state.player.fieldLoadoutProfile,
    state.player.playerName,
    state.player.rankLevel,
    state.player.runeMastery.depthBySchool,
    state.player.runeMastery.minorCountBySchool,
    state.player.zoneMastery,
  ]);

  const wsUrl = useMemo(() => {
    const port = process.env.NEXT_PUBLIC_VOID_WS_PORT ?? "3002";
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.hostname}:${port}`;
  }, []);

  const sendRaw = useCallback((msg: ClientToServerMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  const flushJoin = useCallback(() => {
    const ctx = joinContextRef.current;
    const b = ctx.binding;
    if (!b) return;
    const join: JoinSessionMessage = {
      type: "join_session",
      zoneId: b.zoneId as VoidZoneId,
      sessionBucketId: b.sessionBucketId,
      clientId: b.clientId,
      playerName: ctx.playerName,
      factionAlignment: ctx.factionAlignment,
      rankLevel: ctx.rankLevel,
      condition: ctx.condition,
      zoneMasteryForZone: ctx.zoneMasteryForZone,
    };
    sendRaw(join);
  }, [sendRaw]);

  const flushHuntStatus = useCallback(() => {
    const h = huntSignalRef.current;
    if (!h.clientId) return;
    const status =
      h.huntStatus === "running"
        ? "running"
        : h.huntStatus === "complete"
          ? "complete"
          : "paused";
    const msg: HuntStatusMessage = {
      type: "hunt_status",
      clientId: h.clientId,
      status,
      huntEndsAt: h.huntEndsAt,
      ts: Date.now(),
    };
    sendRaw(msg);
  }, [sendRaw]);

  const sendMove = useCallback(
    (x: number, y: number) => {
      const b = joinContextRef.current.binding;
      if (!b) return;
      moveSeqRef.current += 1;
      const msg: MoveInputMessage = {
        type: "move_input",
        clientId: b.clientId,
        seq: moveSeqRef.current,
        ts: Date.now(),
        x,
        y,
      };
      sendRaw(msg);
    },
    [sendRaw],
  );

  const sendAttack = useCallback(
    (mobEntityId: string) => {
      const b = joinContextRef.current.binding;
      if (!b || !mobEntityId) return;
      attackSeqRef.current += 1;
      const msg: AttackMobMessage = {
        type: "attack_mob",
        clientId: b.clientId,
        seq: attackSeqRef.current,
        ts: Date.now(),
        mobEntityId,
      };
      sendRaw(msg);
    },
    [sendRaw],
  );

  const bindingKey = binding
    ? `${binding.zoneId}-${binding.sessionBucketId}-${binding.clientId}`
    : "";

  const prevBindingKeyRef = useRef<string>("");
  useEffect(() => {
    if (bindingKey === prevBindingKeyRef.current) return;
    prevBindingKeyRef.current = bindingKey;
    const t = window.setTimeout(() => {
      setHuntContributionResult(null);
    }, 0);
    return () => window.clearTimeout(t);
  }, [bindingKey]);

  useEffect(() => {
    if (!shouldConnect || !binding) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      const t = window.setTimeout(() => {
        setConnected(false);
        setPlayers([]);
        setMobs([]);
        setRecentCombatEvents([]);
      }, 0);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelled) return;
      setConnected(true);
      setError(null);
      flushJoin();
      flushHuntStatus();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerToClientMessage;
        switch (msg.type) {
          case "session_state":
            setPlayers(msg.players);
            setMobs(msg.mobs);
            break;
          case "players_updated":
            setPlayers(msg.players);
            break;
          case "mob_spawned":
            setMobs((prev) => {
              if (prev.some((m) => m.mobEntityId === msg.mob.mobEntityId)) {
                return prev;
              }
              return [msg.mob, ...prev].slice(0, 10);
            });
            break;
          case "mob_hp_updated":
            setMobs((prev) =>
              prev.map((m) => {
                if (m.mobEntityId !== msg.mobEntityId) return m;
                const next: MobEntity = { ...m, hp: msg.hp, maxHp: msg.maxHp };
                if (
                  typeof msg.shellPostureMax === "number" &&
                  msg.shellPostureMax > 0
                ) {
                  next.shellArchetype = msg.shellArchetype;
                  next.shellPosture = msg.shellPosture;
                  next.shellPostureMax = msg.shellPostureMax;
                  next.shellExposedHitsRemaining =
                    typeof msg.shellExposedHitsRemaining === "number" &&
                    msg.shellExposedHitsRemaining > 0
                      ? msg.shellExposedHitsRemaining
                      : undefined;
                  next.shellTag = msg.shellTag;
                  next.shellPurePulseNext =
                    msg.shellPurePulseNext === true ? true : undefined;
                  next.shellKillCreditExposed =
                    msg.shellKillCreditExposed === true ? true : undefined;
                }
                return next;
              }),
            );
            break;
          case "mob_defeated":
            setMobs((prev) =>
              prev.map((m) =>
                m.mobEntityId === msg.mobEntityId
                  ? {
                      ...m,
                      hp: 0,
                      isBoss: isVoidFieldShellBossMobId(m.mobId),
                      lootProfileId: getVoidFieldLootProfileIdFromMobId(m.mobId),
                    }
                  : m,
              ),
            );
            break;
          case "combat_event":
            setRecentCombatEvents((prev) => [msg, ...prev].slice(0, 6));
            break;
          case "hunt_contribution_result":
            setHuntContributionResult(msg);
            break;
          default:
            break;
        }
      } catch {
        setError("Realtime message parse failed.");
      }
    };

    ws.onerror = () => {
      setError("Realtime connection error.");
    };

    ws.onclose = () => {
      if (!cancelled) {
        setConnected(false);
      }
    };

    return () => {
      cancelled = true;
      ws.close();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [binding, shouldConnect, wsUrl, flushJoin, flushHuntStatus]);

  useEffect(() => {
    if (!shouldConnect || !binding) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    flushJoin();
  }, [
    shouldConnect,
    binding,
    state.player.playerName,
    state.player.factionAlignment,
    state.player.rankLevel,
    state.player.condition,
    state.player.fieldLoadoutProfile,
    state.player.runeMastery,
    state.player.zoneMastery,
    flushJoin,
  ]);

  useEffect(() => {
    if (!shouldConnect || !binding) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    flushHuntStatus();
  }, [shouldConnect, binding, huntStatus, huntEndsAt, flushHuntStatus]);

  const selfContribution = useMemo(() => {
    if (!huntContributionResult || !binding) return null;
    const { perPlayer, resolvedAt } = huntContributionResult;
    if (resolvedAt === null) return null;
    const self = perPlayer.find((p) => p.clientId === binding.clientId);
    if (!self) return null;
    return {
      resolvedAt,
      bonusMultiplier: self.bonusMultiplier,
      totalDamageDealt: self.totalDamage,
      totalHitsLanded: self.totalHits,
      mobsContributedTo: self.mobsContributedTo,
      mobsKilled: self.mobsKilled,
      exposedKills: self.exposedKills ?? 0,
      bossDefeated: self.bossDefeated,
      bossDropResourcesBase: self.bossDropResourcesBase,
    };
  }, [huntContributionResult, binding]);

  useEffect(() => {
    if (!selfContribution || !binding) return;
    if (!state.player.lastHuntResult) return;
    if (
      state.player.lastHuntResult.resolvedAt !== selfContribution.resolvedAt
    ) {
      return;
    }

    dispatch({
      type: "APPLY_REALTIME_HUNT_BONUS",
      payload: {
        resolvedAt: selfContribution.resolvedAt,
        bonusMultiplier: selfContribution.bonusMultiplier,
        zoneId: binding.zoneId,
        totalDamageDealt: selfContribution.totalDamageDealt,
        totalHitsLanded: selfContribution.totalHitsLanded,
        mobsContributedTo: selfContribution.mobsContributedTo,
        mobsKilled: selfContribution.mobsKilled,
        exposedKills: selfContribution.exposedKills,
        bossDefeated: selfContribution.bossDefeated,
        bossDropResourcesBase: selfContribution.bossDropResourcesBase,
        zoneThreatLevel: getZoneThreatLevel(binding.zoneId),
      },
    });
  }, [binding, dispatch, selfContribution, state.player.lastHuntResult]);

  const api = useMemo(
    (): VoidRealtimeSessionApi => ({
      connected,
      error,
      selfClientId: binding?.clientId ?? "",
      players,
      mobs,
      recentCombatEvents,
      huntContributionResult,
      sendMove,
      sendAttack,
    }),
    [
      connected,
      error,
      binding?.clientId,
      players,
      mobs,
      recentCombatEvents,
      huntContributionResult,
      sendMove,
      sendAttack,
    ],
  );

  return (
    <VoidRealtimeContext.Provider value={api}>{children}</VoidRealtimeContext.Provider>
  );
}

export function useVoidRealtimeSession(): VoidRealtimeSessionApi {
  const ctx = useContext(VoidRealtimeContext);
  if (!ctx) {
    throw new Error(
      "useVoidRealtimeSession must be used within VoidRealtimeBridge",
    );
  }
  return ctx;
}
