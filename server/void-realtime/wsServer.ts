import { WebSocket, WebSocketServer } from "ws";
import { buildSpawnEncounter } from "../../features/void-maps/spawnSim";
import { voidZoneById, type VoidZoneId } from "../../features/void-maps/zoneData";
import type {
  FactionAlignment,
  ResourcesState,
  ResourceKey,
} from "../../features/game/gameTypes";
import type {
  AttackMobMessage,
  ClientToServerMessage,
  CombatEventMessage,
  HuntContributionPerPlayer,
  MobEntity,
  MoveInputMessage,
  PlayerPresence,
  JoinSessionMessage,
  ServerToClientMessage,
  HuntStatusMessage,
  HuntStatus,
  VoidRealtimeClientId,
  HuntContributionResultMessage,
} from "../../features/void-maps/realtime/voidRealtimeProtocol";

type PlayerContributionLedger = {
  totalDamage: number;
  totalHits: number;
  mobsContributedTo: number;
  mobsKilled: number;
  damagedMobs: Set<string>;
  killedMobs: Set<string>;
  bossDefeated: boolean;
  bossDropResourcesBase: Partial<ResourcesState>;
};

type MobContributionLedger = {
  damageByClientId: Map<VoidRealtimeClientId, number>;
  hitsByClientId: Map<VoidRealtimeClientId, number>;
  finalized: boolean;
};

