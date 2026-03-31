import type {
  FactionAlignment,
  FieldLoadoutProfile,
  ResourceKey,
  ResourcesState,
} from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type VoidRealtimeClientId = string;

export type PlayerPresence = {
  clientId: VoidRealtimeClientId;
  playerName: string;
  factionAlignment: FactionAlignment;
  x: number; // percent [0..100]
  y: number; // percent [0..100]
  lastMoveAt: number;
  rankLevel: number;
  condition: number;
  zoneMasteryForZone: number;
  fieldLoadoutProfile?: FieldLoadoutProfile;
  runeDepthBySchool?: Partial<Record<RuneSchool, number>>;
  runeMinorsBySchool?: Partial<Record<RuneSchool, number>>;
};

export type MobEntity = {
  mobEntityId: string;
  zoneId: VoidZoneId;
  waveIndex: number;
  mobId: string;
  mobLabel: string;
  packSize: number;
  spawnedAt: number;

  hp: number;
  maxHp: number;

  x: number; // percent [0..100]
  y: number; // percent [0..100]

  // Client-enriched after mob_defeated; not sent by server.
  isBoss?: boolean;
  lootProfileId?: string;

  /**
   * M4 combat texture: posture/expose/archetype — shell drills + void WS mobs.
   */
  shellArchetype?: "skirmisher" | "bulwark" | "volatile" | "apex";
  /** Current posture 0..shellPostureMax */
  shellPosture?: number;
  shellPostureMax?: number;
  /** Hits remaining that deal expose damage (after posture breaks). */
  shellExposedHitsRemaining?: number;
  /** Short HUD tag: SKIRM · ARMOR · VOL · APEX */
  shellTag?: string;
  /** Pure shallow passive: next strike +10% after posture break. */
  shellPurePulseNext?: boolean;
  /** Any expose-window hit landed — hunt contribution may score exposed kills. */
  shellKillCreditExposed?: boolean;
};

/* =========================
 Client messages
========================= */
export type JoinSessionMessage = {
  type: "join_session";
  zoneId: VoidZoneId;
  sessionBucketId: number; // coarse realtime shard bucket
  clientId: VoidRealtimeClientId;
  playerName: string;
  factionAlignment: FactionAlignment;
  rankLevel: number;
  condition: number;
  zoneMasteryForZone: number;
  fieldLoadoutProfile?: FieldLoadoutProfile;
  runeDepthBySchool?: Partial<Record<RuneSchool, number>>;
  runeMinorsBySchool?: Partial<Record<RuneSchool, number>>;
};

export type MoveInputMessage = {
  type: "move_input";
  clientId: VoidRealtimeClientId;
  seq: number;
  ts: number;
  x: number; // percent [0..100]
  y: number; // percent [0..100]
};

export type AttackMobMessage = {
  type: "attack_mob";
  clientId: VoidRealtimeClientId;
  seq: number;
  ts: number;
  mobEntityId: string;
};

export type ChatChannel = "global" | "guild" | "dm";

export type SendChatMessage = {
  type: "send_chat";
  clientId: VoidRealtimeClientId;
  channel: ChatChannel;
  text: string;
  senderName: string;
  guildId?: string;
  toClientId?: VoidRealtimeClientId;
};

export type RegisterSocialMessage = {
  type: "register_social";
  clientId: VoidRealtimeClientId;
  playerName: string;
  guildId?: string | null;
};

export type AuctionItemTier = "T1" | "T2" | "T3" | "T4" | "T5";

export type AuctionItemType = "weapon" | "armor" | "rune-core" | "consumable";

export type AuctionItemSnapshot = {
  itemId: string;
  itemName: string;
  itemType: AuctionItemType;
  rarity: "Common" | "Uncommon" | "Rare";
  tier: AuctionItemTier;
};

export type RegisterAuctionMessage = {
  type: "register_auction";
  clientId: VoidRealtimeClientId;
  accountId: string;
  playerName: string;
  credits: number;
  craftedInventory: Record<string, number>;
};

export type AuctionCreateListingMessage = {
  type: "auction_create_listing";
  clientId: VoidRealtimeClientId;
  listing: AuctionItemSnapshot & {
    priceCredits: number;
  };
};

export type AuctionCancelListingMessage = {
  type: "auction_cancel_listing";
  clientId: VoidRealtimeClientId;
  listingId: string;
};

export type AuctionBuyListingMessage = {
  type: "auction_buy_listing";
  clientId: VoidRealtimeClientId;
  listingId: string;
};

export type ClientToServerMessage =
  | JoinSessionMessage
  | MoveInputMessage
  | AttackMobMessage
  | HuntStatusMessage
  | SendChatMessage
  | RegisterSocialMessage
  | RegisterAuctionMessage
  | AuctionCreateListingMessage
  | AuctionCancelListingMessage
  | AuctionBuyListingMessage;

/* =========================
 Server messages
========================= */
export type SessionStateMessage = {
  type: "session_state";
  zoneId: VoidZoneId;
  sessionBucketId: number;
  sessionStartedAt: number;
  players: PlayerPresence[];
  mobs: MobEntity[];
};

