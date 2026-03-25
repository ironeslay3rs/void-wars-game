"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FactionAlignment } from "@/features/game/gameTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";
import type {
  AttackMobMessage,
  CombatEventMessage,
  ClientToServerMessage,
  HuntContributionResultMessage,
  MobEntity,
  PlayerPresence,
  JoinSessionMessage,
  MoveInputMessage,
  HuntStatusMessage,
  ServerToClientMessage,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";

type VoidRealtimePlayerProfile = {
  playerName: string;
  factionAlignment: FactionAlignment;
  rankLevel: number;
  condition: number;
  zoneMasteryForZone: number;
};

type UseVoidRealtimeSessionArgs = {
  enabled: boolean;
  zoneId: VoidZoneId;
  sessionBucketId: number;
  playerProfile: VoidRealtimePlayerProfile;
  huntStatus: "running" | "complete" | null;
  huntEndsAt: number | null;
};

export function useVoidRealtimeSession({
  enabled,
  zoneId,
  sessionBucketId,
  playerProfile,
  huntStatus,
  huntEndsAt,
}: UseVoidRealtimeSessionArgs) {
  const clientId = useMemo(() => {
    return globalThis.crypto?.randomUUID?.() ?? "client-unknown";
  }, []);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [mobs, setMobs] = useState<MobEntity[]>([]);
  const [recentCombatEvents, setRecentCombatEvents] = useState<
    CombatEventMessage[]
  >([]);
  const [huntContributionResult, setHuntContributionResult] = useState<
    HuntContributionResultMessage | null
  >(null);

  const wsRef = useRef<WebSocket | null>(null);
  const moveSeqRef = useRef(0);
  const attackSeqRef = useRef(0);

  const wsUrl = useMemo(() => {
    // NEXT_PUBLIC_ vars are inlined during build; fallback keeps local dev usable.
    const port = process.env.NEXT_PUBLIC_VOID_WS_PORT ?? "3002";
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.hostname}:${port}`;
  }, []);

  const send = useCallback((msg: ClientToServerMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  const sendJoin = useCallback(() => {
    const join: JoinSessionMessage = {
      type: "join_session",
      zoneId,
      sessionBucketId,
      clientId,
      playerName: playerProfile.playerName,
      factionAlignment: playerProfile.factionAlignment,
      rankLevel: playerProfile.rankLevel,
      condition: playerProfile.condition,
      zoneMasteryForZone: playerProfile.zoneMasteryForZone,
    };
    send(join);
  }, [zoneId, sessionBucketId, clientId, playerProfile, send]);

  const sendHuntStatus = useCallback(() => {
    const status = huntStatus === "running"
      ? "running"
      : huntStatus === "complete"
        ? "complete"
        : "paused";

    const msg: HuntStatusMessage = {
      type: "hunt_status",
      clientId,
      status,
      huntEndsAt,
      ts: Date.now(),
    };

    send(msg);
  }, [huntEndsAt, huntStatus, clientId, send]);

  const sendMove = useCallback(
    (x: number, y: number) => {
      moveSeqRef.current += 1;
      const msg: MoveInputMessage = {
        type: "move_input",
        clientId,
        seq: moveSeqRef.current,
        ts: Date.now(),
        x,
        y,
      };
      send(msg);
    },
    [clientId, send],
  );

  const sendAttack = useCallback(
    (mobEntityId: string) => {
      if (!mobEntityId) return;
      attackSeqRef.current += 1;
      const msg: AttackMobMessage = {
        type: "attack_mob",
        clientId,
        seq: attackSeqRef.current,
        ts: Date.now(),
        mobEntityId,
      };
      send(msg);
    },
    [clientId, send],
  );

  useEffect(() => {
    if (!enabled) return;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    let reconnectAttempts = 0;

    const connect = () => {
      ws.onopen = () => {
        setConnected(true);
        sendJoin();
        sendHuntStatus();
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
                prev.map((m) =>
                  m.mobEntityId === msg.mobEntityId
                    ? { ...m, hp: msg.hp, maxHp: msg.maxHp }
                    : m,
                ),
              );
              break;
            case "mob_defeated":
              setMobs((prev) =>
                prev.map((m) =>
                  m.mobEntityId === msg.mobEntityId ? { ...m, hp: 0 } : m,
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
        setConnected(false);
        if (!enabled) return;
        reconnectAttempts += 1;
        if (reconnectAttempts > 5) return;

        // Simple backoff. Enough for dev testing without complex state.
        const retryMs = Math.min(2000, 300 * reconnectAttempts);
        window.setTimeout(() => connect(), retryMs);
      };
    };

    connect();

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, wsUrl, sendJoin, sendHuntStatus, clientId]);

  useEffect(() => {
    if (!enabled) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    sendHuntStatus();
  }, [enabled, huntStatus, huntEndsAt, sendHuntStatus]);

  return {
    connected,
    error,
    selfClientId: clientId,
    players,
    mobs,
    recentCombatEvents,
    huntContributionResult,
    sendMove,
    sendAttack,
  };
}

