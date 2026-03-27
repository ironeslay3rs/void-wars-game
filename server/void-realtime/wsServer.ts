import { WebSocket, WebSocketServer } from "ws";
import { createClient, type RedisClientType } from "redis";
import { buildSpawnEncounter } from "../../features/void-maps/spawnSim";
import { enrichRealtimeMobWithM4Traits } from "../../features/void-maps/realtimeMobTraits";
import { resolveShellHitWithSnapshot } from "../../features/combat/shellHitResolution";
import { strikeSnapshotFromPresence } from "../../features/combat/strikeSnapshot";
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
  SendChatMessage,
  ChatBroadcastMessage,
  RegisterSocialMessage,
  SocialRosterMessage,
  AuctionCreateListingMessage,
  AuctionCancelListingMessage,
  AuctionBuyListingMessage,
  RegisterAuctionMessage,
  AuctionListingSnapshot,
  AuctionListingsMessage,
  AuctionTradeEventMessage,
  AuctionAccountStateMessage,
  AuctionHistoryEntry,
  AuctionHistoryMessage,
} from "../../features/void-maps/realtime/voidRealtimeProtocol";

type PlayerContributionLedger = {
  totalDamage: number;
  totalHits: number;
  mobsContributedTo: number;
  mobsKilled: number;
  exposedKills: number;
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
const bindHost = process.env.VOID_WS_HOST?.trim() || "0.0.0.0";

const sessionsByKey = new Map<string, VoidSession>();

type GlobalClientEntry = {
  socket: WebSocket;
  playerName: string;
  guildId: string | null;
  accountId?: string;
};

const globalClients = new Map<VoidRealtimeClientId, GlobalClientEntry>();
const auctionClients = new Set<VoidRealtimeClientId>();
const auctionListings = new Map<string, AuctionListingSnapshot>();
const auctionAccounts = new Map<
  VoidRealtimeClientId,
  { accountId: string; credits: number; craftedInventory: Record<string, number> }
>();
const auctionHistoryByAccountId = new Map<string, AuctionHistoryEntry[]>();
const AUCTION_LISTING_FEE_CREDITS = 5;
const AUCTION_SELLER_PAYOUT_MULT = 0.9;
const AUCTION_MAX_LISTINGS_PER_SELLER = 8;
const AUCTION_MIN_PRICE_CREDITS = 25;
const AUCTION_MAX_PRICE_CREDITS = 50_000;
const AUCTION_LISTING_TTL_MS = 24 * 60 * 60 * 1000;
const AUCTION_HISTORY_MAX = 100;
const REDIS_AUCTION_KEY = "vw:auction:state:v1";

let redisClient: RedisClientType | null = null;
let redisReady = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function broadcastAuctionListings() {
  const payload: AuctionListingsMessage = {
    type: "auction_listings",
    listings: Array.from(auctionListings.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    ),
    ts: Date.now(),
  };
  const raw = JSON.stringify(payload);
  for (const clientId of auctionClients) {
    const entry = globalClients.get(clientId);
    if (entry?.socket.readyState === WebSocket.OPEN) {
      entry.socket.send(raw);
    }
  }
}

function sendAuctionEvent(params: {
  actorClientId: VoidRealtimeClientId;
  status: AuctionTradeEventMessage["status"];
  listingId?: string;
  reason?: string;
}) {
  const payload: AuctionTradeEventMessage = {
    type: "auction_trade_event",
    actorClientId: params.actorClientId,
    status: params.status,
    listingId: params.listingId,
    reason: params.reason,
    ts: Date.now(),
  };
  const raw = JSON.stringify(payload);
  for (const clientId of auctionClients) {
    const entry = globalClients.get(clientId);
    if (entry?.socket.readyState === WebSocket.OPEN) {
      entry.socket.send(raw);
    }
  }
}

function sendAuctionAccountState(clientId: VoidRealtimeClientId) {
  const entry = globalClients.get(clientId);
  const account = auctionAccounts.get(clientId);
  if (!entry || !account || entry.socket.readyState !== WebSocket.OPEN) return;
  const payload: AuctionAccountStateMessage = {
    type: "auction_account_state",
    clientId,
    credits: account.credits,
    craftedInventory: account.craftedInventory,
    ts: Date.now(),
  };
  entry.socket.send(JSON.stringify(payload));
}

function sendAuctionHistory(clientId: VoidRealtimeClientId) {
  const entry = globalClients.get(clientId);
  const account = auctionAccounts.get(clientId);
  if (!entry || !account || entry.socket.readyState !== WebSocket.OPEN) return;
  const payload: AuctionHistoryMessage = {
    type: "auction_history",
    clientId,
    entries: auctionHistoryByAccountId.get(account.accountId) ?? [],
    ts: Date.now(),
  };
  entry.socket.send(JSON.stringify(payload));
}

function pushAuctionHistory(accountId: string, entry: AuctionHistoryEntry) {
  const prev = auctionHistoryByAccountId.get(accountId) ?? [];
  auctionHistoryByAccountId.set(accountId, [entry, ...prev].slice(0, AUCTION_HISTORY_MAX));
}

function serializeAuctionState() {
  return JSON.stringify({
    listings: Array.from(auctionListings.values()),
    accounts: Array.from(auctionAccounts.entries()).map(([clientId, account]) => ({
      clientId,
      ...account,
    })),
    history: Array.from(auctionHistoryByAccountId.entries()).map(([accountId, entries]) => ({
      accountId,
      entries,
    })),
  });
}

function scheduleAuctionPersist() {
  if (!redisReady || !redisClient) return;
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      await redisClient!.set(REDIS_AUCTION_KEY, serializeAuctionState());
    } catch {
      // best effort
    }
  }, 300);
}