export type PlayersUpdatedMessage = {
  type: "players_updated";
  players: PlayerPresence[];
};

export type MobSpawnedMessage = {
  type: "mob_spawned";
  mob: MobEntity;
};

export type MobHpUpdatedMessage = {
  type: "mob_hp_updated";
  mobEntityId: string;
  hp: number;
  maxHp: number;
  /** M4 shell layer — present together when mob uses posture/expose. */
  shellArchetype?: MobEntity["shellArchetype"];
  shellPosture?: number;
  shellPostureMax?: number;
  /** 0 = not exposed (clears client strike window UI). */
  shellExposedHitsRemaining?: number;
  shellTag?: string;
  shellPurePulseNext?: boolean;
  shellKillCreditExposed?: boolean;
};

export type CombatEventMessage = {
  type: "combat_event";
  mobEntityId: string;
  attackerClientId: VoidRealtimeClientId;
  damage: number;
  /** HP loss after posture/expose mitigation (M4); omit = same as damage. */
  effectiveDamage?: number;
  isCrit: boolean;
  ts: number;
};

/** Authoritative void-field drops (server `rollVoidFieldLoot` — client applies path/mastery mult on pickup only). */
export type MobAuthoritativeLootLine = {
  resource: ResourceKey;
  amount: number;
};

export type AuthoritativeMobLootEvent = {
  mobEntityId: string;
  lines: MobAuthoritativeLootLine[];
  x: number;
  y: number;
};

export type MobDefeatedMessage = {
  type: "mob_defeated";
  mobEntityId: string;
  ts: number;
  /** Present for realtime mobs — replaces client-side death roll. */
  lootLines?: MobAuthoritativeLootLine[];
};

export type HuntStatus = "running" | "complete" | "paused";

export type HuntStatusMessage = {
  type: "hunt_status";
  clientId: VoidRealtimeClientId;
  status: HuntStatus;
  huntEndsAt: number | null;
  ts: number;
};

export type HuntContributionPerPlayer = {
  clientId: VoidRealtimeClientId;
  totalDamage: number;
  totalHits: number;
  mobsContributedTo: number;
  mobsKilled: number;
  /** M4: kills that had at least one expose-window hit (risk–reward scorer). */
  exposedKills?: number;
  bonusMultiplier: number;
  bossDefeated: boolean;
  bossDropResourcesBase: Partial<ResourcesState>;
};

export type HuntContributionResultMessage = {
  type: "hunt_contribution_result";
  zoneId: VoidZoneId;
  sessionBucketId: number;
  resolvedAt: number | null;
  perPlayer: HuntContributionPerPlayer[];
  ts: number;
};

export type ChatBroadcastMessage = {
  type: "chat_broadcast";
  channel: ChatChannel;
  fromClientId: VoidRealtimeClientId;
  senderName: string;
  text: string;
  guildId?: string;
  toClientId?: VoidRealtimeClientId;
  ts: number;
};

export type SocialRosterMessage = {
  type: "social_roster";
  players: Array<{
    clientId: VoidRealtimeClientId;
    playerName: string;
    guildId: string | null;
  }>;
  ts: number;
};

export type AuctionListingSnapshot = AuctionItemSnapshot & {
  listingId: string;
  sellerClientId: VoidRealtimeClientId;
  sellerAccountId: string;
  sellerName: string;
  priceCredits: number;
  createdAt: number;
};

export type AuctionListingsMessage = {
  type: "auction_listings";
  listings: AuctionListingSnapshot[];
  ts: number;
};

export type AuctionTradeEventMessage = {
  type: "auction_trade_event";
  status: "created" | "cancelled" | "sold" | "error";
  listingId?: string;
  actorClientId: VoidRealtimeClientId;
  reason?: string;
  ts: number;
};

export type AuctionAccountStateMessage = {
  type: "auction_account_state";
  clientId: VoidRealtimeClientId;
  credits: number;
  craftedInventory: Record<string, number>;
  ts: number;
};

export type AuctionHistoryEntry = {
  id: string;
  kind: "buy" | "sell" | "cancel" | "expire" | "error";
  listingId?: string;
  itemName?: string;
  itemTier?: AuctionItemTier;
  grossCredits?: number;
  payoutCredits?: number;
  counterpartName?: string;
  message: string;
  ts: number;
};

export type AuctionHistoryMessage = {
  type: "auction_history";
  clientId: VoidRealtimeClientId;
  entries: AuctionHistoryEntry[];
  ts: number;
};

export type ServerToClientMessage =
  | SessionStateMessage
  | PlayersUpdatedMessage
  | MobSpawnedMessage
  | MobHpUpdatedMessage
  | CombatEventMessage
  | MobDefeatedMessage
  | HuntContributionResultMessage
  | ChatBroadcastMessage
  | SocialRosterMessage
  | AuctionListingsMessage
  | AuctionTradeEventMessage
  | AuctionAccountStateMessage
  | AuctionHistoryMessage;

// (ClientToServerMessage declared above)