type VoidSession = {
  zoneId: VoidZoneId;
  sessionBucketId: number;
  threatBand: "low" | "medium" | "high";
  sessionStartedAt: number;

  huntStatus: HuntStatus;
  huntEndsAt: number | null;
  rewardFinalizedAt: number | null;

  players: Map<VoidRealtimeClientId, PlayerPresence>;
  sockets: Map<VoidRealtimeClientId, WebSocket>;

  mobs: MobEntity[];
  mobContribLedgerByEntityId: Map<string, MobContributionLedger>;
  playerContribByClientId: Map<VoidRealtimeClientId, PlayerContributionLedger>;
  waveIndex: number;
  lastSpawnAt: number | null;
  spawnIntervalMs: number;

  emptySince: number | null;
  spawnLoop: NodeJS.Timeout;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getSpawnIntervalMs(threatBand: "low" | "medium" | "high") {
  return threatBand === "high"
    ? 2800
    : threatBand === "medium"
      ? 4000
      : 5500;
}

function getMobBaseHp(threatBand: "low" | "medium" | "high") {
  // MVP tuning: keep HP in a range where “a couple seconds of space-mashing” is readable.
  return threatBand === "high" ? 290 : threatBand === "medium" ? 210 : 140;
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

  return { damage: finalDamage, isCrit };
}

function getPlayerDamageProfile(params: {
  factionAlignment: FactionAlignment;
  rankLevel: number;
  condition: number;
}) {
  const { factionAlignment, rankLevel, condition } = params;
  const conditionScale = 0.75 + condition / 400;

  if (factionAlignment === "bio") {
    return {
      minDamage: Math.round((28 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((42 + rankLevel * 5) * conditionScale),
      critChance: 0.16,
      critMultiplier: 1.45,
    };
  }

  if (factionAlignment === "mecha") {
    return {
      minDamage: Math.round((24 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((46 + rankLevel * 5) * conditionScale),
      critChance: 0.14,
      critMultiplier: 1.5,
    };
  }

  if (factionAlignment === "pure") {
    return {
      minDamage: Math.round((30 + rankLevel * 4) * conditionScale),
      maxDamage: Math.round((48 + rankLevel * 5) * conditionScale),
      critChance: 0.18,
      critMultiplier: 1.4,
    };
  }

  return {
    minDamage: Math.round((22 + rankLevel * 3) * conditionScale),
    maxDamage: Math.round((36 + rankLevel * 4) * conditionScale),
    critChance: 0.1,
    critMultiplier: 1.35,
  };
}

const MOB_LIMIT = 10;
const SESSION_TTL_MS = 2 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 15_000;

const port = Number(process.env.VOID_WS_PORT ?? "3002");

const sessionsByKey = new Map<string, VoidSession>();

function makeSessionKey(zoneId: VoidZoneId, sessionBucketId: number) {
  return `${zoneId}-${sessionBucketId}`;
}

function makeMobPlacement(zoneId: VoidZoneId, mobId: string, waveIndex: number, spawnedAt: number) {
  const seed = `${zoneId}-${mobId}-${spawnedAt}-${waveIndex}`;
  const h1 = hashStringToInt(seed);
  const h2 = hashStringToInt(`${seed}-b`);
  const x = 10 + (h1 % 81); // 10..90
  const y = 12 + (h2 % 76); // 12..88
  return { x, y };
}

function getZoneById(zoneId: VoidZoneId) {
  return voidZoneById[zoneId];
}

function createSession(zoneId: VoidZoneId, sessionBucketId: number): VoidSession {
  const zone = voidZoneById[zoneId];
  const threatBand = zone.threatBand;
  const spawnIntervalMs = getSpawnIntervalMs(threatBand);
  const SESSION_BUCKET_MS = 2 * 60 * 1000;
  const bucketStartAt = sessionBucketId * SESSION_BUCKET_MS;

  const session: VoidSession = {
    zoneId,
    sessionBucketId,
    threatBand,
    sessionStartedAt: bucketStartAt,
    huntStatus: "paused",
    huntEndsAt: null,
    rewardFinalizedAt: null,
    players: new Map(),
    sockets: new Map(),
    mobs: [],
    mobContribLedgerByEntityId: new Map(),
    playerContribByClientId: new Map(),
    waveIndex: 0,
    // Force first spawn on first eligible tick.
    lastSpawnAt: bucketStartAt - spawnIntervalMs,
    spawnIntervalMs,
    emptySince: null,
    spawnLoop: setInterval(() => {
      const now2 = Date.now();
      const playersCount = session.players.size;
      if (playersCount <= 0) {
        return;
      }

      if (
        session.huntStatus === "running" &&
        session.huntEndsAt !== null &&
        now2 >= session.huntEndsAt
      ) {
        session.huntStatus = "complete";
        if (session.rewardFinalizedAt === null) {
          session.rewardFinalizedAt = now2;
          broadcastHuntContributionResult(session, session.huntEndsAt);
        }
      }

      if (session.huntStatus !== "running") {
        return;
      }

      const last = session.lastSpawnAt ?? session.sessionStartedAt;
      if (now2 - last < session.spawnIntervalMs) {
        return;
      }

      session.lastSpawnAt = now2;
      session.waveIndex += 1;
      // Boss cadence: special zones spawn bosses periodically,
      // danger zones spawn bosses later. Standard zones never spawn bosses.
      const waveIndex = session.waveIndex;
      const zone = getZoneById(session.zoneId);
      const isSpecialZone = zone.category === "special";
      const isDangerZone = zone.category === "danger";

      const baseShouldSpawnBoss =
        isSpecialZone
          ? waveIndex % 4 === 0
          : isDangerZone
            ? waveIndex % 6 === 0
            : false;

      const playersArr = Array.from(session.players.values());
      const avgZoneMastery =
        playersArr.length > 0
          ? playersArr.reduce(
              (sum, p) => sum + (p.zoneMasteryForZone ?? 0),
              0,
            ) / playersArr.length
          : 0;

      // Minimal mastery-driven boss chance:
      // if base cadence doesn't spawn a boss, mastery can "nudge" it forward.
      const masteryExtraBossChance = clamp(avgZoneMastery * 0.01, 0, 0.2);
      const shouldSpawnBossWithMastery =
        baseShouldSpawnBoss ||
        (!baseShouldSpawnBoss &&
          (isSpecialZone || isDangerZone) &&
          Math.random() < masteryExtraBossChance);

      const encounter = shouldSpawnBossWithMastery
        ? {
            zoneId: session.zoneId,
            mobId: `vb-${session.zoneId}-void-boss-${waveIndex}`,
            mobLabel: "Void Boss",
            packSize: 4,
            spawnedAt: now2,
          }
        : buildSpawnEncounter(session.zoneId, now2);
      const { x, y } = makeMobPlacement(
        session.zoneId,
        encounter.mobId,
        session.waveIndex,
        now2,
      );

      const baseHp = getMobBaseHp(session.threatBand);
      const maxHp = baseHp * encounter.packSize;
      const mobEntityId = `mob-${session.zoneId}-${session.waveIndex}-${now2}`;

      const mob: MobEntity = {
        mobEntityId,
        zoneId: session.zoneId,
        waveIndex: session.waveIndex,
        mobId: encounter.mobId,
        mobLabel: encounter.mobLabel,
        packSize: encounter.packSize,
        spawnedAt: now2,
        hp: maxHp,
        maxHp,
        x,
        y,
      };

      session.mobs = [mob, ...session.mobs].slice(0, MOB_LIMIT);

      const msg: ServerToClientMessage = {
        type: "mob_spawned",
        mob,
      };

      for (const socket of session.sockets.values()) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(msg));
        }
      }
    }, 250),
  };

  return session;
}

function sendToWs(ws: WebSocket, msg: ServerToClientMessage) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(msg));
}