async function initAuctionPersistence() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return;
  try {
    redisClient = createClient({ url });
    await redisClient.connect();
    redisReady = true;
    const raw = await redisClient.get(REDIS_AUCTION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      listings?: AuctionListingSnapshot[];
      accounts?: Array<{
        clientId: string;
        accountId: string;
        credits: number;
        craftedInventory: Record<string, number>;
      }>;
      history?: Array<{ accountId: string; entries: AuctionHistoryEntry[] }>;
    };
    if (Array.isArray(parsed.listings)) {
      for (const listing of parsed.listings) {
        auctionListings.set(listing.listingId, listing);
      }
    }
    if (Array.isArray(parsed.accounts)) {
      for (const account of parsed.accounts) {
        auctionAccounts.set(account.clientId, {
          accountId: account.accountId,
          credits: account.credits,
          craftedInventory: account.craftedInventory ?? {},
        });
      }
    }
    if (Array.isArray(parsed.history)) {
      for (const history of parsed.history) {
        auctionHistoryByAccountId.set(
          history.accountId,
          Array.isArray(history.entries) ? history.entries : [],
        );
      }
    }
  } catch {
    redisReady = false;
  }
}

function cleanupExpiredAuctionListings() {
  const now = Date.now();
  let changed = false;
  for (const [listingId, listing] of auctionListings.entries()) {
    if (now - listing.createdAt < AUCTION_LISTING_TTL_MS) continue;
    const seller = auctionAccounts.get(listing.sellerClientId);
    if (seller) {
      seller.craftedInventory[listing.itemId] =
        (seller.craftedInventory[listing.itemId] ?? 0) + 1;
      sendAuctionAccountState(listing.sellerClientId);
      pushAuctionHistory(seller.accountId, {
        id: `hist-expire-${listingId}-${Date.now()}`,
        kind: "expire",
        listingId,
        itemName: listing.itemName,
        itemTier: listing.tier,
        message: `${listing.itemName} expired and returned to inventory.`,
        ts: Date.now(),
      });
      sendAuctionHistory(listing.sellerClientId);
    }
    auctionListings.delete(listingId);
    changed = true;
  }
  if (changed) {
    broadcastAuctionListings();
    scheduleAuctionPersist();
  }
}

function broadcastSocialRoster() {
  const payload: SocialRosterMessage = {
    type: "social_roster",
    players: Array.from(globalClients.entries()).map(([clientId, entry]) => ({
      clientId,
      playerName: entry.playerName,
      guildId: entry.guildId,
    })),
    ts: Date.now(),
  };
  const raw = JSON.stringify(payload);
  for (const entry of globalClients.values()) {
    if (entry.socket.readyState === WebSocket.OPEN) {
      entry.socket.send(raw);
    }
  }
}