function broadcastSession(session: VoidSession, msg: ServerToClientMessage) {
  for (const ws of session.sockets.values()) {
    sendToWs(ws, msg);
  }
}

function computeContributionScore(ledger: PlayerContributionLedger) {
  // MVP weights: prioritize damage, then landed hits, then kills.
  return (
    ledger.totalDamage +
    ledger.totalHits * 8 +
    ledger.mobsContributedTo * 10 +
    ledger.mobsKilled * 40
  );
}

function computeBonusMultiplier(score: number, maxScore: number) {
  const MAX_MULTIPLIER = 0.25;
  if (maxScore <= 0) return 0;
  if (score <= 0) return 0;
  const normalized = score / maxScore;
  return Math.min(MAX_MULTIPLIER, normalized * MAX_MULTIPLIER);
}

function broadcastHuntContributionResult(session: VoidSession, resolvedAt: number) {
  const entries = Array.from(session.playerContribByClientId.entries());

  const scores = entries.map(([, ledger]) => computeContributionScore(ledger));
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  const perPlayer: HuntContributionPerPlayer[] = entries.map(
    ([clientId, ledger]) => {
      const score = computeContributionScore(ledger);
      const bonusMultiplier = computeBonusMultiplier(score, maxScore);
      return {
        clientId,
        totalDamage: ledger.totalDamage,
        totalHits: ledger.totalHits,
        mobsContributedTo: ledger.mobsContributedTo,
        mobsKilled: ledger.mobsKilled,
        bonusMultiplier,
        bossDefeated: ledger.bossDefeated,
        bossDropResourcesBase: ledger.bossDropResourcesBase,
      };
    },
  );

  const msg: HuntContributionResultMessage = {
    type: "hunt_contribution_result",
    zoneId: session.zoneId,
    sessionBucketId: session.sessionBucketId,
    resolvedAt,
    perPlayer,
    ts: Date.now(),
  };

  broadcastSession(session, msg);
}

function maybeCleanupSessions() {
  const now = Date.now();
  for (const [key, session] of sessionsByKey.entries()) {
    if (!session.emptySince) continue;
    if (now - session.emptySince < SESSION_TTL_MS) continue;
    clearInterval(session.spawnLoop);
    sessionsByKey.delete(key);
  }
}

console.log(`[VoidRealtime] starting ws server on :${port}`);

const wss = new WebSocketServer({ port });

setInterval(() => {
  maybeCleanupSessions();
}, CLEANUP_INTERVAL_MS);

wss.on("connection", (ws) => {
  let joinedClientId: VoidRealtimeClientId | null = null;
  let joinedSession: VoidSession | null = null;

  ws.on("message", (raw) => {
    let msg: ClientToServerMessage | null = null;
    try {
      msg = JSON.parse(String(raw)) as ClientToServerMessage;
    } catch {
      return;
    }

    if (!msg || typeof msg !== "object" || !("type" in msg)) return;

    if (msg.type === "join_session") {
      const join = msg as JoinSessionMessage;
      const sessionKey = makeSessionKey(join.zoneId, join.sessionBucketId);
      const session =
        sessionsByKey.get(sessionKey) ?? createSession(join.zoneId, join.sessionBucketId);
      sessionsByKey.set(sessionKey, session);

      // If this socket re-joins, replace the mapping cleanly.
      if (joinedSession && joinedClientId) {
        joinedSession.players.delete(joinedClientId);
        joinedSession.sockets.delete(joinedClientId);
      }

      joinedClientId = join.clientId;
      joinedSession = session;

      const existing = session.players.get(join.clientId);
      const next: PlayerPresence = {
        clientId: join.clientId,
        playerName: join.playerName,
        factionAlignment: join.factionAlignment,
        x: existing?.x ?? 50,
        y: existing?.y ?? 50,
        lastMoveAt: Date.now(),
        rankLevel: join.rankLevel,
        condition: join.condition,
        zoneMasteryForZone: join.zoneMasteryForZone,
      };

      session.players.set(join.clientId, next);
      if (!session.playerContribByClientId.has(join.clientId)) {
        session.playerContribByClientId.set(join.clientId, {
          totalDamage: 0,
          totalHits: 0,
          mobsContributedTo: 0,
          mobsKilled: 0,
          damagedMobs: new Set(),
          killedMobs: new Set(),
          bossDefeated: false,
          bossDropResourcesBase: {},
        });
      }
      session.sockets.set(join.clientId, ws);
      session.emptySince = null;

      const payload: ServerToClientMessage = {
        type: "session_state",
        zoneId: session.zoneId,
        sessionBucketId: session.sessionBucketId,
        sessionStartedAt: session.sessionStartedAt,
        players: Array.from(session.players.values()),
        mobs: session.mobs,
      };

      sendToWs(ws, payload);

      const playersUpdated: ServerToClientMessage = {
        type: "players_updated",
        players: Array.from(session.players.values()),
      };

      broadcastSession(session, playersUpdated);
      return;
    }

    if (!joinedSession || !joinedClientId) {
      return;
    }

    if (msg.type === "hunt_status") {
      const hunt = msg as HuntStatusMessage;
      if (hunt.clientId !== joinedClientId) return;

      joinedSession.huntStatus = hunt.status;
      joinedSession.huntEndsAt = hunt.huntEndsAt;

      // If clients flip to `complete` before the spawn loop tick runs,
      // finalize immediately to guarantee reward emission.
      if (hunt.status === "complete" && joinedSession.rewardFinalizedAt === null) {
        const resolvedAt = hunt.huntEndsAt ?? Date.now();
        joinedSession.rewardFinalizedAt = Date.now();
        broadcastHuntContributionResult(joinedSession, resolvedAt);
      }
      return;
    }

    if (msg.type === "move_input") {
      const move = msg as MoveInputMessage;
      if (move.clientId !== joinedClientId) return;

      const player = joinedSession.players.get(move.clientId);
      if (!player) return;

      const nextX = clamp(move.x, 2, 98);
      const nextY = clamp(move.y, 2, 98);

      joinedSession.players.set(move.clientId, {
        ...player,
        x: nextX,
        y: nextY,
        lastMoveAt: Date.now(),
      });

      const playersUpdated: ServerToClientMessage = {
        type: "players_updated",
        players: Array.from(joinedSession.players.values()),
      };

      broadcastSession(joinedSession, playersUpdated);
      return;
    }

    if (msg.type === "attack_mob") {
      const attack = msg as AttackMobMessage;
      if (attack.clientId !== joinedClientId) return;
      if (joinedSession.huntStatus !== "running") return;

      const player = joinedSession.players.get(attack.clientId);
      if (!player) return;

      const mob = joinedSession.mobs.find((m) => m.mobEntityId === attack.mobEntityId);
      if (!mob) return;
      if (mob.hp <= 0) return;

      const profile = getPlayerDamageProfile({
        factionAlignment: player.factionAlignment,
        rankLevel: player.rankLevel,
        condition: player.condition,
      });

      const { damage, isCrit } = rollDamage(
        profile.minDamage,
        profile.maxDamage,
        profile.critChance,
        profile.critMultiplier,
      );

      // Contribution ledger updates (server-authoritative)
      let playerLedger = joinedSession.playerContribByClientId.get(
        attack.clientId,
      );
      if (!playerLedger) {
        playerLedger = {
          totalDamage: 0,
          totalHits: 0,
          mobsContributedTo: 0,
          mobsKilled: 0,
          damagedMobs: new Set(),
          killedMobs: new Set(),
          bossDefeated: false,
          bossDropResourcesBase: {},
        };
        joinedSession.playerContribByClientId.set(attack.clientId, playerLedger);
      }

      playerLedger.totalDamage += damage;
      playerLedger.totalHits += 1;

      let mobLedger = joinedSession.mobContribLedgerByEntityId.get(
        mob.mobEntityId,
      );
      if (!mobLedger) {
        mobLedger = {
          damageByClientId: new Map(),
          hitsByClientId: new Map(),
          finalized: false,
        };
        joinedSession.mobContribLedgerByEntityId.set(mob.mobEntityId, mobLedger);
      }

      const prevDamage = mobLedger.damageByClientId.get(attack.clientId) ?? 0;
      mobLedger.damageByClientId.set(attack.clientId, prevDamage + damage);

      const prevHits = mobLedger.hitsByClientId.get(attack.clientId) ?? 0;
      mobLedger.hitsByClientId.set(attack.clientId, prevHits + 1);

      if (prevDamage <= 0 && damage > 0) {
        if (!playerLedger.damagedMobs.has(mob.mobEntityId)) {
          playerLedger.damagedMobs.add(mob.mobEntityId);
          playerLedger.mobsContributedTo += 1;
        }
      }

      mob.hp = Math.max(0, mob.hp - damage);

      const hpUpdated: ServerToClientMessage = {
        type: "mob_hp_updated",
        mobEntityId: mob.mobEntityId,
        hp: mob.hp,
        maxHp: mob.maxHp,
      };

      const combatEvent: CombatEventMessage = {
        type: "combat_event",
        mobEntityId: mob.mobEntityId,
        attackerClientId: attack.clientId,
        damage,
        isCrit,
        ts: Date.now(),
      };

      broadcastSession(joinedSession, hpUpdated);
      broadcastSession(joinedSession, combatEvent);

      if (mob.hp <= 0) {
        if (!mobLedger.finalized) {
          mobLedger.finalized = true;

          const isBossMob = mob.mobLabel === "Void Boss";
          const zone = getZoneById(mob.zoneId);
          const rewards: Partial<ResourcesState> = {};

          if (isBossMob) {
            switch (zone.dropType) {
              case "bio":
                rewards.bioSamples =
                  (rewards.bioSamples ?? 0) + getRandomInt(2, 6);
                break;
              case "mecha":
                rewards.scrapAlloy =
                  (rewards.scrapAlloy ?? 0) + getRandomInt(2, 6);
                break;
              case "spirit":
                rewards.runeDust =
                  (rewards.runeDust ?? 0) + getRandomInt(2, 6);
                break;
            }
          }

          for (const [clientId, dealtDamage] of mobLedger.damageByClientId) {
            if (dealtDamage <= 0) continue;
            const p = joinedSession.playerContribByClientId.get(clientId);
            if (!p) continue;
            if (!p.killedMobs.has(mob.mobEntityId)) {
              p.killedMobs.add(mob.mobEntityId);
              p.mobsKilled += 1;

              if (isBossMob) {
                p.bossDefeated = true;
                (Object.entries(rewards) as Array<[ResourceKey, number]>).forEach(
                  ([key, amount]) => {
                    if (!amount || amount <= 0) return;
                    p.bossDropResourcesBase[key] =
                      (p.bossDropResourcesBase[key] ?? 0) + amount;
                  },
                );
              }
            }
          }
        }

        const defeated: ServerToClientMessage = {
          type: "mob_defeated",
          mobEntityId: mob.mobEntityId,
          ts: Date.now(),
        };
        broadcastSession(joinedSession, defeated);
      }

      return;
    }
  });

  ws.on("close", () => {
    if (!joinedSession || !joinedClientId) return;
    joinedSession.players.delete(joinedClientId);
    joinedSession.sockets.delete(joinedClientId);

    if (joinedSession.players.size <= 0) {
      joinedSession.emptySince = Date.now();
    }
  });
});