function broadcastChat(msg: ChatBroadcastMessage, senderClientId: VoidRealtimeClientId) {
  const payload = JSON.stringify(msg);
  if (msg.channel === "global") {
    for (const entry of globalClients.values()) {
      if (entry.socket.readyState === 1) {
        entry.socket.send(payload);
      }
    }
  } else if (msg.channel === "guild" && msg.guildId) {
    for (const entry of globalClients.values()) {
      if (entry.guildId === msg.guildId && entry.socket.readyState === 1) {
        entry.socket.send(payload);
      }
    }
  } else if (msg.channel === "dm" && msg.toClientId) {
    const sender = globalClients.get(senderClientId);
    const target = globalClients.get(msg.toClientId);
    if (sender && sender.socket.readyState === 1) sender.socket.send(payload);
    if (target && target.socket.readyState === 1) target.socket.send(payload);
  }
}

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

      let mob: MobEntity = {
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

      mob = enrichRealtimeMobWithM4Traits({
        mob,
        zoneId: session.zoneId,
        waveIndex: session.waveIndex,
        isBoss: shouldSpawnBossWithMastery,
      });

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
  // MVP weights: damage, hits, map presence, kills, exposed-window kills (M4).
  return (
    ledger.totalDamage +
    ledger.totalHits * 8 +
    ledger.mobsContributedTo * 10 +
    ledger.mobsKilled * 40 +
    ledger.exposedKills * 32
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
  cleanupExpiredAuctionListings();
  for (const [key, session] of sessionsByKey.entries()) {
    if (!session.emptySince) continue;
    if (now - session.emptySince < SESSION_TTL_MS) continue;
    clearInterval(session.spawnLoop);
    sessionsByKey.delete(key);
  }
}

console.log(`[VoidRealtime] starting ws server on ${bindHost}:${port}`);

const wss = new WebSocketServer({ port, host: bindHost });
void initAuctionPersistence().then(() => {
  if (auctionListings.size > 0) {
    console.log(`[VoidRealtime] restored ${auctionListings.size} auction listings from persistence`);
  }
});

setInterval(() => {
  maybeCleanupSessions();
}, CLEANUP_INTERVAL_MS);

wss.on("connection", (ws) => {
  let joinedClientId: VoidRealtimeClientId | null = null;
  let socialClientId: VoidRealtimeClientId | null = null;
  let auctionClientId: VoidRealtimeClientId | null = null;
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
        fieldLoadoutProfile: join.fieldLoadoutProfile,
        runeDepthBySchool: join.runeDepthBySchool,
        runeMinorsBySchool: join.runeMinorsBySchool,
      };

      session.players.set(join.clientId, next);
      if (!session.playerContribByClientId.has(join.clientId)) {
        session.playerContribByClientId.set(join.clientId, {
          totalDamage: 0,
          totalHits: 0,
          mobsContributedTo: 0,
          mobsKilled: 0,
          exposedKills: 0,
          damagedMobs: new Set(),
          killedMobs: new Set(),
          bossDefeated: false,
          bossDropResourcesBase: {},
        });
      }
      session.sockets.set(join.clientId, ws);
      session.emptySince = null;

      globalClients.set(join.clientId, {
        socket: ws,
        playerName: join.playerName,
        guildId: null,
      });
      broadcastSocialRoster();

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

    if (msg.type === "register_social") {
      const social = msg as RegisterSocialMessage;
      socialClientId = social.clientId;
      globalClients.set(social.clientId, {
        socket: ws,
        playerName: social.playerName,
        guildId: social.guildId ?? null,
      });
      broadcastSocialRoster();
      return;
    }

    if (msg.type === "register_auction") {
      const auction = msg as RegisterAuctionMessage;
      auctionClientId = auction.clientId;
      auctionClients.add(auction.clientId);
      globalClients.set(auction.clientId, {
        socket: ws,
        playerName: auction.playerName,
        guildId: null,
        accountId: auction.accountId,
      });
      if (!auctionAccounts.has(auction.clientId)) {
        auctionAccounts.set(auction.clientId, {
          accountId: auction.accountId,
          credits: Math.max(0, Math.floor(auction.credits)),
          craftedInventory: { ...(auction.craftedInventory ?? {}) },
        });
        scheduleAuctionPersist();
      }
      broadcastSocialRoster();
      broadcastAuctionListings();
      sendAuctionAccountState(auction.clientId);
      sendAuctionHistory(auction.clientId);
      return;
    }

    if (msg.type === "send_chat") {
      const chat = msg as SendChatMessage;
      const activeClientId = joinedClientId ?? socialClientId;
      if (!activeClientId) return;
      if (chat.clientId !== activeClientId) return;
      const broadcast: ChatBroadcastMessage = {
        type: "chat_broadcast",
        channel: chat.channel,
        fromClientId: chat.clientId,
        senderName: chat.senderName,
        text: chat.text.slice(0, 400),
        guildId: chat.guildId,
        toClientId: chat.toClientId,
        ts: Date.now(),
      };
      broadcastChat(broadcast, chat.clientId);
      return;
    }

    if (msg.type === "auction_create_listing") {
      const req = msg as AuctionCreateListingMessage;
      const activeClientId = joinedClientId ?? socialClientId ?? auctionClientId;
      if (!activeClientId || activeClientId !== req.clientId) return;
      const actor = globalClients.get(req.clientId);
      const account = auctionAccounts.get(req.clientId);
      if (!account) return;
      if (!actor) return;
      const activeListingsBySeller = Array.from(auctionListings.values()).filter(
        (x) => x.sellerClientId === req.clientId,
      ).length;
      if (activeListingsBySeller >= AUCTION_MAX_LISTINGS_PER_SELLER) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: `Listing cap reached (${AUCTION_MAX_LISTINGS_PER_SELLER}).`,
        });
        return;
      }
      if (account.credits < AUCTION_LISTING_FEE_CREDITS) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: `Need ${AUCTION_LISTING_FEE_CREDITS} credits to post listing.`,
        });
        return;
      }
      const owned = account.craftedInventory[req.listing.itemId] ?? 0;
      if (owned < 1) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "You do not own this item in crafted inventory.",
        });
        return;
      }
      account.credits -= AUCTION_LISTING_FEE_CREDITS;
      account.craftedInventory[req.listing.itemId] = owned - 1;
      const listingId = `auc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const listing: AuctionListingSnapshot = {
        listingId,
        sellerClientId: req.clientId,
        sellerAccountId: account.accountId,
        sellerName: actor.playerName,
        itemId: req.listing.itemId,
        itemName: req.listing.itemName,
        itemType: req.listing.itemType,
        rarity: req.listing.rarity,
        tier: req.listing.tier,
        priceCredits: clamp(
          Math.floor(req.listing.priceCredits),
          AUCTION_MIN_PRICE_CREDITS,
          AUCTION_MAX_PRICE_CREDITS,
        ),
        createdAt: Date.now(),
      };
      auctionListings.set(listingId, listing);
      sendAuctionAccountState(req.clientId);
      pushAuctionHistory(account.accountId, {
        id: `hist-create-${listingId}-${Date.now()}`,
        kind: "sell",
        listingId,
        itemName: listing.itemName,
        itemTier: listing.tier,
        grossCredits: listing.priceCredits,
        message: `Listed ${listing.itemName} for ${listing.priceCredits} credits.`,
        ts: Date.now(),
      });
      sendAuctionHistory(req.clientId);
      broadcastAuctionListings();
      sendAuctionEvent({
        actorClientId: req.clientId,
        status: "created",
        listingId,
      });
      scheduleAuctionPersist();
      return;
    }

    if (msg.type === "auction_cancel_listing") {
      const req = msg as AuctionCancelListingMessage;
      const activeClientId = joinedClientId ?? socialClientId ?? auctionClientId;
      if (!activeClientId || activeClientId !== req.clientId) return;
      const listing = auctionListings.get(req.listingId);
      if (!listing) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Listing not found.",
        });
        return;
      }
      if (listing.sellerClientId !== req.clientId) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Only seller can cancel listing.",
        });
        return;
      }
      const seller = auctionAccounts.get(req.clientId);
      if (seller) {
        seller.craftedInventory[listing.itemId] =
          (seller.craftedInventory[listing.itemId] ?? 0) + 1;
        sendAuctionAccountState(req.clientId);
        pushAuctionHistory(seller.accountId, {
          id: `hist-cancel-${req.listingId}-${Date.now()}`,
          kind: "cancel",
          listingId: req.listingId,
          itemName: listing.itemName,
          itemTier: listing.tier,
          message: `Cancelled listing for ${listing.itemName}.`,
          ts: Date.now(),
        });
        sendAuctionHistory(req.clientId);
      }
      auctionListings.delete(req.listingId);
      broadcastAuctionListings();
      sendAuctionEvent({
        actorClientId: req.clientId,
        status: "cancelled",
        listingId: req.listingId,
      });
      scheduleAuctionPersist();
      return;
    }

    if (msg.type === "auction_buy_listing") {
      const req = msg as AuctionBuyListingMessage;
      const activeClientId = joinedClientId ?? socialClientId ?? auctionClientId;
      if (!activeClientId || activeClientId !== req.clientId) return;
      const listing = auctionListings.get(req.listingId);
      if (!listing) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Listing already sold or expired.",
        });
        return;
      }
      if (listing.sellerClientId === req.clientId) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Cannot buy your own listing.",
        });
        return;
      }
      const buyer = auctionAccounts.get(req.clientId);
      const seller = auctionAccounts.get(listing.sellerClientId);
      if (!buyer) return;
      if (buyer.accountId === listing.sellerAccountId) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Cannot buy listing from the same account.",
        });
        return;
      }
      if (buyer.credits < listing.priceCredits) {
        sendAuctionEvent({
          actorClientId: req.clientId,
          status: "error",
          reason: "Insufficient credits for this listing.",
        });
        return;
      }
      buyer.credits -= listing.priceCredits;
      buyer.craftedInventory[listing.itemId] =
        (buyer.craftedInventory[listing.itemId] ?? 0) + 1;
      if (seller) {
        const sellerPayout = Math.max(
          1,
          Math.floor(listing.priceCredits * AUCTION_SELLER_PAYOUT_MULT),
        );
        seller.credits += sellerPayout;
        sendAuctionAccountState(listing.sellerClientId);
        pushAuctionHistory(seller.accountId, {
          id: `hist-sell-${req.listingId}-${Date.now()}`,
          kind: "sell",
          listingId: req.listingId,
          itemName: listing.itemName,
          itemTier: listing.tier,
          grossCredits: listing.priceCredits,
          payoutCredits: sellerPayout,
          counterpartName: globalClients.get(req.clientId)?.playerName,
          message: `${listing.itemName} sold for ${listing.priceCredits} credits.`,
          ts: Date.now(),
        });
        sendAuctionHistory(listing.sellerClientId);
        sendAuctionEvent({
          actorClientId: listing.sellerClientId,
          status: "sold",
          listingId: req.listingId,
          reason: `Sold for ${listing.priceCredits} credits. Payout: +${sellerPayout}.`,
        });
      }
      sendAuctionAccountState(req.clientId);
      pushAuctionHistory(buyer.accountId, {
        id: `hist-buy-${req.listingId}-${Date.now()}`,
        kind: "buy",
        listingId: req.listingId,
        itemName: listing.itemName,
        itemTier: listing.tier,
        grossCredits: listing.priceCredits,
        counterpartName: listing.sellerName,
        message: `Bought ${listing.itemName} for ${listing.priceCredits} credits.`,
        ts: Date.now(),
      });
      sendAuctionHistory(req.clientId);
      auctionListings.delete(req.listingId);
      broadcastAuctionListings();
      sendAuctionEvent({
        actorClientId: req.clientId,
        status: "sold",
        listingId: req.listingId,
      });
      scheduleAuctionPersist();
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

      const mobIndex = joinedSession.mobs.findIndex(
        (m) => m.mobEntityId === attack.mobEntityId,
      );
      if (mobIndex < 0) return;
      const mob = joinedSession.mobs[mobIndex];
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

      let playerLedger = joinedSession.playerContribByClientId.get(
        attack.clientId,
      );
      if (!playerLedger) {
        playerLedger = {
          totalDamage: 0,
          totalHits: 0,
          mobsContributedTo: 0,
          mobsKilled: 0,
          exposedKills: 0,
          damagedMobs: new Set(),
          killedMobs: new Set(),
          bossDefeated: false,
          bossDropResourcesBase: {},
        };
        joinedSession.playerContribByClientId.set(attack.clientId, playerLedger);
      }

      const snap = strikeSnapshotFromPresence(player);
      const out = resolveShellHitWithSnapshot(mob, damage, snap);
      const nextMob = out.mob;
      const effectiveHp = out.damageDealt;

      playerLedger.totalDamage += effectiveHp;
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
      mobLedger.damageByClientId.set(attack.clientId, prevDamage + effectiveHp);

      const prevHits = mobLedger.hitsByClientId.get(attack.clientId) ?? 0;
      mobLedger.hitsByClientId.set(attack.clientId, prevHits + 1);

      if (prevDamage <= 0 && effectiveHp > 0) {
        if (!playerLedger.damagedMobs.has(mob.mobEntityId)) {
          playerLedger.damagedMobs.add(mob.mobEntityId);
          playerLedger.mobsContributedTo += 1;
        }
      }

      joinedSession.mobs[mobIndex] = nextMob;

      const shellPatch =
        typeof nextMob.shellPostureMax === "number" && nextMob.shellPostureMax > 0
          ? {
              shellArchetype: nextMob.shellArchetype,
              shellPosture: nextMob.shellPosture ?? 0,
              shellPostureMax: nextMob.shellPostureMax,
              shellExposedHitsRemaining: nextMob.shellExposedHitsRemaining ?? 0,
              shellTag: nextMob.shellTag,
              shellPurePulseNext: nextMob.shellPurePulseNext === true,
              shellKillCreditExposed: nextMob.shellKillCreditExposed === true,
            }
          : {};

      const hpUpdated: ServerToClientMessage = {
        type: "mob_hp_updated",
        mobEntityId: nextMob.mobEntityId,
        hp: nextMob.hp,
        maxHp: nextMob.maxHp,
        ...shellPatch,
      };

      const combatEvent: CombatEventMessage = {
        type: "combat_event",
        mobEntityId: nextMob.mobEntityId,
        attackerClientId: attack.clientId,
        damage,
        effectiveDamage: effectiveHp,
        isCrit,
        ts: Date.now(),
      };

      broadcastSession(joinedSession, hpUpdated);
      broadcastSession(joinedSession, combatEvent);

      if (nextMob.hp <= 0) {
        if (!mobLedger.finalized) {
          mobLedger.finalized = true;

          const isBossMob = nextMob.mobLabel === "Void Boss";
          const zone = getZoneById(nextMob.zoneId);
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
            if (!p.killedMobs.has(nextMob.mobEntityId)) {
              p.killedMobs.add(nextMob.mobEntityId);
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

          if (nextMob.shellKillCreditExposed) {
            for (const [clientId, dealtDamage] of mobLedger.damageByClientId) {
              if (dealtDamage <= 0) continue;
              const pLedger =
                joinedSession.playerContribByClientId.get(clientId);
              if (pLedger) pLedger.exposedKills += 1;
            }
          }
        }

        const defeated: ServerToClientMessage = {
          type: "mob_defeated",
          mobEntityId: nextMob.mobEntityId,
          ts: Date.now(),
        };
        broadcastSession(joinedSession, defeated);
      }

      return;
    }
  });

  ws.on("close", () => {
    if (joinedClientId) {
      globalClients.delete(joinedClientId);
    }
    if (socialClientId && socialClientId !== joinedClientId) {
      globalClients.delete(socialClientId);
    }
    if (
      auctionClientId &&
      auctionClientId !== joinedClientId &&
      auctionClientId !== socialClientId
    ) {
      globalClients.delete(auctionClientId);
    }
    if (auctionClientId) {
      auctionClients.delete(auctionClientId);
      // Keep accounts/listings across disconnect for persistence + reconnect safety.
    }
    broadcastSocialRoster();
    if (!joinedSession || !joinedClientId) return;
    joinedSession.players.delete(joinedClientId);
    joinedSession.sockets.delete(joinedClientId);

    if (joinedSession.players.size <= 0) {
      joinedSession.emptySince = Date.now();
    }
  });
});

